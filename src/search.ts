// /src/search.ts

import {Position} from "./geo/position";

type GridBelief = number[][]

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

export class MultiReactiveSearcher {
  private readonly width: number
  private readonly height: number
  private readonly belief: GridBelief
  private visited: Set<string>
  private casualty: Position
  private readonly ep: Position

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
    this.ep = { ...ep }
  }

  private k(x: number, y: number) { return `${x},${y}` }

  nextStep(current: Position, claimedThisTick: Set<string>): Position {
    if (current.x === this.casualty.x && current.y === this.casualty.y) return current

    let best: Position | null = null
    let bestScore = -Infinity
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const p = this.belief[y][x]
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
    this.belief[next.y][next.x] = 0
    claimedThisTick.add(nkey)

    return next
  }
}
