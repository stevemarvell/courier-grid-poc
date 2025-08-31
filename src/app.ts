// /src/app.ts
import type { SimConfig, SimResult, Position } from './types'
import { initShell } from './ui/shell'
import { renderKey } from './ui/key'
import { mountConfig } from './ui/configPanel'
import { runSimulation } from './sim'
import { render } from './renderer'
import { ReactiveSearcher } from './search'

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
    await runReactive(ui.canvas, cfg)
  })
}

async function runReactive(canvas: HTMLCanvasElement, cfg: SimConfig) {
  const baseResult = await runSimulation(cfg, {
    beforeSimStart: ({ cfg }) => fitCanvasToGrid(canvas, cfg)
  })

  if (!baseResult.bases.length || !baseResult.casualties.length) {
    render(canvas, baseResult)
    return
  }

  // Build reactive searcher
  const start = baseResult.bases[0].position
  const cas = baseResult.casualties[0]
  const searcher = new ReactiveSearcher(cfg.width, cfg.height, cas.estimatedPosition, cfg.stdDev, cas.position)

  // Local view state: extend drone with a growing path
  const view: SimResult = {
    ...baseResult,
    drones: [
      {
        id: 1,
        spawned: true,
        position: start,
        path: [start],
        step: 0
      }
    ]
  }

  const stepMs = 40
  let prev: number | null = null
  let acc = 0

  const loop = (ts: number) => {
    if (prev == null) prev = ts
    acc += ts - prev
    prev = ts

    // advance in fixed increments to keep speed stable
    while (acc >= stepMs) {
      acc -= stepMs

      const drone = view.drones[0]
      const current = drone.path![drone.path!.length - 1]
      if (current.x === cas.position.x && current.y === cas.position.y) {
        // found; render final state once and stop
        drone.position = current
        drone.step = drone.path!.length - 1
        render(canvas, view)
        return
      }

      const next: Position = searcher.nextStep(current)
      drone.path!.push(next)
      drone.position = next
      drone.step = drone.path!.length - 1
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
