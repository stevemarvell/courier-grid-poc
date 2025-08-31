// /src/app.ts
import type { SimConfig, SimResult, Position } from './types'
import { initShell } from './ui/shell'
import { renderKey } from './ui/key'
import { renderLog, pushLog } from './ui/log'
import { mountControls, setSeedInput } from './ui/controls'
import { runSimulation } from './sim'
import { render } from './renderer'
import { MultiReactiveSearcher } from './search'

const defaultCfg: SimConfig = {
  width: 50,
  height: 40,
  baseCount: 1,
  droneCount: 3,
  casualtyCount: 1,
  mean: 0,
  stdDev: 2,
  maxTranslation: 10,
  playbackTicksPerSec: 30,
  launchEveryTicks: 3,
  seed: undefined
}

export function boot() {
  const ui = initShell()
  ui.setTopBar('MASAR Demo')
  ui.setBottomBar(`© Steve Marvell ${new Date().getFullYear()}`)

  renderKey(ui.key)
  renderLog(ui.log)

  renderEmptyGrid(ui.canvas, defaultCfg)

  mountControls(ui.controls, defaultCfg, async (cfg) => {
    await runReactive(ui.canvas, ui.controls, ui.log, cfg)
  })
}

async function runReactive(
  canvas: HTMLCanvasElement,
  controlsEl: HTMLElement,
  logEl: HTMLElement,
  cfg: SimConfig
) {
  // seed: ensure, persist into form, log START seed
  if (cfg.seed == null) {
    const seed = genSeed()
    cfg.seed = seed
    setSeedInput(controlsEl, seed)
  }
  pushLog(logEl, `t: 0 START seed ${cfg.seed}`)

  const base = await runSimulation(cfg, {
    beforeSimStart: ({ cfg }) => fitCanvasToGrid(canvas, cfg)
  })
  if (!base.casualties.length) { render(canvas, base); pushLog(logEl, `t: 0 END`); return }

  const cas = base.casualties[0]
  const searcher = new MultiReactiveSearcher(
    cfg.width, cfg.height, cas.estimatedPosition, cfg.stdDev, cas.position
  )

  const view: SimResult = {
    ...base,
    drones: base.drones.map(d => ({ ...d })), // unspawned with launchAtTick set
    bases: base.bases.map(b => ({ ...b }))
  }

  let prev: number | null = null
  let tickAcc = 0
  let tick = 0

  const loop = (ts: number) => {
    if (prev == null) prev = ts
    const dt = ts - prev
    prev = ts

    tickAcc += (cfg.playbackTicksPerSec * dt) / 1000

    while (tickAcc >= 1) {
      tickAcc -= 1

      // 1) LAUNCH: launch due drones (log LAUNCH)
      let foundDroneId: number | null = null
      for (const d of view.drones) {
        if (!d.spawned && tick >= d.launchAtTick) {
          d.spawned = true
          d.path = [d.position]
          d.step = 0
          pushLog(logEl, `t: ${tick} LAUNCH drone #${d.id} base #${d.baseId}`)
          if (eq(d.position, cas.position)) foundDroneId = d.id
        }
      }

      // 2) Move each spawned drone one cell this tick
      if (foundDroneId == null) {
        const claimed = new Set<string>()
        for (const d of view.drones) {
          if (!d.spawned) continue
          const current = d.path![d.path!.length - 1]
          if (eq(current, cas.position)) { foundDroneId = d.id; continue }
          const next: Position = searcher.nextStep(current, claimed)
          d.path!.push(next)
          d.position = next
          d.step = d.path!.length - 1
          if (eq(next, cas.position)) foundDroneId = d.id
        }
      }

      // 3) FOUND → END
      if (foundDroneId != null) {
        pushLog(logEl, `t: ${tick} FOUND drone #${foundDroneId} casualty #${cas.id}`)
        render(canvas, view)
        pushLog(logEl, `t: ${tick} END`)
        return
      }

      tick += 1
    }

    render(canvas, view)
    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
}

function genSeed(): number {
  if (window.crypto && 'getRandomValues' in window.crypto) {
    const a = new Uint32Array(1)
    window.crypto.getRandomValues(a)
    return a[0] === 0 ? 1 : a[0]
  }
  return Math.floor(1 + Math.random() * 0x7ffffffe)
}

function eq(a: Position, b: Position) { return a.x === b.x && a.y === b.y }

function renderEmptyGrid(canvas: HTMLCanvasElement, cfg: SimConfig) {
  fitCanvasToGrid(canvas, cfg)
  const empty: SimResult = {
    width: cfg.width,
    height: cfg.height,
    bases: [],
    drones: [],
    casualties: []
  }
  render(canvas, empty)
}

function fitCanvasToGrid(canvas: HTMLCanvasElement, cfg: SimConfig) {
  const dpr = window.devicePixelRatio || 1
  const cssH = 800
  const cssW = Math.round(cssH * (cfg.width / cfg.height))
  canvas.style.width = cssW + 'px'
  canvas.style.height = cssH + 'px'
  canvas.width = Math.round(cssW * dpr)
  canvas.height = Math.round(cssH * dpr)
}
