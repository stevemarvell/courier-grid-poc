// /src/comms/radio.ts
export interface RadioMessage {
  id: number;           // monotonically increasing
  from: string;         // caller id, e.g. "drone#1"
  tokens: string[];     // payload tokens (without id/from)
  frame: string[];      // on-wire tokens: [id, from, ...tokens]
  tick: number;         // simulation tick at send-time
}

export type RadioHandler = (msg: RadioMessage) => void;

/** Single-channel, map-wide radio. Synchronous delivery. */
export class Radio {
  private handlers = new Set<RadioHandler>();
  private tick = 0;
  private nextId = 1;

  setTick(t: number) { this.tick = t | 0; }
  advance(n = 1) { this.tick = (this.tick + n) | 0; }
  now(): number { return this.tick; }

  subscribe(handler: RadioHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  say(from: string, ...parts: Array<string | number | boolean>): void {
    const id = this.nextId++;
    const tokens = parts.map(String);
    const frame = [String(id), from, ...tokens];
    this.deliver({ id, from, tokens, frame, tick: this.tick });
  }

  sayLine(from: string, line: string): void {
    const id = this.nextId++;
    const tokens = line.trim() ? line.trim().split(/\s+/) : [];
    const frame = [String(id), from, ...tokens];
    this.deliver({ id, from, tokens, frame, tick: this.tick });
  }

  reset(): void { this.handlers.clear(); this.nextId = 1; }

  private deliver(msg: RadioMessage) {
    const hs = Array.from(this.handlers);
    for (const h of hs) h(msg);
  }
}
