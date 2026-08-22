import { describe, expect, it } from "vitest";
import { createHudActivitySlots } from "./hudActivitySlots";

describe("createHudActivitySlots", () => {
  it("assigns a unique, deterministic key to every empty-network activity marker", () => {
    const slots = createHudActivitySlots(0);

    expect(slots).toHaveLength(16);
    expect(slots.map((slot) => slot.neuron)).toEqual(Array.from({ length: 16 }, () => 0));
    expect(new Set(slots.map((slot) => slot.key)).size).toBe(slots.length);
  });

  it("keeps marker keys unique when a small network samples the same neuron more than once", () => {
    const slots = createHudActivitySlots(1);

    expect(slots.every((slot) => slot.neuron === 0)).toBe(true);
    expect(new Set(slots.map((slot) => slot.key)).size).toBe(slots.length);
  });
});
