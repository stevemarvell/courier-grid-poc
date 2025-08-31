// /src/app.ts
import type { SimConfig, SimResult, Position } from './types'
import { initShell } from './ui/shell'
import { renderKey } from './ui/key'
import { mountConfig } from './ui/configPanel'
import { runSimulation } from './sim'
import { render } from './renderer'
import { MultiReactiveSearcher } from './search'

const defaultCfg: SimConfig = {
  width: 50,
  height: 40,
  baseCount: 1,
  droneCount: 3, // multiple drones
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

  renderEmptyGrid(ui.canvas, defaultCfg)

  mountConfig(ui.config, defaultCfg, async (cfg) => {
    await runReactive(ui.canvas, cfg)
  })
}

async function runReactive(canvas: HTMLCanvasElement, cfg: SimConfig) {
  const base = await runSimulation(cfg, {
    beforeSimStart: ({ cfg }) => fitCanvasToGrid(canvas, cfg)
  })

  if (!base.casualties.length) { render(canvas, base); return }

  const cas = base.casualties[0]
  const searcher = new MultiReactiveSearcher(cfg.width, cfg.height, cas.estimatedPosition, cfg.stdDev, cas.position)

  const view: SimResult = {
    ...base,
    drones: base.drones.map(d => ({ ...d, step: 0, path: d.path ?? [d.position] }))
  }

  const stepMs = 40
  let prev: number | null = null
  let acc = 0

  const loop = (ts: number) => {
    if (prev == null) prev = ts
    acc += ts - prev
    prev = ts

    while (acc >= stepMs) {
      acc -= stepMs

      // stop if any drone is on casualty cell
      if (view.drones.some(d => d.position.x === cas.position.x && d.position.y === cas.position.y)) {
        render(canvas, view)
        return
      }

      const claimed = new Set<string>()
      for (const d of view.drones) {
        const current = d.path![d.path!.length - 1]
        if (current.x === cas.position.x && current.y === cas.position.y) continue
        const next: Position = searcher.nextStep(current, claimed)
        d.path!.push(next)
        d.position = next
        d.step = d.path!.length - 1
      }
    }

    render(canvas, view)
    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
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
