// /src/grid.ts
export interface Grid<T> {
  width: number
  height: number
  data: T[][]
}

export function makeGrid<T>(
  width: number,
  height: number,
  init: (x: number, y: number) => T
): Grid<T> {
  const data = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => init(x, y))
  )
  return { width, height, data }
}

export function inBounds(g: Grid<unknown>, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < g.width && y < g.height
}

export function getCell<T>(g: Grid<T>, x: number, y: number): T {
  return g.data[y][x]
}

export function setCell<T>(g: Grid<T>, x: number, y: number, v: T): void {
  g.data[y][x] = v
}

export function forEachCell<T>(g: Grid<T>, fn: (x: number, y: number, v: T) => void): void {
  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) fn(x, y, g.data[y][x])
  }
}
