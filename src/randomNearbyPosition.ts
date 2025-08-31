// /src/randomNearbyPosition.ts
import { randomNormal, randomLcg } from 'd3-random'
import type { Position } from './types'

/**
 * Random nearby Position using d3-random's normal sampler.
 * If seed is provided, uses a seeded source for reproducibility.
 */
export function randomNearbyPosition(
  center: Position,
  sigma: number,
  bounds: { width: number; height: number },
  maxDx: number = 10,
  maxDy: number = 10,
  seed?: number
): Position {
  const source = seed == null ? undefined : randomLcg(seed);
  const normal = source ? randomNormal.source(source)(0, sigma) : randomNormal(0, sigma);

  const dx = Math.max(-maxDx, Math.min(maxDx, Math.round(normal())));
  const dy = Math.max(-maxDy, Math.min(maxDy, Math.round(normal())));

  const x = Math.max(0, Math.min(bounds.width - 1, center.x + dx));
  const y = Math.max(0, Math.min(bounds.height - 1, center.y + dy));
  return { x, y };
}
