// /src/ui/controls.ts
import type { SimConfig } from '../types'

const SEED_KEY = 'masar.seed'

export function mountControls(
  container: HTMLElement,
  cfg: SimConfig,
  onSubmit: (cfg: SimConfig) => void
) {
  // load persisted seed if present
  if (cfg.seed == null) {
    const saved = localStorage.getItem(SEED_KEY)
    if (saved != null && saved !== '') cfg.seed = Number(saved)
  }

  container.innerHTML = formHtml(cfg)

  const form = container.querySelector('#cfg-form') as HTMLFormElement
  const seedInput = container.querySelector('#seed-input') as HTMLInputElement
  const seedClear = container.querySelector('#seed-clear') as HTMLButtonElement

  seedClear.onclick = () => {
    seedInput.value = ''
    localStorage.removeItem(SEED_KEY)
  }

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
      playbackTicksPerSec: num(data, 'playbackTicksPerSec'),
      launchEveryTicks: num(data, 'launchEveryTicks'),
      seed: str(data, 'seed') === '' ? undefined : Number(str(data, 'seed'))
    }
    // persist if present
    if (next.seed != null) localStorage.setItem(SEED_KEY, String(next.seed))
    onSubmit(next)
  }
}

export function setSeedInput(container: HTMLElement, seed: number | undefined) {
  const seedInput = container.querySelector('#seed-input') as HTMLInputElement | null
  if (!seedInput) return
  seedInput.value = seed == null ? '' : String(seed)
  if (seed != null) localStorage.setItem('masar.seed', String(seed))
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

      <div class="cfg-group">
        <div class="cfg-group-label">Timing (ticks)</div>
        <div class="cfg-row">
          <label>Playback (ticks/s)</label>
          <input name="playbackTicksPerSec" type="number" min="1" step="1" value="${cfg.playbackTicksPerSec}" />
        </div>
        <div class="cfg-row">
          <label>Launch every (ticks)</label>
          <input name="launchEveryTicks" type="number" min="1" step="1" value="${cfg.launchEveryTicks}" />
        </div>
      </div>

      <div class="cfg-row seed-row" style="margin-top:10px;">
        <label>Seed</label>
        <div class="seed-wrap">
          <input id="seed-input" name="seed" type="number" placeholder="random" value="${cfg.seed ?? ''}" />
          <button type="button" id="seed-clear" class="btn-icon" title="Clear seed" aria-label="Clear seed">×</button>
        </div>
      </div>

      <div>
        <button type="submit" class="btn-primary">Run Simulation</button>
      </div>
    </form>
  `
}

// structural helpers
type FormDataLike = { get(name: string): unknown }
function num(fd: FormDataLike, key: string): number { return Number(fd.get(key)) }
function str(fd: FormDataLike, key: string): string {
  const v = fd.get(key); return v == null ? '' : String(v)
}
