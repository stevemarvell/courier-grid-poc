// Core spatial type used everywhere
export interface Position {
    x: number;
    y: number;
}

// Domain entities
export interface Base {
    id: number;
    position: Position;
    capacity: number;
    unspawned: number; // number of drones not yet spawned onto the grid
}

export interface Drone {
    id: number;
    position: Position;
    spawned: boolean; // only render if true
}

export interface Casualty {
    id: number;
    estimatedPosition: Position; // the estimate
    position: Position;          // the actual (ground truth)
}

// Simulation configuration
export interface SimConfig {
    width: number;           // grid width (columns)
    height: number;          // grid height (rows)
    baseCount: number;       // number of bases to place
    droneCount: number;      // total drones available (initially unspawned at bases)
    casualtyCount: number;   // number of casualties to generate
    mean: number;            // mean μ for random translation from estimated to actual
    stdDev: number;          // standard deviation σ for translation (spread)
    maxTranslation: number;  // clamp for translation distance in grid cells
    seed?: number;           // optional RNG seed for reproducibility
}

// Internal, mutable state used during a run
export interface SimState {
    bases: Base[];
    drones: Drone[];
    casualties: Casualty[];
}

// Lifecycle hooks for setup/teardown-style logic
export interface SimHooks {
    beforeSimStart?(ctx: { cfg: SimConfig; state: SimState }): void | Promise<void>;
    afterSimStart?(ctx: { cfg: SimConfig; state: SimState }): void | Promise<void>;
}

// Result exposed to renderer/consumers
export interface SimResult {
    width: number;
    height: number;
    bases: Base[];
    drones: Drone[];
    casualties: Casualty[];
}
