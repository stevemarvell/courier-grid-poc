import { runSimulation, exportMetricsCsv, type SimConfig, type SimResult } from './sim'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

const $ = (id: string) => document.getElementById(id)! as HTMLElement
const getInput = <T extends HTMLInputElement | HTMLSelectElement>(id: string) => document.getElementById(id)! as T

const couriersEl = getInput<HTMLInputElement>('couriers')
const rateEl = getInput<HTMLInputElement>('orderRate')
const trafficEl = getInput<HTMLInputElement>('traffic')
const depotsEl = getInput<HTMLInputElement>('depots')
const coordEl = getInput<HTMLSelectElement>('coordination')
const batteryEl = getInput<HTMLInputElement>('battery')
const radiusEl = getInput<HTMLInputElement>('radius')
const horizonEl = getInput<HTMLInputElement>('horizon')
const warmupEl = getInput<HTMLInputElement>('warmup')
const dropEl = getInput<HTMLInputElement>('dropSeconds')
const cadenceEl = getInput<HTMLInputElement>('dispatchCadence')
const baseSpeedEl = getInput<HTMLInputElement>('baseSpeed')
const seedEl = getInput<HTMLInputElement>('seed')

const couriersLabel = $('couriersLabel')
const rateLabel = $('rateLabel')
const trafficLabel = $('trafficLabel')
const depotsLabel = $('depotsLabel')

function syncLabels() {
  couriersLabel.textContent = couriersEl.value
  rateLabel.textContent = rateEl.value
  trafficLabel.textContent = trafficEl.value
  depotsLabel.textContent = depotsEl.value
}
syncLabels()
;[couriersEl, rateEl, trafficEl, depotsEl].forEach(el => el.addEventListener('input', syncLabels))

const runBtn = $('runBtn') as HTMLButtonElement
const exportCsvBtn = $('exportCsvBtn') as HTMLButtonElement
const exportPngBtn = $('exportPngBtn') as HTMLButtonElement

const kpiAvg = $('kpiAvg')
const kpiP90 = $('kpiP90')
const kpiOnTime = $('kpiOnTime')
const kpiUtil = $('kpiUtil')
const kpiEnergy = $('kpiEnergy')
const kpiCong = $('kpiCong')
const kpiOrders = $('kpiOrders')
const kpiBacklog = $('kpiBacklog')
const kpiFill = $('kpiFill')
const kpiOnTimeIncl = $('kpiOnTimeIncl')

const kpiAvgSS = $('kpiAvgSS')
const kpiP90SS = $('kpiP90SS')
const kpiFillSS = $('kpiFillSS')
const kpiOnTimeInclSS = $('kpiOnTimeInclSS')
const kpiOrdersSS = $('kpiOrdersSS')

let currentResult: SimResult | null = null

runBtn.onclick = async () => {
  runBtn.disabled = true
  exportCsvBtn.disabled = true
  exportPngBtn.disabled = true

  const cfg: SimConfig = {
    gridSize: 20,
    horizonTicks: parseInt(horizonEl.value, 10),
    couriers: parseInt(couriersEl.value, 10),
    orderRatePerMin: parseFloat(rateEl.value),
    trafficMultiplier: parseFloat(trafficEl.value),
    depotCount: parseInt(depotsEl.value, 10),
    coordination: coordEl.value as 'greedy' | 'local_auction',
    batteryCapMin: parseFloat(batteryEl.value),
    commsRadius: parseInt(radiusEl.value, 10),
    seed: parseInt(seedEl.value, 10),
    dropSeconds: parseFloat(dropEl.value),
    dispatchCadenceSec: parseFloat(cadenceEl.value),
    baseSpeedCellsPerSec: parseFloat(baseSpeedEl.value),
    warmupSeconds: parseInt(warmupEl.value, 10)
  } as any

  currentResult = await runSimulation(cfg, frame => drawFrame(frame))

  kpiAvg.textContent = currentResult.kpis.avgDeliveryMin.toFixed(1)
  kpiP90.textContent = currentResult.kpis.p90DeliveryMin.toFixed(1)
  kpiOnTime.textContent = (currentResult.kpis.onTimePct * 100).toFixed(0)
  kpiUtil.textContent = (currentResult.kpis.utilisationPct * 100).toFixed(1)
  kpiEnergy.textContent = currentResult.kpis.energyKwh.toFixed(2)
  kpiCong.textContent = currentResult.kpis.congestionIndex.toFixed(2)
  kpiOrders.textContent = `${currentResult.kpis.ordersServed}/${currentResult.kpis.ordersCreated}`
  kpiBacklog.textContent = String(currentResult.kpis.backlog)
  kpiFill.textContent = (currentResult.kpis.fillRatePct * 100).toFixed(0)
  kpiOnTimeIncl.textContent = (currentResult.kpis.onTimeInclUnservedPct * 100).toFixed(0)

  kpiAvgSS.textContent = currentResult.kpis.avgDeliveryMinSS.toFixed(1)
  kpiP90SS.textContent = currentResult.kpis.p90DeliveryMinSS.toFixed(1)
  kpiFillSS.textContent = (currentResult.kpis.fillRatePctSS * 100).toFixed(0)
  kpiOnTimeInclSS.textContent = (currentResult.kpis.onTimeInclUnservedPctSS * 100).toFixed(0)
  kpiOrdersSS.textContent = `${currentResult.kpis.ordersServedSS}/${currentResult.kpis.ordersCreatedSS}`

  exportCsvBtn.disabled = false
  exportPngBtn.disabled = false
  runBtn.disabled = false
}

exportCsvBtn.onclick = () => {
  if (!currentResult) return
  const csv = exportMetricsCsv(currentResult)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `metrics_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

exportPngBtn.onclick = () => {
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `frame_${Date.now()}.png`
  a.click()
}

function drawFrame(frame: SimResult['frames'][number]) {
  const { gridSize, depots, couriers, orders } = frame
  const W = canvas.width, H = canvas.height
  const cell = Math.min(W, H) / gridSize

  ctx.clearRect(0, 0, W, H)

  ctx.strokeStyle = '#14202b'
  ctx.lineWidth = 1
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * cell + 0.5); ctx.lineTo(W, i * cell + 0.5); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(i * cell + 0.5, 0); ctx.lineTo(i * cell + 0.5, H); ctx.stroke()
  }

  ctx.fillStyle = '#2dd4bf'
  depots.forEach(d => ctx.fillRect(d.x * cell + cell * 0.3, d.y * cell + cell * 0.3, cell * 0.4, cell * 0.4))

  ctx.fillStyle = '#ef4444'
  orders.forEach(o => { if (!o.servedTick) ctx.fillRect(o.x * cell + cell * 0.25, o.y * cell + cell * 0.25, cell * 0.5, cell * 0.5) })

  couriers.forEach(c => {
    ctx.beginPath()
    ctx.arc((c.x + 0.5) * cell, (c.y + 0.5) * cell, cell * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = c.state === 'serving' ? '#60a5fa' : c.state === 'toDepot' ? '#f59e0b' : '#94a3b8'
    ctx.fill()
  })
}
