import type { SimResult } from './types'

export function render(canvas: HTMLCanvasElement, res: SimResult) {
  const ctx = canvas.getContext('2d')!
  const W = canvas.width
  const H = canvas.height

  // independent cell sizes so rectangles render correctly
  const cellW = W / res.width
  const cellH = H / res.height

  ctx.clearRect(0, 0, W, H)

  // grid
  ctx.strokeStyle = '#1d2733'
  ctx.lineWidth = 1
  for (let x = 0; x <= res.width; x++) {
    const vx = Math.round(x * cellW) + 0.5
    ctx.beginPath(); ctx.moveTo(vx, 0.5); ctx.lineTo(vx, H + 0.5); ctx.stroke()
  }
  for (let y = 0; y <= res.height; y++) {
    const vy = Math.round(y * cellH) + 0.5
    ctx.beginPath(); ctx.moveTo(0.5, vy); ctx.lineTo(W + 0.5, vy); ctx.stroke()
  }

  // blobs
  ctx.fillStyle = '#2dd4bf'
  const r = Math.floor(Math.min(cellW, cellH) * 0.35)
  for (const b of res.blobs) {
    const cx = Math.round((b.x + 0.5) * cellW)
    const cy = Math.round((b.y + 0.5) * cellH)
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
}
