# Digital Fly Working Memory

## Confirmed Decisions

- The original project is browser-first, static-hostable, and uses React only as the Babylon lifecycle frame.
- No reference-project code is copied. `snedea/flybrain` is a reduced functional-group prototype; `ashlrai/creatures` is server-led and reduced; FlyBrainLab is a scientific platform reference. Their useful architectural ideas are documented in the external assessment notes.
- The FlyWire public release guidance says v783 is the October 2023 snapshot and is available under CC BY-NC 4.0. The application will not bundle its data and will require an explicit release manifest with attribution.
- A 50-million-edge compact column layout with 4-byte source IDs, 4-byte target IDs, 4-byte weights, 2-byte delays, and 1-byte flags consumes about 524.52 MiB before GPU duplication; full packs must be chunked and preflighted.
- Visual target is **Luminous Connectome Lab**. Axonal Magenta is reserved for active spikes/pathways, gold for stimuli, cyan for derived output, and labels distinguish source, modelled, and synthetic values.

## Current Host State

- Static React project initialized at `/home/ubuntu/digital-fly`.
- Babylon.js core installed; `GameCanvas` guards React StrictMode double initialization and `scene.ts` provides the initial dark calibration scene.
- Generated assets use Manus storage URLs and are listed in `ASSETS.md`.

## Outstanding Constraints

- Do not present the synthetic fixture as FlyWire-derived biology.
- No large data, generated images, or external reference source is committed inside the web project tree.
- Do not claim consciousness, literal life, or biologically validated behavior without evidence.
- The project may only support non-commercial uses while it depends on public FlyWire release data, unless independent rights are established.
