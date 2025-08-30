export type Coordination = 'greedy' | 'local_auction'

export interface SimConfig {
    gridSize: number
    horizonTicks: number           // seconds
    couriers: number
    orderRatePerMin: number        // λ
    trafficMultiplier: number      // ≥1 slows down
    depotCount: number
    coordination: Coordination
    batteryCapMin: number
    commsRadius: number            // cells
    seed: number
    dropSeconds: number            // service time at drop
    dispatchCadenceSec: number     // 0 = every tick
    baseSpeedCellsPerSec: number   // free-flow speed
    warmupSeconds: number          // ignore early orders for steady-state KPIs
}

export interface Node { x: number; y: number }

export interface Order extends Node {
    id: number
    spawnTick: number
    assigned: boolean
    assignedTick?: number
    servedTick?: number
}

export type CourierState = 'idle' | 'serving' | 'toDepot'

export interface Courier extends Node {
    state: CourierState
    target?: Node
    path: Node[]
    progress: number
    busyTicks: number
    totalTicks: number
    batterySec: number
    distance: number               // cells traversed
    svcTicks?: number              // service countdown (sec)
}

export interface Frame {
    tick: number
    gridSize: number
    depots: Node[]
    couriers: Array<{ x: number; y: number; state: CourierState }>
    orders: Array<{ x: number; y: number; servedTick?: number }>
}

export interface KPIs {
    avgDeliveryMin: number
    p90DeliveryMin: number
    onTimePct: number
    utilisationPct: number
    energyKwh: number
    congestionIndex: number
    ordersCreated: number
    ordersServed: number
    backlog: number
    fillRatePct: number
    onTimeInclUnservedPct: number
    // steady-state
    avgDeliveryMinSS: number
    p90DeliveryMinSS: number
    ordersCreatedSS: number
    ordersServedSS: number
    backlogSS: number
    fillRatePctSS: number
    onTimeInclUnservedPctSS: number
}

export interface SimResult {
    frames: Frame[]
    kpis: KPIs
    config: SimConfig
}

/* ---------- Hooks ---------- */
export interface SimHooks {
    beforeSimStart?(ctx: { cfg: SimConfig }): void | Promise<void>
    afterSimStart?(ctx: { cfg: SimConfig }): void | Promise<void>
    beforeSimEnd?(ctx: { cfg: SimConfig }): void | Promise<void>
    afterSimEnd?(ctx: { cfg: SimConfig; result: SimResult }): void | Promise<void>
    beforeSpawn?(ctx: { tick: number; x: number; y: number; cfg: SimConfig }): void | Promise<void>
    afterSpawn?(ctx: { tick: number; order: Readonly<Order>; cfg: SimConfig }): void | Promise<void>
    beforeDispatch?(ctx: { tick: number; cfg: SimConfig }): void | Promise<void>
    afterDispatch?(ctx: { tick: number; cfg: SimConfig }): void | Promise<void>
    beforeArrival?(ctx: { tick: number; courier: Readonly<Courier>; order: Readonly<Order>; cfg: SimConfig }): void | Promise<void>
    afterServiceComplete?(ctx: { tick: number; courier: Readonly<Courier>; order: Readonly<Order>; cfg: SimConfig }): void | Promise<void>
}

/* ---------- RNG ---------- */
class RNG {
    private s: number
    constructor(seed: number) { this.s = seed >>> 0 }
    next(): number {
        let x = this.s
        x ^= (x << 13) >>> 0
        x ^= (x >>> 17)
        x ^= (x << 5) >>> 0
        this.s = x >>> 0
        return this.s / 0xFFFFFFFF
    }
    int(n: number): number { return Math.floor(this.next() * n) }
    chance(p: number): boolean { return this.next() < p }
}

