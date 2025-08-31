// /src/types.ts
export interface Position {
  x: number
  y: number
}

export const posEq = (a: Position, b: Position) => a.x === b.x && a.y === b.y;