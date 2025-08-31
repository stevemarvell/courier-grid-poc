import type { Position, SimConfig } from './types'

type GridBelief = number[][]

function gaussian(ep: Position, x: number, y: number, sigma: number) {
  if (sigma <= 0) return x === ep.x && y === ep.y ? 1 : 0
  const dx = x - ep.x, dy = y - ep.y
  return Math.exp(-(dx*dx + dy*dy) / (2 * sigma * sigma))
}

function normalise(b: GridBelief) {
  let s = 0
  for (const row of b) for (const v of row) s += v
  if (s === 0) return b
  for (let y = 0; y < b.length; y++) for (let x = 0; x < b[0].length; x++) b[y][x] /= s
  return b
}

function buildBelief(width: number, height: number, ep: Position, sigma: number): GridBelief {
  const b: GridBelief = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => gaussian(ep, x, y, sigma))
  )
  return normalise(b)
}

function stepToward(a: Position, b: Position): Position {
  if (a.x !== b.x) return { x: a.x + Math.sign(b.x - a.x), y: a.y }
  if (a.y !== b.y) return { x: a.x, y: a.y + Math.sign(b.y - a.y) }
  return a
}

/**
 * Greedy planner: pick next target maximising p / (1 + distance).
 * POD=1, r=0, casualty stationary. Stop when we step onto casualty cell.
 */
export function planPathSingleDrone(
  base: Position,
  ep: Position,
  casualty: Position,
  cfg: Pick<SimConfig, 'width' | 'height' | 'stdDev'>
): Position[] {
  const belief = buildBelief(cfg.width, cfg.height, ep, cfg.stdDev)
  const visited = new Set<string>()
  const key = (p: Position) => `${p.x},${p.y}`

  let pos: Position = { ...base }
  const path: Position[] = [pos]

  // Pre-rank cells by greedy score from current pos, recomputed on moves.
  const maxSteps = cfg.width * cfg.height * 4
  for (let iter = 0; iter < maxSteps; iter++) {
    if (pos.x === casualty.x && pos.y === casualty.y) break
    visited.add(key(pos))

    // Choose best next target
    let best: Position | null = null
    let bestScore = -Infinity

    for (let y = 0; y < cfg.height; y++) {
      for (let x = 0; x < cfg.width; x++) {
        const p = belief[y][x]
        if (p <= 0) continue
        if (visited.has(`${x},${y}`)) continue
        const d = Math.max(1, Math.abs(x - pos.x) + Math.abs(y - pos.y))
        const score = p / d
        if (score > bestScore) {
          bestScore = score
          best = { x, y }
        }
      }
    }

    if (!best) break

    // March one Manhattan step toward target
    pos = stepToward(pos, best)
    path.push(pos)

    // Zero probability of entered cell (searched)
    belief[pos.y][pos.x] = 0
  }

  // Ensure we end on casualty if not already found by greedy sweep
  if (path[path.length - 1].x !== casualty.x || path[path.length - 1].y !== casualty.y) {
    while (pos.x !== casualty.x || pos.y !== casualty.y) {
      pos = stepToward(pos, casualty)
      path.push(pos)
    }
  }
  return path
}
