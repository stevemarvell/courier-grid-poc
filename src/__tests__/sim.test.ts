import { runSimulation } from '../sim'
import type { SimConfig } from '../types'

function baseCfg(overrides: Partial<SimConfig> = {}): SimConfig {
  return {
    width: 50,
    height: 40,
    baseCount: 3,
    droneCount: 10,
    casualtyCount: 4,
    mean: 1,
    stdDev: 2,
    maxTranslation: 5,
    seed: 999,
    ...overrides
  }
}

describe('runSimulation', () => {
  it('produces deterministic output for the same seed', async () => {
    const cfg = baseCfg()
    const a = await runSimulation(cfg)
    const b = await runSimulation(cfg)
    expect(b).toEqual(a)
  })

  it('changes output when seed changes', async () => {
    const a = await runSimulation(baseCfg({ seed: 1 }))
    const b = await runSimulation(baseCfg({ seed: 2 }))
    expect(b).not.toEqual(a)
  })

  it('creates the requested number of casualties within bounds', async () => {
    const cfg = baseCfg({ casualtyCount: 5 })
    const res = await runSimulation(cfg)
    expect(res.casualties).toHaveLength(5)
    for (const c of res.casualties) {
      expect(c.estimatedPosition.x).toBeGreaterThanOrEqual(0)
      expect(c.estimatedPosition.x).toBeLessThan(cfg.width)
      expect(c.estimatedPosition.y).toBeGreaterThanOrEqual(0)
      expect(c.estimatedPosition.y).toBeLessThan(cfg.height)

      expect(c.position.x).toBeGreaterThanOrEqual(0)
      expect(c.position.x).toBeLessThan(cfg.width)
      expect(c.position.y).toBeGreaterThanOrEqual(0)
      expect(c.position.y).toBeLessThan(cfg.height)

      // translation per axis is clamped
      expect(Math.abs(c.position.x - c.estimatedPosition.x)).toBeLessThanOrEqual(cfg.maxTranslation)
      expect(Math.abs(c.position.y - c.estimatedPosition.y)).toBeLessThanOrEqual(cfg.maxTranslation)
    }
  })

  it('distributes drones across bases without multiplying total', async () => {
    const cfg = baseCfg({ baseCount: 3, droneCount: 10 })
    const res = await runSimulation(cfg)
    const unspawnedTotal = res.bases.reduce((s, b) => s + (b.unspawned ?? 0), 0)
    expect(unspawnedTotal).toBe(10)

    // Expected distribution: 4,3,3
    const caps = res.bases.map(b => b.capacity)
    expect(caps).toEqual([4, 3, 3])
  })

  it('initialises with zero spawned drones', async () => {
    const res = await runSimulation(baseCfg())
    expect(res.drones.length).toBe(0)
  })

  it('uses mean to shift actual positions', async () => {
    const cfg0 = baseCfg({ mean: 0, seed: 123 })
    const cfg2 = baseCfg({ mean: 2, seed: 123 })
    const a = await runSimulation(cfg0)
    const b = await runSimulation(cfg2)

    // same estimates, shifted actuals
    for (let i = 0; i < a.casualties.length; i++) {
      expect(b.casualties[i].estimatedPosition).toEqual(a.casualties[i].estimatedPosition)
      // not necessarily strictly greater due to clamping and rounding, but usually different
      const dxA = a.casualties[i].position.x - a.casualties[i].estimatedPosition.x
      const dxB = b.casualties[i].position.x - b.casualties[i].estimatedPosition.x
      const dyA = a.casualties[i].position.y - a.casualties[i].estimatedPosition.y
      const dyB = b.casualties[i].position.y - b.casualties[i].estimatedPosition.y
      // Mean shift should change at least one axis in most cases with these params
      expect(dxA !== dxB || dyA !== dyB).toBe(true)
    }
  })
})
