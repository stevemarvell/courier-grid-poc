//sim.ts
import type { SimConfig, SimHooks, SimResult, SimState } from './types'

class RNG {
  private s: number
  constructor(seed = 1) { this.s = seed >>> 0 }
  next(): number {
    // xorshift32
    let x = this.s
    x ^= (x << 13) >>> 0
    x ^= (x >>> 17)
    x ^= (x << 5) >>> 0
    this.s = x >>> 0
    return this.s / 0xffffffff
  }
  int(n: number): number { return Math.floor(this.next() * n) }
}

function autoSeed(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const a = new Uint32Array(1)
    crypto.getRandomValues(a)
    return a[0] >>> 0
  }
  return ((Math.random() * 0xffffffff) >>> 0)
}

function makeState(cfg: SimConfig): SimState {
  const rng = new RNG(cfg.seed ?? autoSeed())
  const blobs: { id: number; x: number; y: number }[] = []
  let nextId = 1
  const taken = new Set<string>()

  const key = (x: number, y: number) => `${x},${y}`
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

  return {
    blobs,
    addBlob(x, y) {
      const cx = clamp(Math.trunc(x), 0, cfg.width - 1)
      const cy = clamp(Math.trunc(y), 0, cfg.height - 1)
      const k = key(cx, cy)
      if (taken.has(k)) return
      taken.add(k)
      blobs.push({ id: nextId++, x: cx, y: cy })
    },
    addRandomBlobs(n) {
      let placed = 0
      const max = cfg.width * cfg.height
      const target = Math.min(n, max)
      while (placed < target) {
        const x = rng.int(cfg.width)
        const y = rng.int(cfg.height)
        const k = key(x, y)
        if (taken.has(k)) continue
        taken.add(k)
        blobs.push({ id: nextId++, x, y })
        placed++
      }
    }
  }
}

export async function runSimulation(cfg: SimConfig, hooks?: Partial<SimHooks>): Promise<SimResult> {
  const state = makeState(cfg)
  if (hooks?.beforeSimStart) await hooks.beforeSimStart({ cfg, state })
  if (hooks?.afterSimStart) await hooks.afterSimStart({ cfg, state })

  return { width: cfg.width, height: cfg.height, blobs: state.blobs }
}
