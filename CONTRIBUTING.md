# Contributing

Contributions are welcome when they preserve the project’s scientific and software boundaries. Please keep browser runtime code in TypeScript strict mode, avoid `any`, avoid one-object-per-neuron or one-object-per-synapse designs, and retain the provenance label on every data pathway.

Before opening a pull request, run `pnpm check`, `pnpm test`, and `pnpm build`. Add a deterministic test whenever changing binary parsing, sparse propagation, sensory encoding, motor decoding, state serialization, or backend selection. Any new data adapter must document source, release, license, checksum method, transformation version, and citation requirements in `DATA.md`.

Do not submit source data, trained assets, or code from a reference repository unless its compatibility and permission are documented. Do not add claims about consciousness, life, biological validation, or emergent behavior without a cited methodology and clearly scoped evidence.
