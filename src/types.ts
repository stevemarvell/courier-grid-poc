export interface Position {
    x: number;
    y: number;
}

export interface Base {
    id: number;
    position: Position;
    capacity: number;
    unspawned: number;
}

export interface Drone {
    id: number;
    position: Position;
    spawned: boolean;
}

export interface Casualty {
    id: number;
    estimatedPosition: Position;
    position: Position; // actual
}

export interface SimConfig {
    width: number;
    height: number;
    baseCount: number;
    droneCount: number;
    casualtyCount: number;
    seed?: number;
}

export interface SimState {
    bases: Base[];
    drones: Drone[];
    casualties: Casualty[];
}

export interface SimHooks {
    beforeSimStart?(ctx: { cfg: SimConfig; state: SimState }): void | Promise<void>;
    afterSimStart?(ctx: { cfg: SimConfig; state: SimState }): void | Promise<void>;
}

export interface SimResult {
    width: number;
    height: number;
    bases: Base[];
    drones: Drone[];
    casualties: Casualty[];
}
