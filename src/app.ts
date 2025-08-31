// /src/app.ts
import type { SimConfig } from './types'
import { initShell } from './ui/shell'
import { renderKey } from './ui/key'
import { mountConfig } from './ui/configPanel'
import { runSimulation } from './sim'
import { render } from './renderer'

const defaultCfg: SimConfig = {
  width: 50,
  height: 40,
  baseCount: 1,
  droneCount: 4,
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

  const rerun = async (cfg: SimConfig) => {
    const result = await runSimulation(cfg, {
      beforeSimStart: ({ cfg }) => fitCanvasToGrid(ui.canvas, cfg)
    })
    render(ui.canvas, result)
  }

  mountConfig(ui.config, defaultCfg, rerun)
  rerun(defaultCfg)
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