/* ---------- Helpers (memoized) ---------- */
function keyFor(a: Node, b: Node): string {
    return a.x < b.x || (a.x === b.x && a.y <= b.y)
        ? `${a.x},${a.y}|${b.x},${b.y}`
        : `${b.x},${b.y}|${a.x},${a.y}`
}

function makeDistanceCache() {
    const cache = new Map<string, number>()
    return (a: Node, b: Node): number => {
        const k = keyFor(a, b)
        let v = cache.get(k)
        if (v === undefined) {
            v = Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
            cache.set(k, v)
        }
        return v
    }
}

function makePathCache() {
    const cache = new Map<string, ReadonlyArray<Node>>()
    return (a: Node, b: Node): Node[] => {
        const k = keyFor(a, b)
        let v = cache.get(k)
        if (!v) {
            const path: Node[] = []
            let x = a.x, y = a.y
            while (x !== b.x) { x += x < b.x ? 1 : -1; path.push({ x, y }) }
            while (y !== b.y) { y += y < b.y ? 1 : -1; path.push({ x, y }) }
            v = path
            cache.set(k, v)
        }
        return v.slice()
    }
}

function precomputeNearestDepotLookup(gridSize: number, depots: Node[], dist: (a: Node, b: Node) => number) {
    const nearest: Node[][] = Array.from({ length: gridSize }, () => Array<Node>(gridSize))
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const p: Node = { x, y }
            let best = depots[0]
            let bestd = dist(p, best)
            for (let i = 1; i < depots.length; i++) {
                const d = dist(p, depots[i])
                if (d < bestd) { bestd = d; best = depots[i] }
            }
            nearest[y][x] = best
        }
    }
    return (p: Node) => nearest[p.y][p.x]
}

/* ---------- Depot placement ---------- */
function placeDepots(n: number, grid: number): Node[] {
    const spots: Node[] = [{ x: 1, y: 1 }, { x: grid - 2, y: 1 }, { x: 1, y: grid - 2 }, { x: grid - 2, y: grid - 2 }]
    const count = Math.max(1, Math.min(4, n))
    return spots.slice(0, count)
}

