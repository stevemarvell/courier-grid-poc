// /src/types.ts
export interface Position { x: number; y: number }

export interface Base {
    id: number
    position: Position
    capacity: number
    unspawned: number
}

export interface Drone {
    id: number
    baseId: number
    position: Position
    spawned: boolean
    launchAtTick: number     // when this drone launches (in ticks)
    path?: Position[]        // visited cells
    step?: number            // render index into path
}

export interface Casualty {
    id: number
    estimatedPosition: Position
    position: Position
}

export interface SimConfig {
    width: number
    height: number
    baseCount: number
    droneCount: number
    casualtyCount: number
    mean: number
    stdDev: number
    maxTranslation: number
    // time is in ticks
    playbackTicksPerSec: number   // ticks per real-second
    launchEveryTicks: number      // tick gap between launches
    seed?: number
}

export interface SimState { bases: Base[]; drones: Drone[]; casualties: Casualty[] }

export interface SimHooks {
    beforeSimStart?(ctx: { cfg: SimConfig; state: SimState }): void | Promise<void>
    afterSimStart?(ctx: { cfg: SimConfig; state: SimState }): void | Promise<void>
}

export interface SimResult {
    width: number
    height: number
    bases: Base[]
    drones: Drone[]
    casualties: Casualty[]
}
