import type { SimResult } from './types'

const COLORS = {
  grid: '#1d2733',
  base: '#5b6977',      // steel grey
  drone: '#ffffff',     // white
  ap: '#f43f5e',        // actual position - red circle
  ep: '#f59e42',        // estimated position - amber square
  textDark: '#222',
  textLight: '#fff'
};

function drawSquareRect(ctx: CanvasRenderingContext2D, left: number, top: number, right: number, bottom: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(left, top, right - left, bottom - top);
}

function drawCircleRect(ctx: CanvasRenderingContext2D, left: number, top: number, right: number, bottom: number, color: string, shrink = 0) {
  const w = right - left;
  const h = bottom - top;
  const cx = left + w / 2;
  const cy = top + h / 2;
  const radius = Math.min(w, h) / 2 - shrink;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(0, radius), 0, Math.PI * 2);
  ctx.fill();
  return { cx, cy, r: Math.max(0, radius) };
}

function drawCenteredText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, px: number, color: string) {
  ctx.fillStyle = color;
  ctx.font = `${px}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
}

export function render(canvas: HTMLCanvasElement, res: SimResult) {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;
  const { width, height } = res;

  // Precompute cell size
  const cellW = W / width;
  const cellH = H / height;

  ctx.clearRect(0, 0, W, H);

  // Draw crisp grid lines on half-pixels
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x++) {
    const vx = Math.round(x * cellW) + 0.5;
    ctx.beginPath();
    ctx.moveTo(vx, 0.5);
    ctx.lineTo(vx, H + 0.5);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y++) {
    const vy = Math.round(y * cellH) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0.5, vy);
    ctx.lineTo(W + 0.5, vy);
    ctx.stroke();
  }

  // A small symmetric padding so shapes appear to touch edges without bleeding
  const minCell = Math.min(cellW, cellH);
  const pad = minCell * 0.01;          // universal pad for all shapes
  const baseExtraPad = minCell * 0.01; // shrink base a touch to keep digits readable
  const droneExtra = minCell * 0.06;   // shrink drone radius below AP

  // Helper to get exact cell rect with pad
  const cellRect = (gx: number, gy: number, extraPad = 0) => {
    const L = gx * cellW + pad + extraPad;
    const T = gy * cellH + pad + extraPad;
    const R = (gx + 1) * cellW - pad - extraPad;
    const B = (gy + 1) * cellH - pad - extraPad;
    return { L, T, R, B, cx: (L + R) / 2, cy: (T + B) / 2, w: R - L, h: B - T };
  };

  // Bases: steel-grey square with unspawned count, slightly smaller than cell
  for (const base of res.bases) {
    const { L, T, R, B, cx, cy, w, h } = cellRect(base.position.x, base.position.y, baseExtraPad);
    drawSquareRect(ctx, L, T, R, B, COLORS.base);
    const px = Math.round(Math.min(w, h) * 0.42);
    drawCenteredText(ctx, String(base.unspawned ?? 0), cx, cy, px, COLORS.textLight);
  }

  // EP (Estimated Position): amber square, nearly edge-to-edge, id centered
  for (const cas of res.casualties) {
    const { L, T, R, B, cx, cy, w, h } = cellRect(cas.estimatedPosition.x, cas.estimatedPosition.y, 0);
    drawSquareRect(ctx, L, T, R, B, COLORS.ep);
    const px = Math.round(Math.min(w, h) * 0.42);
    drawCenteredText(ctx, String(cas.id), cx, cy, px, COLORS.textDark);
  }

  // AP (Actual Position): red circle, nearly edge-to-edge, id centered
  for (const cas of res.casualties) {
    const { L, T, R, B, cx, cy, w, h } = cellRect(cas.position.x, cas.position.y, 0);
    const shrink = pad; // small shrink to avoid overpainting grid
    const { r } = drawCircleRect(ctx, L, T, R, B, COLORS.ap, shrink);
    const px = Math.round(r * 0.88);
    drawCenteredText(ctx, String(cas.id), cx, cy, px, COLORS.textLight);
  }

  // Drones: white circle slightly smaller than AP, id centered
  for (const drone of res.drones) {
    if (!drone.spawned) continue;
    const { L, T, R, B, cx, cy } = cellRect(drone.position.x, drone.position.y, 0);
    const shrink = pad + droneExtra;
    const { r } = drawCircleRect(ctx, L, T, R, B, COLORS.drone, shrink);
    const px = Math.round(r * 0.88);
    drawCenteredText(ctx, String(drone.id), cx, cy, px, COLORS.textDark);
  }
}
