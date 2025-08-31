import type { SimConfig, SimHooks, SimResult, SimState, Base, Drone, Casualty, Position } from './types'
import { randomNearbyPosition } from './randomNearbyPosition'

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export async function runSimulation(cfg: SimConfig, hooks?: Partial<SimHooks>): Promise<SimResult> {
  // 1. Base at center/bottom
  const bases: Base[] = [];
  for (let i = 0; i < cfg.baseCount; i++) {
    bases.push({
      id: i + 1,
      position: { x: Math.floor(cfg.width / 2), y: cfg.height - 1 },
      capacity: cfg.droneCount,
      unspawned: cfg.droneCount
    });
  }

  // 2. Drones (none spawned at start)
  const drones: Drone[] = [];

  // 3. Casualties (statistical distribution for actual from estimated)
  const casualties: Casualty[] = [];
  for (let i = 0; i < cfg.casualtyCount; i++) {
    const estimatedPosition: Position = {
      x: randomInt(cfg.width),
      y: randomInt(Math.floor(cfg.height * 0.66))
    };
    const position: Position = randomNearbyPosition(
      estimatedPosition,
      2, // sigma
      { width: cfg.width, height: cfg.height }
    );
    casualties.push({ id: i + 1, estimatedPosition, position });
  }

  const state: SimState = { bases, drones, casualties };

  // HOOKS
  if (hooks?.beforeSimStart) await hooks.beforeSimStart({ cfg, state });
  if (hooks?.afterSimStart) await hooks.afterSimStart({ cfg, state });

  return {
    width: cfg.width,
    height: cfg.height,
    bases,
    drones,
    casualties
  };
}
