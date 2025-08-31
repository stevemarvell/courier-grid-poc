// /src/ui/configPanel.ts
import type { SimConfig } from '../types'

export function mountConfig(
  container: HTMLElement,
  cfg: SimConfig,
  onSubmit: (cfg: SimConfig) => void
) {
  container.innerHTML = formHtml(cfg)
  const form = container.querySelector('#cfg-form') as HTMLFormElement
  form.onsubmit = (e) => {
    e.preventDefault()
    const data = new FormData(form)
    const next: SimConfig = {
      width: num(data, 'width'),
      height: num(data, 'height'),
      baseCount: num(data, 'baseCount'),
      droneCount: num(data, 'droneCount'),
      casualtyCount: num(data, 'casualtyCount'),
      mean: num(data, 'mean'),
      stdDev: num(data, 'stdDev'),
      maxTranslation: num(data, 'maxTranslation'),
      seed: str(data, 'seed') === '' ? undefined : Number(str(data, 'seed'))
    }
    onSubmit(next)
  }
}

function formHtml(cfg: SimConfig) {
  return `
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
}

// /src/ui/configPanel.ts

// add a tiny structural type
type FormDataLike = { get(name: string): unknown }

function num(fd: FormDataLike, key: string): number {
  return Number(fd.get(key))
}
function str(fd: FormDataLike, key: string): string {
  const v = fd.get(key)
  return v == null ? '' : String(v)
}

