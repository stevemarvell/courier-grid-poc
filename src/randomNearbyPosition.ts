export function randomNearbyPosition(
  center: { x: number; y: number },
  sigma: number,
  bounds: { width: number; height: number },
  maxDx: number = 6,
  maxDy: number = 6
): { x: number; y: number } {
  const randomNormal = (stddev: number) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.round(Math.cos(2 * Math.PI * u) * Math.sqrt(-2 * Math.log(v)) * stddev);
  };
  let dx = Math.max(-maxDx, Math.min(maxDx, randomNormal(sigma)));
  let dy = Math.max(-maxDy, Math.min(maxDy, randomNormal(sigma)));
  let x = Math.max(0, Math.min(bounds.width - 1, center.x + dx));
  let y = Math.max(0, Math.min(bounds.height - 1, center.y + dy));
  return { x, y };
}