/* ---------- Sim ---------- */
export async function runSimulation(
    cfg: SimConfig,
    onFrame: (f: Frame) => void,
    hooks?: Partial<SimHooks>
): Promise<SimResult> {
    const rng = new RNG(cfg.seed)
    const depots: Node[] = placeDepots(cfg.depotCount, cfg.gridSize)

    const distanceInCells = makeDistanceCache()
    const pathBetweenCells = makePathCache()
    const nearestDepotOf = precomputeNearestDepotLookup(cfg.gridSize, depots, distanceInCells)

    const freeFlow = Math.max(0.05, cfg.baseSpeedCellsPerSec)
    const speedCellsPerSec = freeFlow / Math.max(1, cfg.trafficMultiplier)
    const secsForCells = (cells: number) => cells / Math.max(0.1, speedCellsPerSec)

    const cadence = Math.max(0, Math.trunc(cfg.dispatchCadenceSec))
    const ticks = cfg.horizonTicks
    const warmStart = Math.max(0, Math.trunc(cfg.warmupSeconds))

    if (hooks?.beforeSimStart) await hooks.beforeSimStart({ cfg })

    const couriers: Courier[] = Array.from({ length: cfg.couriers }, (_, i) => {
        const home = depots[i % depots.length]
        return {
            x: home.x, y: home.y,
            state: 'idle',
            target: undefined,
            path: [],
            progress: 0,
            busyTicks: 0,
            totalTicks: 0,
            batterySec: Math.trunc(cfg.batteryCapMin * 60),
            distance: 0
        }
    })

    const orders: Order[] = []
    let nextOrderId = 1
    const spawnProbability = cfg.orderRatePerMin / 60

    const edgeCounts = new Map<string, number>()
    const frames: Frame[] = []

    if (hooks?.afterSimStart) await hooks.afterSimStart({ cfg })

    for (let tick = 0; tick < ticks; tick++) {
        // spawn
        if (rng.chance(spawnProbability)) {
            const x = rng.int(cfg.gridSize), y = rng.int(cfg.gridSize)
            if (hooks?.beforeSpawn) await hooks.beforeSpawn({ tick, x, y, cfg })
            const order: Order = { id: nextOrderId++, x, y, spawnTick: tick, assigned: false }
            orders.push(order)
            if (hooks?.afterSpawn) await hooks.afterSpawn({ tick, order, cfg })
        }

        // assign (cadence==0 => every tick)
        if (cadence === 0 || tick % cadence === 0) {
            if (hooks?.beforeDispatch) await hooks.beforeDispatch({ tick, cfg })

            if (cfg.coordination === 'greedy') {
                for (const courier of couriers) {
                    if (courier.state !== 'idle') continue
                    let nearestOrder: Order | undefined
                    let smallestDistanceCells = Number.POSITIVE_INFINITY
                    for (const order of orders) {
                        if (order.servedTick !== undefined || order.assigned) continue
                        const dCells = distanceInCells(courier, order)
                        if (dCells < smallestDistanceCells) { smallestDistanceCells = dCells; nearestOrder = order }
                    }
                    if (nearestOrder) {
                        nearestOrder.assigned = true
                        nearestOrder.assignedTick = tick
                        courier.state = 'serving'
                        courier.path = pathBetweenCells(courier, nearestOrder)
                        courier.target = { x: nearestOrder.x, y: nearestOrder.y }
                    }
                }
            } else {
                for (const order of orders) {
                    if (order.servedTick !== undefined || order.assigned) continue

                    // Only idle couriers can bid
                    let bestCourier: Courier | undefined
                    let bestEtaSec = Number.POSITIVE_INFINITY
                    for (const courier of couriers) {
                        if (courier.state !== 'idle') continue
                        const dCells = distanceInCells(courier, order)
                        if (dCells > cfg.commsRadius) continue
                        const etaSec = secsForCells(dCells)
                        if (etaSec < bestEtaSec) { bestEtaSec = etaSec; bestCourier = courier }
                    }
                    // Fallback: nearest idle anywhere
                    if (!bestCourier) {
                        for (const courier of couriers) {
                            if (courier.state !== 'idle') continue
                            const dCells = distanceInCells(courier, order)
                            const etaSec = secsForCells(dCells)
                            if (etaSec < bestEtaSec) { bestEtaSec = etaSec; bestCourier = courier }
                        }
                    }
                    if (bestCourier) {
                        order.assigned = true
                        order.assignedTick = tick
                        bestCourier.state = 'serving'
                        bestCourier.path = pathBetweenCells(bestCourier, order)
                        bestCourier.target = { x: order.x, y: order.y }
                    }
                }
            }

            if (hooks?.afterDispatch) await hooks.afterDispatch({ tick, cfg })
        }

        // move + state
        for (const courier of couriers) {
            courier.totalTicks++
            courier.batterySec = Math.max(0, courier.batterySec - 1)
            if (courier.state === 'serving') courier.busyTicks++

            // low battery → try to finish, else requeue and peel off
            if ((courier.state === 'idle' || courier.state === 'serving') && courier.batterySec <= 300 && courier.state !== 'toDepot') {
                let shouldPreempt = true
                if (courier.state === 'serving' && courier.target) {
                    const serviceRemaining = courier.svcTicks ?? Math.max(0, Math.trunc(cfg.dropSeconds))
                    const travelToTargetSec = secsForCells(courier.path.length)
                    const depotAfter = nearestDepotOf(courier.target)
                    const travelFromTargetToDepotSec = secsForCells(distanceInCells(courier.target, depotAfter))
                    const needed = travelToTargetSec + serviceRemaining + travelFromTargetToDepotSec + 15
                    if (courier.batterySec > needed) {
                        shouldPreempt = false
                    } else {
                        const o = orders.find(o => !o.servedTick && o.x === courier.target!.x && o.y === courier.target!.y)
                        if (o) { o.assigned = false; o.assignedTick = undefined }
                    }
                }
                if (shouldPreempt) {
                    const depot = nearestDepotOf(courier)
                    courier.state = 'toDepot'
                    courier.path = pathBetweenCells(courier, depot)
                    courier.target = depot
                }
            }

            if (courier.path.length > 0) {
                courier.progress += speedCellsPerSec
                while (courier.progress >= 1 && courier.path.length > 0) {
                    const next = courier.path.shift() as Node
                    courier.distance += 1
                    courier.x = next.x
                    courier.y = next.y
                    courier.progress -= 1
                    const edgeKey = `${courier.x},${courier.y}->${next.x},${next.y}`
                    edgeCounts.set(edgeKey, (edgeCounts.get(edgeKey) ?? 0) + 1)
                }
            } else {
                if (courier.state === 'serving' && courier.target) {
                    const order = orders.find(o => o.servedTick === undefined && o.x === courier.target!.x && o.y === courier.target!.y)
                    if (order) {
                        if (courier.svcTicks == null) {
                            if (hooks?.beforeArrival) await hooks.beforeArrival({ tick, courier, order, cfg })
                            courier.svcTicks = Math.max(0, Math.trunc(cfg.dropSeconds))
                        }
                        if (courier.svcTicks > 0) { courier.svcTicks--; continue }
                        order.servedTick = tick
                        courier.svcTicks = undefined
                        if (hooks?.afterServiceComplete) await hooks.afterServiceComplete({ tick, courier, order, cfg })
                    }
                    courier.state = 'idle'
                    courier.target = undefined
                } else if (courier.state === 'toDepot' && courier.target) {
                    if (courier.x === courier.target.x && courier.y === courier.target.y) {
                        courier.batterySec = Math.trunc(cfg.batteryCapMin * 60)
                        courier.state = 'idle'
                        courier.target = undefined
                    }
                }
            }
        }

        if (tick % 5 === 0) {
            const frame: Frame = {
                tick,
                gridSize: cfg.gridSize,
                depots,
                couriers: couriers.map(c => ({ x: c.x, y: c.y, state: c.state })),
                orders: orders.map(o => ({ x: o.x, y: o.y, servedTick: o.servedTick }))
            }
            frames.push(frame)
            await new Promise<void>(r => setTimeout(r, 0))
            onFrame(frame)
        }
    }

    if (hooks?.beforeSimEnd) await hooks.beforeSimEnd({ cfg })

    // KPIs — all orders
    const delivered = orders.filter(o => o.servedTick !== undefined)
    const timesMin = delivered.map(o => ((o.servedTick as number) - o.spawnTick) / 60).sort((a, b) => a - b)
    const avg = timesMin.length ? timesMin.reduce((a, b) => a + b, 0) / timesMin.length : 0
    const p90 = timesMin.length ? timesMin[Math.floor(0.9 * (timesMin.length - 1))] : 0
    const onTimeServed = timesMin.length ? timesMin.filter(x => x <= 15).length / timesMin.length : 0
    const created = orders.length
    const served = delivered.length
    const backlog = created - served
    const fillRate = created ? served / created : 0
    const onTimeInclUnserved = created ? (served ? timesMin.filter(x => x <= 15).length / created : 0) : 0

    // KPIs — steady-state (spawn at/after warmStart)
    const eligibleSS = orders.filter(o => o.spawnTick >= warmStart)
    const deliveredSS = eligibleSS.filter(o => o.servedTick !== undefined)
    const timesMinSS = deliveredSS.map(o => ((o.servedTick as number) - o.spawnTick) / 60).sort((a, b) => a - b)
    const avgSS = timesMinSS.length ? timesMinSS.reduce((a, b) => a + b, 0) / timesMinSS.length : 0
    const p90SS = timesMinSS.length ? timesMinSS[Math.floor(0.9 * (timesMinSS.length - 1))] : 0
    const createdSS = eligibleSS.length
    const servedSS = deliveredSS.length
    const backlogSS = createdSS - servedSS
    const fillRateSS = createdSS ? servedSS / createdSS : 0
    const onTimeInclUnservedSS = createdSS ? (servedSS ? timesMinSS.filter(x => x <= 15).length / createdSS : 0) : 0

    const utilisation = couriers.length
        ? (couriers.reduce((acc, cur) => acc + cur.busyTicks, 0) / couriers.reduce((acc, cur) => acc + cur.totalTicks, 0))
        : 0
    const energyKwh = couriers.reduce((acc, cur) => acc + cur.distance * 0.0002, 0)
    const totalEdges = Array.from(edgeCounts.values()).reduce((a, b) => a + b, 0)
    const uniqueEdges = edgeCounts.size || 1
    const congestionIndex = (totalEdges / uniqueEdges) / 10

    const kpis: KPIs = {
        avgDeliveryMin: avg,
        p90DeliveryMin: p90,
        onTimePct: onTimeServed,
        utilisationPct: utilisation,
        energyKwh,
        congestionIndex,
        ordersCreated: created,
        ordersServed: served,
        backlog,
        fillRatePct: fillRate,
        onTimeInclUnservedPct: onTimeInclUnserved,
        avgDeliveryMinSS: avgSS,
        p90DeliveryMinSS: p90SS,
        ordersCreatedSS: createdSS,
        ordersServedSS: servedSS,
        backlogSS,
        fillRatePctSS: fillRateSS,
        onTimeInclUnservedPctSS: onTimeInclUnservedSS
    }

    const result: SimResult = { frames, kpis, config: cfg }

    if (hooks?.afterSimEnd) await hooks.afterSimEnd({ cfg, result })

    return result
}

