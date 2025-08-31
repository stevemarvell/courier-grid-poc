// /src/renderer.ts
import type { SimResult } from './types'

const COLORS = {
  grid: '#1d2733',
  base: '#5b6977',
  drone: '#ffffff',
  ap: '#f43f5e',
  ep: '#f59e42',
  textDark: '#222',
  textLight: '#fff',

  visitedFill: 'rgba(52,143,255,0.10)',
  pathVisited: 'rgba(255,255,255,0.85)',
  pathRemaining: 'rgba(255,255,255,0.35)',
  currentCellStroke: '#34a1ff'
}

function drawSquareRect(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  right: number,
  bottom: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.fillRect(left, top, right - left, bottom - top)
}

function drawCircleRect(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  right: number,
  bottom: number,
  color: string,
  shrink = 0
) {
  const w = right - left
  const h = bottom - top
  const cx = left + w / 2
  const cy = top + h / 2
  const radius = Math.min(w, h) / 2 - shrink
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(0, radius), 0, Math.PI * 2)
  ctx.fill()
  return { cx, cy, r: Math.max(0, radius) }
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  px: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.font = `${px}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, cy)
}

function cellCenter(gx: number, gy: number, cellW: number, cellH: number, pad: number) {
  const L = gx * cellW + pad
  const T = gy * cellH + pad
  const R = (gx + 1) * cellW - pad
  const B = (gy + 1) * cellH - pad
  return { cx: (L + R) / 2, cy: (T + B) / 2 }
}

export function render(canvas: HTMLCanvasElement, res: SimResult) {
  const ctx = canvas.getContext('2d')!
  const W = canvas.width
  const H = canvas.height
  const { width, height } = res

  const cellW = W / width
  const cellH = H / height

  ctx.clearRect(0, 0, W, H)

  // grid
  ctx.strokeStyle = COLORS.grid
  ctx.lineWidth = 1
  for (let x = 0; x <= width; x++) {
    const vx = Math.round(x * cellW) + 0.5
    ctx.beginPath()
    ctx.moveTo(vx, 0.5)
    ctx.lineTo(vx, H + 0.5)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y++) {
    const vy = Math.round(y * cellH) + 0.5
    ctx.beginPath()
    ctx.moveTo(0.5, vy)
    ctx.lineTo(W + 0.5, vy)
    ctx.stroke()
  }

  const minCell = Math.min(cellW, cellH)
  const pad = minCell * 0.01
  const baseExtraPad = minCell * 0.01
  const droneExtra = minCell * 0.06

  const cellRect = (gx: number, gy: number, extraPad = 0) => {
    const L = gx * cellW + pad + extraPad
    const T = gy * cellH + pad + extraPad
    const R = (gx + 1) * cellW - pad - extraPad
    const B = (gy + 1) * cellH - pad - extraPad
    return { L, T, R, B, cx: (L + R) / 2, cy: (T + B) / 2, w: R - L, h: B - T }
  }

  // visited wash
  for (const d of res.drones) {
    if (!d.spawned || !d.path || d.path.length < 1) continue
    const upto =
      d.step == null ? d.path.length - 1 : Math.max(0, Math.min(d.step, d.path.length - 1))
    ctx.save()
    ctx.fillStyle = COLORS.visitedFill
    for (let i = 0; i <= upto; i++) {
      const p = d.path[i]
      const { L, T, R, B } = cellRect(p.x, p.y, 0)
      ctx.fillRect(L, T, R - L, B - T)
    }
    ctx.restore()
  }

  // paths: thinner
  for (const d of res.drones) {
    if (!d.spawned || !d.path || d.path.length < 2) continue
    const upto =
      d.step == null ? d.path.length - 1 : Math.max(1, Math.min(d.step, d.path.length - 1))

    // visited segment
    ctx.save()
    ctx.beginPath()
    for (let i = 0; i <= upto; i++) {
      const p = d.path[i]
      const { cx, cy } = cellCenter(p.x, p.y, cellW, cellH, pad)
      if (i === 0) ctx.moveTo(cx, cy)
      else ctx.lineTo(cx, cy)
    }
    ctx.lineWidth = Math.max(1.25, Math.min(cellW, cellH) * 0.12)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = COLORS.pathVisited
    ctx.stroke()
    ctx.restore()

    // future segment
    if (upto < d.path.length - 1) {
      ctx.save()
      ctx.beginPath()
      const start = d.path[upto]
      let { cx, cy } = cellCenter(start.x, start.y, cellW, cellH, pad)
      ctx.moveTo(cx, cy)
      for (let i = upto + 1; i < d.path.length; i++) {
        const p = d.path[i]
        ;({ cx, cy } = cellCenter(p.x, p.y, cellW, cellH, pad))
        ctx.lineTo(cx, cy)
      }
      ctx.setLineDash([Math.max(3, minCell * 0.45), Math.max(3, minCell * 0.4)])
      ctx.lineWidth = Math.max(1, Math.min(cellW, cellH) * 0.08)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = COLORS.pathRemaining
      ctx.stroke()
      ctx.restore()
    }
  }

  // bases
  for (const base of res.bases) {
    const { L, T, R, B, cx, cy, w, h } = cellRect(base.position.x, base.position.y, baseExtraPad)
    drawSquareRect(ctx, L, T, R, B, COLORS.base)
    const px = Math.round(Math.min(w, h) * 0.42)
    drawCenteredText(ctx, String(base.unspawned ?? 0), cx, cy, px, COLORS.textLight)
  }

  // EP
  for (const cas of res.casualties) {
    const { L, T, R, B, cx, cy, w, h } = cellRect(cas.estimatedPosition.x, cas.estimatedPosition.y, 0)
    drawSquareRect(ctx, L, T, R, B, COLORS.ep)
    const px = Math.round(Math.min(w, h) * 0.42)
    drawCenteredText(ctx, String(cas.id), cx, cy, px, COLORS.textDark)
  }

  // AP
  for (const cas of res.casualties) {
    const { L, T, R, B, cx, cy } = cellRect(cas.position.x, cas.position.y, 0)
    const { r } = drawCircleRect(ctx, L, T, R, B, COLORS.ap, pad)
    const px = Math.round(r * 0.88)
    drawCenteredText(ctx, String(cas.id), cx, cy, px, COLORS.textLight)
  }

  // current cells
  for (const d of res.drones) {
    if (!d.spawned || !d.path || d.path.length === 0) continue
    const idx = d.step == null ? d.path.length - 1 : Math.max(0, Math.min(d.step, d.path.length - 1))
    const p = d.path[idx]
    const { L, T, R, B } = cellRect(p.x, p.y, 0)
    ctx.save()
    ctx.lineWidth = Math.max(1.5, Math.min(cellW, cellH) * 0.12)
    ctx.strokeStyle = COLORS.currentCellStroke
    ctx.strokeRect(L + 1, T + 1, (R - L) - 2, (B - T) - 2)
    ctx.restore()
  }

  // drones
  for (const drone of res.drones) {
    if (!drone.spawned) continue
    const drawPos =
      (drone.path && drone.step != null && drone.path[drone.step]) || drone.position
    const { L, T, R, B, cx, cy } = cellRect(drawPos.x, drawPos.y, 0)

    ctx.save()
    const haloShrink = pad + droneExtra + Math.max(1, minCell * 0.04)
    drawCircleRect(ctx, L, T, R, B, 'rgba(52,161,255,0.18)', haloShrink)
    ctx.restore()

    const shrink = pad + droneExtra
    const { r } = drawCircleRect(ctx, L, T, R, B, COLORS.drone, shrink)
    const px = Math.round(r * 0.88)
    drawCenteredText(ctx, String(drone.id), cx, cy, px, COLORS.textDark)
  }
}
