// /src/sim.ts
import type {
  SimConfig,
  SimHooks,
  SimResult,
  SimState,
  Base,
  Drone,
  Casualty,
  Position
} from './types'
import { randomNormal, randomLcg } from 'd3-random'
import { randomNearbyPosition } from './randomNearbyPosition'

function makeRng(seed?: number) {
  const source = seed == null ? null : randomLcg(seed)
  const u = () => (source ? source() : Math.random())
  return {
    int: (max: number) => Math.floor(u() * max),
    normal: (mean: number, std: number) =>
      (source ? randomNormal.source(source)(mean, std) : randomNormal(mean, std))(),
    uniform: u
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}
function rowFromBottom(fracUp: number, height: number) {
  return clamp(Math.floor((1 - fracUp) * (height - 1)), 0, height - 1)
}
function colAtFrac(fracAcross: number, width: number) {
  return clamp(Math.floor(fracAcross * (width - 1)), 0, width - 1)
}
function uniqByPos<T extends { position: Position }>(arr: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const it of arr) {
    const k = `${it.position.x},${it.position.y}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(it)
  }
  return out
}

/**
 * Ordered base slots (max 7):
 * 1) bottom center
 * 2) left edge, 1/3 up from bottom
 * 3) right edge, 1/3 up from bottom
 * 4) bottom, 1/4 across
 * 5) bottom, 3/4 across
 * 6) left edge, 1/6 up from bottom
 * 7) right edge, 1/6 up from bottom
 */
function baseSlots(width: number, height: number): Position[] {
  return [
    { x: Math.floor(width / 2), y: height - 1 },
    { x: 0, y: rowFromBottom(1 / 3, height) },
    { x: width - 1, y: rowFromBottom(1 / 3, height) },
    { x: colAtFrac(1 / 4, width), y: height - 1 },
    { x: colAtFrac(3 / 4, width), y: height - 1 },
    { x: 0, y: rowFromBottom(1 / 6, height) },
    { x: width - 1, y: rowFromBottom(1 / 6, height) }
  ]
}

export async function runSimulation(cfg: SimConfig, hooks?: Partial<SimHooks>): Promise<SimResult> {
  const rng = makeRng(cfg.seed)

  // Bases: first N unique slots (N<=7)
  const slots = baseSlots(cfg.width, cfg.height)
  const MAX_BASES = 7
  const want = clamp(cfg.baseCount, 1, MAX_BASES)
  const picked = uniqByPos(
    slots.slice(0, Math.min(want, slots.length)).map((p, i) => ({ id: i + 1, position: p }))
  )

  // Distribute drone capacity across bases
  const bases: Base[] = []
  const n = picked.length
  const per = Math.floor(cfg.droneCount / n)
  const extra = cfg.droneCount % n
  for (let i = 0; i < n; i++) {
    const cap = per + (i < extra ? 1 : 0)
    bases.push({
      id: picked[i].id,
      position: picked[i].position,
      capacity: cap,
      unspawned: cap
    })
  }

  // Casualties
  const casualties: Casualty[] = []
  for (let i = 0; i < cfg.casualtyCount; i++) {
    const estimatedPosition: Position = {
      x: rng.int(cfg.width),
      y: rng.int(Math.floor(cfg.height * 0.66))
    }
    const derivedSeed = cfg.seed == null ? undefined : cfg.seed + i * 9973
    const position: Position = randomNearbyPosition(
      estimatedPosition,
      cfg.stdDev,
      { width: cfg.width, height: cfg.height },
      cfg.maxTranslation,
      cfg.maxTranslation,
      derivedSeed
    )
    casualties.push({ id: i + 1, estimatedPosition, position })
  }

  // Drones: assign to bases; schedule per-base cadence
  const drones: Drone[] = []
  if (cfg.droneCount > 0 && bases.length > 0) {
    const remaining = bases.map(b => b.capacity)
    const assignedOrdinal = bases.map(() => 0) // per-base 0,1,2,... order
    const gap = Math.max(1, cfg.launchEveryTicks)

    let idx = 0
    for (let d = 0; d < cfg.droneCount; d++) {
      // find next base with remaining cap (round-robin)
      let bIdx = -1
      for (let t = 0; t < bases.length; t++) {
        const i = (idx + t) % bases.length
        if (remaining[i] > 0) { bIdx = i; break }
      }
      if (bIdx === -1) bIdx = 0

      const ord = assignedOrdinal[bIdx]           // 0 for first drone at this base
      assignedOrdinal[bIdx] = ord + 1
      remaining[bIdx]--

      const spawn = bases[bIdx].position
      drones.push({
        id: d + 1,
        baseId: bases[bIdx].id,
        position: spawn,
        spawned: false,
        // per-base schedule: first at tick=gap, then 2*gap, 3*gap, ...
        launchAtTick: (ord + 1) * gap,
        path: undefined,
        step: undefined
      })

      idx = (bIdx + 1) % bases.length
    }
  }

  const state: SimState = { bases, drones, casualties }

  if (hooks?.beforeSimStart) await hooks.beforeSimStart({ cfg, state })
  if (hooks?.afterSimStart) await hooks.afterSimStart({ cfg, state })

  return {
    width: cfg.width,
    height: cfg.height,
    bases: state.bases,
    drones: state.drones,
    casualties: state.casualties
  }
}
