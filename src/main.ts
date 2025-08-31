// /src/main.ts
import { runSimulation } from './sim'
import { render } from './renderer'
import type { SimConfig } from './types'

// Grab DOM nodes with null checks
const _canvas = document.getElementById('main-canvas') as HTMLCanvasElement | null
const _sidebar = document.getElementById('sidebar-key') as HTMLDivElement | null
const _topBar = document.getElementById('top-bar') as HTMLDivElement | null
const _bottomBar = document.getElementById('bottom-bar') as HTMLDivElement | null
const _configForm = document.getElementById('sidebar-config') as HTMLDivElement | null

function assertEl<T>(el: T | null, name: string): T {
  if (!el) throw new Error(`Missing DOM element: ${name}`)
  return el
}

const canvas = assertEl(_canvas, 'main-canvas')
const sidebar = assertEl(_sidebar, 'sidebar-key')
const topBar = assertEl(_topBar, 'top-bar')
const bottomBar = assertEl(_bottomBar, 'bottom-bar')
const configForm = assertEl(_configForm, 'sidebar-config')

let cfg: SimConfig = {
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

function fitCanvasToGrid(canvas: HTMLCanvasElement, cfg: SimConfig) {
  const dpr = window.devicePixelRatio || 1
  const cssH = 800
  const cssW = Math.round(cssH * (cfg.width / cfg.height))
  canvas.style.width = cssW + 'px'
  canvas.style.height = cssH + 'px'
  canvas.width = Math.round(cssW * dpr)
  canvas.height = Math.round(cssH * dpr)
}

function renderConfigPanel(cfg: SimConfig) {
  configForm.innerHTML = `
    <form id="cfg-form" class="cfg-form">
      <div class="cfg-group">
        <div class="cfg-group-label">Grid</div>
        <div class="cfg-row">
          <label>Width</label>
          <input name="width" type="number" min="5" max="200" value="${cfg.width}" />
        </div>
        <div class="cfg-row">
          <label>Height</label>
          <input name="height" type="number" min="5" max="200" value="${cfg.height}" />
        </div>
      </div>
      <div class="cfg-group">
        <div class="cfg-group-label">Assets</div>
        <div class="cfg-row">
          <label>Bases</label>
          <input name="baseCount" type="number" min="1" max="4" value="${cfg.baseCount}" />
        </div>
        <div class="cfg-row">
          <label>Drones</label>
          <input name="droneCount" type="number" min="1" max="20" value="${cfg.droneCount}" />
        </div>
      </div>
      <div class="cfg-group">
        <div class="cfg-group-label">Scenario</div>
        <div class="cfg-row">
          <label>Casualties</label>
          <input name="casualtyCount" type="number" min="1" max="10" value="${cfg.casualtyCount}" />
        </div>
        <div class="cfg-row">
          <label>Mean (μ)</label>
          <input name="mean" type="number" step="0.1" value="${cfg.mean}" />
        </div>
        <div class="cfg-row">
          <label>Std Dev (σ)</label>
          <input name="stdDev" type="number" min="0.1" max="20" step="0.1" value="${cfg.stdDev}" />
        </div>
        <div class="cfg-row">
          <label>Max translation</label>
          <input name="maxTranslation" type="number" min="1" max="50" step="1" value="${cfg.maxTranslation}" />
        </div>
      </div>
      <div class="cfg-row" style="margin-top:14px; margin-bottom:6px;">
        <label>Seed</label>
        <input name="seed" type="number" placeholder="random" value="${cfg.seed ?? ''}" />
      </div>
      <div>
        <button type="submit" class="btn-primary">Run Simulation</button>
      </div>
    </form>
  `

  const form = document.getElementById('cfg-form') as HTMLFormElement
  form.onsubmit = async (e) => {
    e.preventDefault()
    const data = new FormData(form)
    cfg.width = Number(data.get('width'))
    cfg.height = Number(data.get('height'))
    cfg.baseCount = Number(data.get('baseCount'))
    cfg.droneCount = Number(data.get('droneCount'))
    cfg.casualtyCount = Number(data.get('casualtyCount'))
    cfg.mean = Number(data.get('mean'))
    cfg.stdDev = Number(data.get('stdDev'))
    cfg.maxTranslation = Number(data.get('maxTranslation'))
    const seedValue = data.get('seed')
    cfg.seed = seedValue === '' ? undefined : Number(seedValue)
    await rerunSimulation()
  }
}

async function rerunSimulation() {
  topBar.textContent = 'MASAR Demo'
  bottomBar.textContent = `© Steve Marvell ${new Date().getFullYear()}`

  sidebar.innerHTML = `
    <div style="margin-bottom:8px;"><strong>Key</strong></div>
    <div><span class="key base">#</span>Base</div>
    <div><span class="key drone"></span>Drone</div>
    <div><span class="key ep"></span>Estimated Position</div>
    <div><span class="key ap"></span>Actual Position</div>
  `

  renderConfigPanel(cfg)

  const result = await runSimulation(cfg, {
    beforeSimStart: ({ cfg }) => fitCanvasToGrid(canvas, cfg)
  })
  render(canvas, result)
}

window.onload = rerunSimulation
