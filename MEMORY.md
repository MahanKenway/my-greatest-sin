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
- Dual-species embodiment was requested: a fly remains available and a C. elegans body is added as a separate modelled specimen.
- Sketchfab download was abandoned because Google sign-in control was unavailable to the user; no password was collected or used.
- The selected no-login source references are `NeLy-EPFL/NeuroMechFly` (Apache-2.0 STL body parts) and `openworm/wormbrowser` (MIT Virtual Worm model/layers).

## Outstanding Constraints

- Do not present the synthetic fixture as FlyWire-derived biology.
- No large data, generated images, or external reference source is committed inside the web project tree.
- Do not claim consciousness, literal life, or biologically validated behavior without evidence.
- The project may only support non-commercial uses while it depends on public FlyWire release data, unless independent rights are established.
- Body assets and a `C. elegans` display do not establish that the current 96-neuron fixture is real C. elegans data.

## Garden World Revision

- The Garden World is a visually richer field-garden presentation, not a new neural subsystem. Sunrise/night and all landscape treatments remain `MODELLED PRESENTATION`.
- `DAYLIGHT` must be communicated as a sky-cycle control and must not be confused with the separate sensory `LIGHT FIELD` control.
- The UI must use `SimulationSnapshot` as its only execution source of truth: staged FlyWire never gains causal fly-body claims; C. elegans remains the only active source topology.
- New visual assets are managed-storage URLs only; the project tree does not contain generated panorama files.
- در preview مرورگر، PBR materialهای GLB در مسیر readiness پایدار render نمی‌شدند. loader اکنون رنگ/texture منبع را به `StandardMaterial` هم‌نور با Garden تبدیل می‌کند؛ پس از آن FlyBody و C. elegans هر دو در clearing مرکزی دیده و تعویض گونه تأیید شد.
- حالت `NIGHT GARDEN` در daylight پنج‌درصد با panorama شب، ستاره‌ها، Garden کم‌نور و بدن خوانای C. elegans در مرورگر دیده شد؛ مقدار daylight فقط presentation را تغییر داد و label UI نیز همین مرز را حفظ کرد.
- حالت `OPEN DAYLIGHT` در daylight نوددرصد نیز با panorama صبح، روشنایی متعادل و C. elegans خوانا تأیید شد. تغییر daylight به `LIGHT FIELD` یا شمارش‌های ۲۷۹ N / ۶٬۲۶۱ E دست نزد.
- برای بازطراحی liquid-glass، مرجع Apple بر اولویت‌دادن محتوای مهم، استفادهٔ محدود از رنگ و hierarchy روشن تأکید می‌کند؛ galleryهای تخصصی نیز پنل‌های شناور با blur، border روشن و تراکم کم را مناسب‌تر از cardهای لایه‌لایه نشان دادند. مسیر انتخابی: یک نوار بالایی کوچک و شناور، دو پنل glass محدود و content-first، بدون تکرار متن/کنترل.
- sky rig فعلی از دو `Layer` تمام‌صفحه با alpha و اجرام سه‌بعدیِ ثابت استفاده می‌کند؛ برای دوربین مایل Garden، آسمان به نوار باریک عقب صحنه محدود می‌شود. رفع باید به background skybox/equirectangular مبتنی بر دوربین یا layer پس‌زمینهٔ پایدار منتقل شود، نه صرفاً افزایش opacity.
- بررسی مستقیم assets تأیید کرد که `garden-dawn-panorama` و `garden-night-panorama` تصویرهای افقیِ کامل از باغ‌اند، نه HDRI/equirectangular sky map. کشیدن آن‌ها روی sphere باعث برش و warp افق می‌شود. sky dome باید از asset آسمان-محض با projection equirectangular واقعی استفاده کند.
- بازبینی runtime پس از sky-only dome نشان داد آسمان اکنون کل میدان بالای Garden را بدون landscape-warp می‌پوشاند. قاب نخست روی `GOLDEN MORNING` (۶۸٪ daylight presentation-only) قرار گرفت و header به یک نشان glass کوچک در گوشهٔ چپ تقلیل یافت؛ slider همچنان مسیر واقعی نمایش صبح/شب است.
- آزمون مستقیم UI با `DAYLIGHT = 5%` نیز `NIGHT GARDEN` را فعال کرد و sky dome سیاه/آبی با ستاره‌های ریز، نمونه و پنل‌های خوانا را نمایش داد. این تغییر هیچ‌یک از شمارش‌ها یا execution FlyWire/C. elegans را تغییر نداد.
- تعویض مستقیم به *C. elegans* در UI جدید، زمینهٔ پنل را به `SOURCE TOPOLOGY ACTIVE`، شمارش‌ها را به ۲۷۹ N / ۶٬۲۶۱ E و caption را به `FORAGING` تغییر داد؛ مگس همچنان مسیر staged مستقل خود را حفظ می‌کند. این نشان می‌دهد UI ساده‌شده همچنان از `SimulationSnapshot` همگام می‌خواند.
