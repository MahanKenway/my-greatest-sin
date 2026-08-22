/** Luminous Connectome Lab: one small seeded generator makes demo experiments reproducible. */
export class SeededRng {
  private state: number;

  constructor(seed = 0xD16F1E) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state += 0x6D2B79F5;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  }
}
