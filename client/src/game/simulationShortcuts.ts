/**
 * Luminous Connectome Lab: keyboard shortcuts only call existing explicit simulation commands.
 * They never alter topology, decoder policy, or scientific provenance.
 */
import type { SimulationCommand } from "@/game/shared/types";

export const SIMULATION_SHORTCUTS = [
  { code: "Space", label: "Pause or resume" },
  { code: "Digit1", label: "Fly staged view" },
  { code: "Digit2", label: "C. elegans live view" },
  { code: "KeyR", label: "Reset active specimen" },
  { code: "KeyD", label: "Run auto demo" },
] as const;

export function commandForSimulationShortcut(code: string): SimulationCommand | null {
  switch (code) {
    case "Space": return { type: "toggle" };
    case "Digit1": return { type: "species", species: "DROSOPHILA" };
    case "Digit2": return { type: "species", species: "C_ELEGANS" };
    case "KeyR": return { type: "reset" };
    case "KeyD": return { type: "demo" };
    default: return null;
  }
}
