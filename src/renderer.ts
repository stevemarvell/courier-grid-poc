import type { SimResult, Position } from './types'

const COLORS = {
  base: '#5b6977',
  drone: '#fff',
  casualty: '#f43f5e',
  estimated: '#f59e42'
};

function drawSquare(ctx: CanvasRenderingContext2D, pos: Position, color: string, size: number) {
  ctx.fillStyle = color;
  ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
}

function drawCircle(ctx: CanvasRenderingContext2D, pos: Position, color: string, r: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawCross(ctx: CanvasRenderingContext2D, pos: Position, color: string, size: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pos.x - size, pos.y - size);
  ctx.lineTo(pos.x + size, pos.y + size);
  ctx.moveTo(pos.x + size, pos.y - size);
  ctx.lineTo(pos.x - size, pos.y + size);
  ctx.stroke();
}

export function render(canvas: HTMLCanvasElement, res: SimResult) {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;
  const { width, height } = res;
  const cellW = W / width;
  const cellH = H / height;

  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = '#1d2733';
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

  // Bases
  for (const base of res.bases) {
    const cx = (base.position.x + 0.5) * cellW;
    const cy = (base.position.y + 0.5) * cellH;
    const sq = Math.min(cellW, cellH) * 0.7;
    drawSquare(ctx, { x: cx, y: cy }, COLORS.base, sq);
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.round(sq * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${base.unspawned ?? 0}`, cx, cy);
  }

  // Drones (only draw spawned===true, and use id)
  for (const drone of res.drones) {
    if (!drone.spawned) continue;
    const cx = (drone.position.x + 0.5) * cellW;
    const cy = (drone.position.y + 0.5) * cellH;
    drawCircle(ctx, { x: cx, y: cy }, COLORS.drone, Math.min(cellW, cellH) * 0.28);
    ctx.fillStyle = '#222';
    ctx.font = `${Math.round(Math.max(cellW, cellH) * 0.23)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${drone.id}`, cx, cy);
  }

  // Casualties (draw both estimated and actual)
  for (const cas of res.casualties) {
    // Estimated (cross - orange)
    drawCross(
      ctx,
      {
        x: (cas.estimatedPosition.x + 0.5) * cellW,
        y: (cas.estimatedPosition.y + 0.5) * cellH
      },
      COLORS.estimated,
      Math.min(cellW, cellH) * 0.22
    );
    // Actual (circle - red)
    drawCircle(
      ctx,
      {
        x: (cas.position.x + 0.5) * cellW,
        y: (cas.position.y + 0.5) * cellH
      },
      COLORS.casualty,
      Math.min(cellW, cellH) * 0.18
    );
  }
}
