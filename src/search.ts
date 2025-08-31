// /src/search.ts
import type { Position } from './types'
import type { Grid } from './grid'
import { makeGrid, getCell, setCell, forEachCell } from './grid'

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

function normalise(b: Grid<number>) {
  let s = 0
  forEachCell(b, (_x, _y, v) => { s += v })
  if (s === 0) return b
  forEachCell(b, (x, y, v) => { setCell(b, x, y, v / s) })
  return b
}

function buildBelief(width: number, height: number, ep: Position, sigma: number): Grid<number> {
  const g = makeGrid<number>(width, height, (x, y) => gaussian(ep, x, y, sigma))
  return normalise(g)
}

export class MultiReactiveSearcher {
  private belief: Grid<number>
  private visited: Set<string>
  private casualty: Position
  private ep: Position

  constructor(
    width: number,
    height: number,
    ep: Position,
    sigma: number,
    casualty: Position
  ) {
    this.belief = buildBelief(width, height, ep, sigma)
    this.visited = new Set<string>()
    this.casualty = { ...casualty }
    this.ep = { ...ep }
  }

  private k(x: number, y: number) { return `${x},${y}` }

  nextStep(current: Position, claimedThisTick: Set<string>): Position {
    if (current.x === this.casualty.x && current.y === this.casualty.y) return current

    let best: Position | null = null
    let bestScore = -Infinity
    for (let y = 0; y < this.belief.height; y++) {
      for (let x = 0; x < this.belief.width; x++) {
        const p = getCell(this.belief, x, y)
        if (p <= 0) continue
        const key = this.k(x, y)
        if (this.visited.has(key)) continue
        if (claimedThisTick.has(key)) continue
        const d = Math.max(1, Math.abs(x - current.x) + Math.abs(y - current.y))
        const score = p / d
        if (score > bestScore) {
          bestScore = score
          best = { x, y }
        }
      }
    }

    // fallback uses EP, not oracle
    const target = best ?? this.ep
    const next = stepToward(current, target)

    const nkey = this.k(next.x, next.y)
    this.visited.add(nkey)
    setCell(this.belief, next.x, next.y, 0)
    claimedThisTick.add(nkey)

    return next
  }
}
