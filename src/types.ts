import {Position} from "./geo/position";

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
    launchAtTick: number     // tick when this drone launches (includes first-launch cost)
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
    // time in ticks
    playbackTicksPerSec: number   // ticks per real-second
    launchEveryTicks: number      // gap between launches, in ticks
    seed?: number                 // if undefined, we generate one and persist
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
