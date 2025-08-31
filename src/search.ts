// /src/search.ts
import type { Position } from './types'

type GridBelief = number[][]
type Formatted = { x: number; y: number }

function stepToward(a: Position, b: Position): Position {
  if (a.x !== b.x) return { x: a.x + Math.sign(b.x - a.x), y: a.y }
  if (a.y !== b.y) return { x: a.x, y: a.y + Math.sign(b.y - a.y) }
  return a
}

function gaussian(ep: Position, x: number, y: number, sigma: number) {
  if (sigma <= 0) return x === ep.x && y === ep.y ? 1 : 0
  const dx = x - ep.x, dy = y - ep.y
  return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma))
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

export class ReactiveSearcher {
  private width: number
  private height: number
  private belief: GridBelief
  private visited: Set<string>
  private casualty: Position

  constructor(
    width: number,
    height: number,
    ep: Position,
    sigma: number,
    casualty: Position
  ) {
    this.width = width
    this.height = height
    this.belief = buildBelief(width, height, ep, sigma)
    this.visited = new Set<string>()
    this.casualty = { ...casualty }
  }

  private k(p: Formatted) { return `${p.x},${p.y}` }

  private chooseTarget(from: Position): Position | null {
    let best: Position | null = null
    let bestScore = -Infinity
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const p = this.belief[y][x]
        if (p <= 0) continue
        if (this.visited.has(this.k({ x, y }))) continue
        const d = Math.max(1, Math.abs(x - from.x) + Math.abs(y - from.y))
        const score = p / d
        if (score > bestScore) {
          bestScore = score
          best = { x, y }
        }
      }
    }
    return best
  }

  /** POD=1, r=0, casualty stationary. Returns the next grid position. */
  nextStep(current: Position): Position {
    // found if on the square
    if (current.x === this.casualty.x && current.y === this.casualty.y) return current

    // pick the highest-value target; if none, beeline to casualty
    const target = this.chooseTarget(current) ?? this.casualty
    const next = stepToward(current, target)

    // mark the entered cell as searched
    this.visited.add(this.k(next))
    this.belief[next.y][next.x] = 0

    return next
  }
}
