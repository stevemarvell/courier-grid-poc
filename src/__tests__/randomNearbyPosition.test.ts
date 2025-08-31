import { randomNearbyPosition } from '../randomNearbyPosition'

describe('randomNearbyPosition', () => {
  const bounds = { width: 50, height: 40 }
  const center = { x: 10, y: 10 }

  it('returns center when sigma=0 and mean=0', () => {
    const p = randomNearbyPosition(center, 0, bounds, 10, 10, 123, 0)
    expect(p).toEqual(center)
  })

  it('applies mean shift when sigma=0', () => {
    const p = randomNearbyPosition(center, 0, bounds, 10, 10, 123, 2)
    expect(p.x).toBe(12)
    expect(p.y).toBe(12)
  })

  it('clamps to maxDx/maxDy', () => {
    const p = randomNearbyPosition(center, 0, bounds, 1, 1, 123, 5)
    expect(Math.abs(p.x - center.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(p.y - center.y)).toBeLessThanOrEqual(1)
  })

  it('stays within grid bounds', () => {
    const nearEdge = { x: 0, y: 0 }
    const p = randomNearbyPosition(nearEdge, 5, bounds, 20, 20, 42, 0)
    expect(p.x).toBeGreaterThanOrEqual(0)
    expect(p.y).toBeGreaterThanOrEqual(0)
    expect(p.x).toBeLessThan(bounds.width)
    expect(p.y).toBeLessThan(bounds.height)
  })
})
