// /src/sim.ts
import type {
  SimConfig,
  SimHooks,
  SimResult,
  SimState,
  Base,
  Drone,
  Casualty,
  Position
} from './types'
import { randomNormal, randomLcg } from 'd3-random'
import { randomNearbyPosition } from './randomNearbyPosition'

function makeRng(seed?: number) {
  // If seed provided, use a deterministic PRNG; else fall back to Math.random
  const source = seed == null ? null : randomLcg(seed);
  const u = () => (source ? source() : Math.random());
  return {
    // integer in [0, max-1]
    int: (max: number) => Math.floor(u() * max),
    // normal(mean, std) sample
    normal: (mean: number, std: number) =>
      (source ? randomNormal.source(source)(mean, std) : randomNormal(mean, std))(),
    // expose raw uniform [0,1)
    uniform: u
  };
}

export async function runSimulation(cfg: SimConfig, hooks?: Partial<SimHooks>): Promise<SimResult> {
  const rng = makeRng(cfg.seed);

  // 1) Distribute drones across bases without multiplying total
  const bases: Base[] = []
  const per = Math.floor(cfg.droneCount / cfg.baseCount)
  const extra = cfg.droneCount % cfg.baseCount
  for (let i = 0; i < cfg.baseCount; i++) {
    const allot = per + (i < extra ? 1 : 0)
    bases.push({
      id: i + 1,
      position: { x: Math.floor(cfg.width / 2), y: cfg.height - 1 },
      capacity: allot,
      unspawned: allot
    })
  }
  // 2) Drones: none spawned initially
  const drones: Drone[] = [];

  // 3) Casualties: estimatedPosition and actual position both derived from the same RNG
  const casualties: Casualty[] = [];
  for (let i = 0; i < cfg.casualtyCount; i++) {
    const estimatedPosition: Position = {
      x: rng.int(cfg.width),
      y: rng.int(Math.floor(cfg.height * 0.66))
    }

    // Derive a unique, deterministic seed per casualty when cfg.seed is set
    const derivedSeed = cfg.seed == null ? undefined : cfg.seed + i * 9973

    const position: Position = randomNearbyPosition(
      estimatedPosition,
      cfg.stdDev,
      { width: cfg.width, height: cfg.height },
      cfg.maxTranslation,
      cfg.maxTranslation,
      derivedSeed,
      cfg.mean
    )

    casualties.push({ id: i + 1, estimatedPosition, position })
  }

  const state: SimState = { bases, drones, casualties };

  // HOOKS
  if (hooks?.beforeSimStart) await hooks.beforeSimStart({ cfg, state });
  if (hooks?.afterSimStart) await hooks.afterSimStart({ cfg, state });

  return {
    width: cfg.width,
    height: cfg.height,
    bases: state.bases,
    drones: state.drones,
    casualties: state.casualties
  };
}
