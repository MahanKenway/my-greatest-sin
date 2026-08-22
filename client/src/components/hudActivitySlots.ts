/**
 * Luminous Connectome Lab: activity markers are observation samples, not neuron identities.
 * Keys must remain position-stable even when an idle or staged connectome has zero activity cells.
 */
export type HudActivitySlot = Readonly<{
  index: number;
  neuron: number;
  key: string;
}>;

export function createHudActivitySlots(activityLength: number, sampleCount = 16): HudActivitySlot[] {
  const normalizedLength = Math.max(0, Math.floor(activityLength));
  const normalizedCount = Math.max(0, Math.floor(sampleCount));
  const fallbackNeuron = Math.max(0, normalizedLength - 1);

  return Array.from({ length: normalizedCount }, (_, index) => {
    const neuron = normalizedLength === 0
      ? 0
      : Math.min(fallbackNeuron, Math.floor(((index + 1) / (normalizedCount + 1)) * normalizedLength));

    return { index, neuron, key: `activity-slot-${index}-neuron-${neuron}` };
  });
}
