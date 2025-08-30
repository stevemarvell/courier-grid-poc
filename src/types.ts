export interface SimConfig {
  width: number
  height: number
  blobCount: number
  seed?: number
}

export interface BlobPt { id: number; x: number; y: number }

export interface SimState {
  blobs: BlobPt[]
  addBlob(x: number, y: number): void
  addRandomBlobs(n: number): void
}

export interface SimHooks {
  beforeSimStart?(ctx: { cfg: SimConfig; state: SimState }): void | Promise<void>
  afterSimStart?(ctx: { cfg: SimConfig; state: SimState }): void | Promise<void>
}

export interface SimResult {
  width: number
  height: number
  blobs: BlobPt[]
}
