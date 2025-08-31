// /src/app.ts
import type { SimConfig, SimResult } from './types'
import { initShell } from './ui/shell'
import { renderKey } from './ui/key'
import { mountConfig } from './ui/configPanel'
import { runSimulation } from './sim'
import { render } from './renderer'

const defaultCfg: SimConfig = {
  width: 50,
  height: 40,
  baseCount: 1,
  droneCount: 1,
  casualtyCount: 1,
  mean: 0,
  stdDev: 2,
  maxTranslation: 10,
  seed: undefined
}

export function boot() {
  const ui = initShell()
  ui.setTopBar('MASAR Demo')
  ui.setBottomBar(`© Steve Marvell ${new Date().getFullYear()}`)
  renderKey(ui.key)

  // draw grid only until user runs
  renderEmptyGrid(ui.canvas, defaultCfg)

  mountConfig(ui.config, defaultCfg, async (cfg) => {
    await rerun(ui.canvas, cfg)
  })
}

async function rerun(canvas: HTMLCanvasElement, cfg: SimConfig) {
  const result = await runSimulation(cfg, {
    beforeSimStart: ({ cfg }) => fitCanvasToGrid(canvas, cfg)
  })

  const d = result.drones[0]
  if (!d || !d.path || d.path.length < 2) {
    render(canvas, result)
    return
  }

  let i = 0
  const last = d.path.length - 1
  const stepMs = 30

  const tick = (t0: number) => (now: number) => {
    i = Math.min(last, Math.floor((now - t0) / stepMs))
    const view: SimResult = {
      ...result,
      drones: result.drones.map(dr => dr.id === d.id ? { ...dr, step: i } : dr)
    }
    render(canvas, view)
    if (i < last) requestAnimationFrame(tick(t0))
  }
  requestAnimationFrame(t0 => requestAnimationFrame(tick(t0)))
}

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
