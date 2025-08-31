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
  const source = seed == null ? null : randomLcg(seed)
  const u = () => (source ? source() : Math.random())
  return {
    int: (max: number) => Math.floor(u() * max),
    normal: (mean: number, std: number) =>
      (source ? randomNormal.source(source)(mean, std) : randomNormal(mean, std))(),
    uniform: u
  }
}

export async function runSimulation(cfg: SimConfig, hooks?: Partial<SimHooks>): Promise<SimResult> {
  const rng = makeRng(cfg.seed)

  // Bases: centred bottom row, distribute total drones across bases
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

  // Casualties: EP from rng, AP from nearby normal with clamp
  const casualties: Casualty[] = []
  for (let i = 0; i < cfg.casualtyCount; i++) {
    const estimatedPosition: Position = {
      x: rng.int(cfg.width),
      y: rng.int(Math.floor(cfg.height * 0.66))
    }
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

  // Spawn a single drone at base[0] with an initial trail of the starting cell only
  const drones: Drone[] = []
  if (cfg.droneCount > 0 && bases.length > 0) {
    const base0 = bases[0]
    drones.push({ id: 1, position: base0.position, spawned: true, path: [base0.position], step: 0 })
    base0.unspawned = Math.max(0, (base0.unspawned ?? 0) - 1)
  }

  const state: SimState = { bases, drones, casualties }

  if (hooks?.beforeSimStart) await hooks.beforeSimStart({ cfg, state })
  if (hooks?.afterSimStart) await hooks.afterSimStart({ cfg, state })

  return {
    width: cfg.width,
    height: cfg.height,
    bases: state.bases,
    drones: state.drones,
    casualties: state.casualties
  }
}