/* ---------- CSV export ---------- */
export function exportMetricsCsv(res: SimResult): string {
    const { kpis, config } = res
    const header = 'metric,value'
    const metricLines = [
        ['avg_delivery_min', kpis.avgDeliveryMin.toFixed(3)],
        ['p90_delivery_min', kpis.p90DeliveryMin.toFixed(3)],
        ['on_time_pct', (kpis.onTimePct * 100).toFixed(1)],
        ['utilisation_pct', (kpis.utilisationPct * 100).toFixed(1)],
        ['energy_kwh', kpis.energyKwh.toFixed(4)],
        ['congestion_index', kpis.congestionIndex.toFixed(3)],
        ['orders_created', String(kpis.ordersCreated)],
        ['orders_served', String(kpis.ordersServed)],
        ['backlog', String(kpis.backlog)],
        ['fill_rate_pct', (kpis.fillRatePct * 100).toFixed(1)],
        ['on_time_incl_unserved_pct', (kpis.onTimeInclUnservedPct * 100).toFixed(1)],
        // steady-state
        ['avg_delivery_min_ss', kpis.avgDeliveryMinSS.toFixed(3)],
        ['p90_delivery_min_ss', kpis.p90DeliveryMinSS.toFixed(3)],
        ['orders_created_ss', String(kpis.ordersCreatedSS)],
        ['orders_served_ss', String(kpis.ordersServedSS)],
        ['backlog_ss', String(kpis.backlogSS)],
        ['fill_rate_pct_ss', (kpis.fillRatePctSS * 100).toFixed(1)],
        ['on_time_incl_unserved_pct_ss', (kpis.onTimeInclUnservedPctSS * 100).toFixed(1)],
    ].map(([k, v]) => `${k},${v}`)

    const cfgHeader = 'config_key,config_value'
    const cfgLines = Object.entries(config).map(([k, v]) => `${k},${String(v)}`)

    return [header, ...metricLines, '', cfgHeader, ...cfgLines].join('\n')
}
