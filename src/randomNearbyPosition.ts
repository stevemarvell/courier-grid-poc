import { randomNormal, randomLcg } from 'd3-random'
import type { Position } from './types'

/**
 * Random nearby Position using a normal sampler.
 * mean applies to both dx and dy. If seed is provided, use deterministic PRNG.
 */
export function randomNearbyPosition(
  center: Position,
  sigma: number,
  bounds: { width: number; height: number },
  maxDx: number = 10,
  maxDy: number = 10,
  seed?: number,
  mean: number = 0
): Position {
  const source = seed == null ? undefined : randomLcg(seed)
  const normal = source ? randomNormal.source(source)(0, sigma) : randomNormal(0, sigma)

  const dx = Math.max(-maxDx, Math.min(maxDx, Math.round(normal() + mean)))
  const dy = Math.max(-maxDy, Math.min(maxDy, Math.round(normal() + mean)))

  const x = Math.max(0, Math.min(bounds.width - 1, center.x + dx))
  const y = Math.max(0, Math.min(bounds.height - 1, center.y + dy))
  return { x, y }
}
