# FlyWire v783 Integration Checklist

- [x] Verify current FlyWire v783 access, licensing, attribution, and citation requirements against official sources.
- [x] Specify the DFLY v1 binary chunk contract for proofread neuron IDs, CSR offsets, sources, weights, neurotransmitter probabilities, and neuropil indices.
- [x] Add a streaming, local-only converter for `proofread_root_ids_783.npy` and `proofread_connections_783.feather`.
- [x] Generate a provenance-rich `manifest.json` with chunk SHA-256 checksums and transformation metadata.
- [x] Add deterministic converter fixtures and tests without committing FlyWire data.
- [x] Add browser manifest loading, checksum validation, HTTP range fetching, IndexedDB caching, and device-memory preflight.
- [x] Surface verified dataset status, data provenance, and loader failure reasons in the simulation interface.
- [x] Update documentation with exact installation, hosting, and scientific-boundary instructions.
- [x] Run type checks, converter tests, browser-loader tests, and static build validation.
- [x] Commit, push, checkpoint, and report the final integration path.

## Zero-Cost Remote-Pack Revision

- [ ] Research current no-cost remote hosts that can retain a large research dataset without relying on the user’s computer.
- [ ] Verify each candidate’s storage, bandwidth, public-download, CORS, and range-request limitations.
- [ ] Select a compatible free delivery model that respects FlyWire public-release use terms.
- [ ] Adapt the pack manifest and loader documentation for the selected host.
- [ ] Re-run loader, type, and production-build validation before publishing the remote-hosting revision.

## Logged-In Free-Hosting Setup

- [ ] Confirm the user’s active Zenodo and Hugging Face accounts in the browser.
- [ ] Compare public dataset-record and dataset-repository controls against the DFLY manifest requirements.
- [ ] Prepare, but do not publish, the selected record or repository metadata.
- [ ] Ask for explicit confirmation before creating a public record, uploading data, or publishing the dataset.

## My Greatest Sin Publication

- [x] Inventory every candidate source, bundle, generated asset, and dataset artifact with size and origin.
- [x] Exclude synthetic fixture internals, local development artifacts, secrets, and unlicensed source data from public release bundles.
- [x] Prepare a Hugging Face dataset card and Zenodo metadata/citation package for the approved release scope.
- [x] Prepare a portable Hugging Face Static Space build with bundled public visual assets.
- [x] Prepare a public Hugging Face dataset repository card that reserves the future DFLY-pack location without claiming to contain FlyWire data.
- [ ] Present exact filenames, sizes, visibility, licenses, and destination records for final approval.
- [ ] Create public records and upload only the approved files after final browser confirmation.
- [ ] Verify both published destinations and document the public URLs in the project.

## Whole-Brain Organism Simulation Revision

- [x] Inspect the user-selected GitHub repositories for existing whole-brain, connectome, neural-simulation, or organism-simulation assets and licenses.
- [x] Research public animal whole-brain datasets with explicit provenance, access terms, download format, and redistribution restrictions.
- [x] Compare viable candidates by neuron count, connection coverage, behavioural/body-model availability, browser delivery size, and scientific limitations.
- [x] Select a data/model boundary that does not claim consciousness, literal life, or biological validity beyond the evidence.
- [x] Draft a staged implementation plan for loading the selected data and coupling it to an explicit modelled sensory-motor body.

## Dual-Species Embodiment Revision

- [x] Define provenance, license, format, optimization, and attribution criteria for third-party 3D assets.
- [x] Find and verify a downloadable, redistributable 3D fly body source suitable for Babylon.js conversion.
- [x] Find and verify a downloadable, redistributable 3D C. elegans body source suitable for Babylon.js conversion.
- [x] Add a typed species profile and a visible species-selection control without implying that either organism is biologically alive.
- [x] Integrate lightweight three-dimensional bodies, distinct locomotion, source labels, and shared camera framing for both species.
- [x] Run browser, type, test, build, and visual validation before checkpointing the dual-species revision.
- [ ] Convert and simplify the externally sourced high-detail body meshes into attributed GLB assets before any future raw-mesh replacement.

## C. elegans Real-Connectome Execution Revision

- [x] Select one authoritative connectome release with explicit terms, version, citation, and permitted download path.
- [x] Download only the selected source tables outside the project tree and record SHA-256 values, sizes, columns, and source URLs.
- [x] Implement a source-specific converter to a provenance-rich C. elegans DFLY manifest and checksummed typed-array chunks.
- [x] Add deterministic source-schema and converter tests without committing the real source data to the repository.
- [x] Add a C. elegans pack activation path that preserves an explicit distinction between `SOURCE DATA` and modelled sensors, motor decoder, and body.
- [ ] Convert a licensed C. elegans model reference into an optimized GLB, upload it to managed web storage, and preserve attribution.
- [ ] Validate checksum loading, species switching, runtime behavior, type checks, tests, production build, and a browser interaction before checkpointing.

## User-Supplied Fly/Worm Repository Review

- [x] Inspect `erojasoficial-byte/fly-brain`, `lixiang1076/fly-brain`, and `heyseth/worm-sim` for code, data, provenance, licenses, and unsafe/undocumented dependencies.
- [x] Determine whether either fly repository contains a real FlyWire-derived 140k-neuron graph, a converter, a model-only approximation, or only visualization assets.
- [x] Cross-check any claimed FlyWire files against official release identifiers, source terms, checksums, and permitted redistribution.
- [x] Compare compatible repository components against the existing DFLY contract and use only clearly licensed, provenance-preserving code or data.
- [ ] If a valid source pack is available, add staged 140k-neuron preflight/cache support; otherwise preserve the explicit no-data boundary and document the blocker.

## Confirmed Official FlyWire v783 Staged Path

- [x] Record the user-confirmed noncommercial use boundary, CC BY-NC 4.0 notice, citations, and no-third-party-mirror rule.
- [x] Retrieve `proofread_root_ids_783.npy` and `proofread_connections_783.feather` directly from the official FlyWire release outside the project tree.
- [x] Verify source file sizes and SHA-256 checksums before any transform.
- [x] Run the existing streaming converter outside the project tree and validate the generated DFLY manifest and every chunk checksum.
- [x] Keep the resulting real-data pack outside the git repository and all public release bundles until the publication gate is separately reviewed.
- [x] Add an explicit FlyWire staged profile with CC BY-NC attribution, source-pack preflight, cache progress and no-CPU-activation warning.
- [x] Add a WebGPU sparse backend capability/benchmark gate before allowing a 140k-neuron pack to execute.

## Remove Fly Synthetic Fallback

- [x] Remove the 96-neuron synthetic LIF fixture from the Drosophila species path.
- [x] Make Drosophila render an explicit staged/idle FlyWire state with no synthetic spikes, neuron count, or synapse count.
- [x] Keep C. elegans source-topology execution and its 279-neuron live HUD unaffected by fly fallback removal.
- [x] Add tests and browser validation for fly staged mode and C. elegans active mode.

## React HUD Key Integrity Fix

- [x] Replace duplicate activity-marker keys with deterministic, unique keys for zero-length and staged-network states.
- [x] Add a regression test that verifies empty and one-neuron activity buffers produce unique marker keys.
- [x] Re-run type checks, tests, production build, and browser-console validation before checkpointing.

## Three-Dimensional Garden Enrichment

- [x] Inventory the current garden props, visual gaps, draw-call budget, and authored-object boundaries.
- [x] Select lightweight, web-ready models or authored substitutes for vegetation, stones, habitat furniture, and sensory props with clear license/attribution records.
- [x] Integrate distinct garden clusters with LOD-friendly Babylon assets and preserve stable simulation controls and labels.
- [x] Validate desktop and mobile composition, frame rate, attribution, type checks, tests, build, and browser rendering before checkpointing.

## Complete Specimen Bodies and Animated Garden

- [x] Define anatomical, licensing, optimization, animation-anchor and provenance requirements for complete fly and worm GLB replacements.
- [x] Find and evaluate clearly licensed, browser-suitable full-body model sources for Drosophila and C. elegans.
- [x] Prepare optimized GLB variants and retain separate causal motor mappings for each specimen.
- [x] Add a small waterfall, wooden bridge, grass sway and firefly-motion effects without coupling them to scientific runtime data.
- [x] Validate dual-species switching, desktop/mobile rendering, performance, type checks, tests, build, browser console and provenance before checkpointing.

## High-Quality User-Supplied Specimen Revision

- [x] Inspect the user-supplied Drosophila and C. elegans GLBs for mesh, material, texture, transform, triangle-budget and attribution metadata.
- [x] Create quality-preserving, browser-safe GLB derivatives outside the project tree and upload only the selected outputs to managed web storage.
- [x] Add modelled `DAYLIGHT` and `WATERFALL FLOW` controls that change Babylon presentation only, never source topology or neural runtime data.
- [x] Replace the current presentation-body URLs, retain separate motor mappings, and document CC BY attribution for the supplied models.
- [x] Remove any garden prop that reads as a duplicate organism or a white placeholder; replace the bridge with a dedicated lightweight wood construction.
- [x] Reframe the supplied C. elegans display pose so its complete silhouette remains legible at rest and during modelled locomotion.
- [x] Validate both selected species, environmental controls, type checks, tests, production build and browser console before checkpointing.

## Articulated Specimen-Motion Revision

- [x] Inspect the node hierarchy, mesh names, local axes, materials and animation data of the active Drosophila GLB.
- [x] Correct the fly’s resting orientation and expose a clear modelled wing-flap signal.
- [x] Build independent modelled wing pivots and three-segment leg rigs because the supplied GLB has no skeleton or animation tracks.
- [x] Replace root-only C. elegans motion with a visible travelling body wave while retaining the source-connectome boundary.
- [x] Validate both species in the browser, then run type checks, tests and a production build before checkpointing.

## Public Rigged Specimen Replacement

- [x] جست‌وجوی مدل‌های عمومیِ واقعی و قابل‌دانلود برای مگس و C. elegans، بدون نیاز به ورود یا CAPTCHA.
- [x] تأیید مجوز، صفحهٔ منبع، ساختار GLB/GLTF، جهت محورها، مواد، شمار مش‌ها و وجود واقعی skeleton یا animation track پیش از ورود به پروژه.
- [x] ردکردن هر مدل بدون بال و پا در مگس، بدون بدن واحد قابل‌تشخیص در کرم، یا دارای قطعات کمکی/محورهای ناپایدار.
- [x] یکپارچه‌سازی دارایی‌های منتخب با هندسهٔ منبع و پیوت/سطح واقعی، و برچسب‌گذاری دقیق هر حرکت تکمیلی به‌عنوان MODELLED MAPPING.
- [x] اعتبارسنجی نشست تازهٔ مرورگر، تعویض گونه، حرکت، کنسول، TypeScript، آزمون‌ها و build پیش از checkpoint.

## GitHub Handoff and Visual Repair

- [x] بررسی remote و شاخهٔ پروژه، سپس ثبت نسخهٔ فعلی در مخزن GitHub منتخب بدون حذف کار محلی.
- [x] بازتولید وضعیت «مدل دیده نمی‌شود / زمین مشکل دارد» در نشست تازه و ثبت علت فنی قابل‌آزمون: مگس حول محور ارتفاع وارونه بود و زمین کوچکِ دارای بافت پرتکرار/کم‌نور خوانایی باغ را کاهش می‌داد.
- [x] اصلاح دوربین، نور، چیدمان مدل یا هندسه/متریال زمین فقط پس از مشاهدهٔ مستقیم اشکال.
- [x] تأیید مگس و C. elegans، تعویض گونه، زمین و کنسول مرورگر؛ سپس اجرای type check، آزمون و build.
- [x] ثبت checkpoint و گزارش نتیجه با پیوند نسخهٔ GitHub.

## Specimen Assembly and Data-to-Motion Repair

- [x] ترسیم مسیر کامل دادهٔ منبع تا `MotorFrame` و تعیین دقیق تفاوت اجرای C. elegans با FlyWire staged.
- [x] بازرسی نام‌ها، والدها، پیوت‌ها، مختصات محلی و اتصال همهٔ ۶۵ قطعهٔ NeuroMechFly در صحنهٔ Babylon.
- [x] اصلاح فقط پیوت‌ها و زنجیره‌های قطعاتی که باعث جدایی پا، بال یا بدنه می‌شوند؛ بدون جایگزینی هندسهٔ واقعی منبع.
- [x] اتصال شاخص‌های واقعی خروجی موتورِ C. elegans به شدت موج Cuticle و حرکت ریشه، با برچسب MODELLED MAPPING.
- [x] برای FlyWire staged، نمایش صریح حالت بدون اجرای داده و جلوگیری از نسبت‌دادن حرکت مگس به دادهٔ واقعی FlyWire.
- [x] اعتبارسنجی دو فریم/دو گونه، تعویض گونه، کنسول، TypeScript، آزمون‌ها و build پیش از checkpoint.

## Babylon Shader Compilation Repair

- [x] بازتولید خطای `<!doctype html>` در shader و ثبت effect یا مسیر واردسازی عامل آن: effect لایه با uniforms `scale` و `textureSampler` بدون ثبت قطعی GLSL به fallback مسیر SPA می‌رسید.
- [x] بررسی ثبت shaderهای StandardMaterial/glTF و هر URL متناظر در Vite، بدون تغییر مدل‌ها یا دادهٔ منبع.
- [x] اصلاح واردسازی یا پیکربندی تا GLSL از ماژول Babylon ثبت‌شده دریافت شود، نه پاسخ HTML مسیر SPA.
- [x] تأیید نشست تازهٔ fly و C. elegans، کنسول بدون خطای shader، TypeScript، آزمون‌ها و build.

## Specimen Orientation and Locomotion Acceptance

- [x] کنترل مدل‌ها در حالت مکث و از نمای جانبی/سه‌ربع: مگس سر رو به مسیر، پشت رو به بالا و پاها زیر بدن؛ کرم روی سطح و در راستای مسیر باشد.
- [x] اندازه‌گیری مرجع پیوت‌ها و محورهای محلی پیش از اعمال هر حرکت؛ هر چرخش باید حول مفصل یا محور طولی درست رخ دهد.
- [x] قبول مگس فقط در صورت بال‌زدن هم‌زمانِ قابل‌دیدن و گام‌برداری بدون جداشدن پا/بال؛ قبول کرم فقط در صورت موج طولی و پیشروی قابل‌مشاهده.
- [x] مدل‌های فعلی پس از اصلاح جهت و ژست، معیار دیداری را پاس کردند؛ مسیر مدل عمومیِ جایگزین یا نسخهٔ کاملِ جزئیات‌دار فقط در صورت شکست اعتبارسنجی نهایی استفاده می‌شود.
- [x] تأیید دوگونه در مرورگر، کنسول، TypeScript، آزمون و build پیش از checkpoint.

## Mandatory Specimen Replacement

- [x] بازنشسته‌کردن NeuroMechFly و WormBase Cuticle از مسیر فعال؛ این دو مدل از نظر کاربر پذیرفته نیستند.
- [x] انتخاب مگس جایگزین فقط در صورت دیده‌شدن بی‌ابهامِ سر، گردن، سینه، شکم، شش پا و دو بال در حالت سکون و حرکت.
- [x] انتخاب کرم جایگزین فقط در صورت سیلوئت طبیعی، سر و دم قابل‌تشخیص، بدن منفرد، جهت درست و موج خزشی طبیعی.
- [x] دانلود بدون ورود، ثبت مجوز و رندر دو نمای توقف/حرکت برای هر نامزد پیش از اتصال به برنامه.
- [x] یکپارچه‌سازی فقط مدل‌های پذیرفته‌شده و اعتبارسنجی مرورگر، کنسول، TypeScript، آزمون و build پیش از checkpoint.

## Directional Motion and Scientific Control Audit

- [x] اندازه‌گیری و اصلاح بردار حرکت ریشهٔ مگس نسبت به بردار واقعی سر در مدل FlyBody؛ مگس نباید عقب‌عقب حرکت کند.
- [x] اعتبارسنجی دیداری حرکت رو به جلوِ مگس در دو فریم زمان‌دار و حفظ سر، پاها و بال‌ها در جهت صحیح.
- [x] ممیزی مسیرهای دادهٔ هر گونه از محرک محیط تا `MotorFrame` و بدن، با تفکیک صریح `SOURCE DATA` از `MODELLED MAPPING`.
- [x] افزودن نمایش صادقانهٔ وضعیت کنترل بدنی در HUD، بدون ادعای آگاهی محیطی یا کنترل داده‌محور برای FlyWire staged.
- [x] اجرای آزمون‌ها، build، کنسول تازه و ثبت checkpoint فقط پس از اعتبارسنجی دوگونه.

## Official FlyWire Activation and Scientific-Embodiment Path

- [x] تأیید دوبارهٔ مجوز، روش دریافت رسمی، نسخه، هش و شرایط عدم‌بازتوزیع بستهٔ FlyWire v783 پیش از هر فعال‌سازی.
- [ ] اجرای benchmark واقعیِ sparse WebGPU روی دستگاه هدف با بستهٔ رسمی کامل و ثبت حافظه، زمان گام و پایداری مرورگر؛ محیط فعلی `requestAdapter()` را رد کرد و زمان معتبر تولید نشد.
- [ ] فعال‌سازی فقط ستون‌های checksum-verified رسمی در مسیر مگس؛ حذف هر مسیر آزمایشی یا نمایش‌دهنده از نتایج ادعاشدهٔ شبکه.
- [x] طراحی و مستندسازی جداگانهٔ نگاشت حسگرهای محیط به گروه‌های نورونی و نگاشت نورون‌ها به عضلات؛ هر بخش فاقد شواهد مستقیم باید `MODELLED MAPPING` بماند.
- [ ] اعتبارسنجی با معیارهای منتشرشدهٔ پاسخ حسی/رفتاری و مقایسه با دادهٔ آزمایشگاهی پیش از هر ادعای «حرکت کاملاً منطبق با واقعیت».

## Requested v783 WebGPU Benchmark and Sensorimotor Pilot

- [x] فهرست‌برداری از فایل‌های رسمی v783 موجود، هش‌های محلی، manifest و مصرف حافظهٔ دقیق پیش از benchmark.
- [x] تلاش برای اجرای benchmark فقط با دادهٔ رسمی و گزارش جداگانهٔ زمان decode، upload، گام sparse و مصرف حافظهٔ GPU/CPU؛ adapter مرورگر رد شد، پس هیچ metric ساختگی ثبت نشد.
- [x] رد فعال‌سازی کامل در محیط فعلی بر اساس ردشدن adapter، بدون fallback یا دادهٔ ساختگی.
- [x] انتخاب یک زیرمدار حس–حرکت با شواهد منتشرشده، annotation قابل‌ردیابی و مبدأ/مقصد مشخص در FlyWire v783.
- [x] پیاده‌سازی اجراییِ گیت‌شدهٔ پایلوت زیرمدار با خوانش خروجی؛ runtime فقط پس از checksum، حضور ریشه‌ها و adapter معتبر، score ساختاری MN9 را می‌خواند. در مرورگر فعلی adapter رد شد و هیچ خروجی ساختگی تولید نشد.

## FlyWire Sugar-GRN → MN9 Embodiment Pilot

- [x] ساخت هستهٔ deterministic و قابل‌آزمون پایلوت از شناسه‌های رسمی sugar-GRN، واسط‌های دوگامی و MN9، بدون استفاده از شماره‌های root به‌صورت `Number` ناامن.
- [x] بارگذاری گزارش شاهد checksum-verified پایلوت و جلوگیری از آغاز تحریک هنگامی که WebGPU adapter یا دادهٔ منبع معتبر در دسترس نیست.
- [x] افزودن ریگ جدا و محدودِ خرطوم در FlyBody؛ خروجی فقط باید از خوانش MN9ِ پایلوت بیاید و هرگز گام، بال یا حرکت ریشه را کنترل نکند.
- [x] برچسب‌گذاری روشنِ `SOURCE DATA` برای گره‌ها/لبه‌ها و `MODELLED SENSOR INPUT`/`MODELLED MOTOR DECODER` برای تبدیل قند و خرطوم.
- [ ] اجرای آزمایش شدت–پاسخ و آزمایش خاموش‌سازی/ablation در هستهٔ پایلوت، ثبت نتیجهٔ قابل‌بازبینی؛ این کار فقط روی adapter معتبر مجاز است و وضعیت blocked مرورگر فعلی باید حفظ شود.

## FlyWire Adapter-Ready Pilot Continuation

- [x] تعریف قرارداد capability و budget دستگاه برای adapter معتبر، شامل storage-buffer limit، timestamp-query availability و دلیل توقف قابل‌نمایش در HUD.
- [x] افزودن ورودی پایلوت برای شدت تحریک و ablation انتخابی sugar-GRN، با حفظ شناسه‌های root به‌صورت رشته/BigInt و بدون مسیر CPU.
- [ ] افزودن kernel و readback لازم برای گزارش کنترل مثبت/منفی MN9 تنها روی WebGPU adapter معتبر.
- [ ] افزودن آزمون‌های خالص برای قرارداد ورودی/ablation، نرمال‌سازی خوانش و جلوگیری از فعال‌شدن مسیر بدن در حالت blocked.
- [ ] ثبت معیارهای واقعی GPU، شدت–پاسخ و ablation روی دستگاه سازگار؛ تا پیش از آن `0 N / 0 E` برای FlyWire در GameWorld حفظ شود.

## FlyWire v783 Transmitter-Aware LIF and Experimental Protocol

- [x] تأیید ستون‌های رسمی احتمال ناقل، ترتیب شش کانال، dtype/stride، مجوز و provenance برای مشتق v783 LIF.
- [x] تعریف protocol نسخه‌دار شدت–پاسخ برای نرخ‌های ۰، ۲۵، ۵۰، ۱۰۰، ۱۵۰ و ۲۰۰ Hz و معیار ثبت MN9 بدون تولید نتیجهٔ ساختگی.
- [ ] تعریف protocol ablation نسخه‌دار با کنترل baseline، input-ablation و حذف انتخابیِ مسیر فقط در صورت وجود تعریف علمیِ معتبر.
- [x] تولید مشتق checksum-verified خارج از repository شامل ستون‌های probability ناقل و manifest جداگانهٔ LIF.
- [x] اعتبارسنجی تعداد، stride، SHA-256 و ناسازگاری‌های نسخهٔ v783 پیش از هر upload مدیریت‌شده.
- [ ] اجرای protocol روی WebGPU adapter معتبر و ثبت raw MN9 readout، memory، latency و وضعیت timestamp-query.
- [ ] اضافه‌کردن LIF گیت‌شده تنها پس از کامل‌شدن قرارداد ناقل و اجرای benchmark معتبر؛ تا آن زمان kernel ساختاری به‌صورت صریح non-physiological بماند.
- [ ] یافتن یا تولید دادهٔ site-level دارای cleft-score و preprocessor بازتولیدپذیر برای طبقه‌بندی ناقل neuron-level مطابق روش Shiu et al.; probabilityهای connection-row به‌تنهایی برای این جایگزینی کافی نیستند.

## WebGPU Re-execution and Site-Level LIF Validation

- [ ] شناسایی یک محیط مرورگر دارای WebGPU adapter واقعی و ثبت vendor-independent capability/budget پیش از اجرای protocol.
- [ ] اجرای baseline و input-ablation در نرخ‌های protocol روی adapter معتبر و ثبت raw MN9 readout، latency، حافظه و timestamp-query.
- [ ] یافتن منبع رسمی یا API برای site-level neurotransmitter prediction و cleft-score مرتبط با release v783 یا مستندسازی دقیقِ نبود آن.
- [ ] اعتبارسنجی schema، مجوز، version alignment و identifier alignment دادهٔ site-level پیش از ترکیب با pack v783.
- [ ] ساخت preprocessor قطعی برای تعیین transmitter class در سطح نورون مطابق آستانهٔ مقاله، به‌همراه آزمون‌ها و گزارش checksum.
- [ ] ساخت kernel LIF فقط پس از عبور preprocessor، با sign/weight provenance، تست kernel و مسیر blocked صریح برای دادهٔ ناکامل.
- [ ] در صورت آماده‌شدن تغییرات، checkpoint و push به GitHub خصوصی main؛ انتشار عمومی جداگانه و فقط پس از تأیید کاربر انجام می‌شود.

## Offline Site-Level Subcircuit Validation (Not Full-FlyWire Fallback)

- [x] تکمیل download و MD5 رسمی `flywire_synapses_783.feather` و اجرای preprocessor sign neuron-level روی rootهای proofread v783.
- [x] استخراج زیرگراف sugar-GRN → واسطه‌ها → MN9 از دادهٔ رسمی؛ اندازه، root IDs، یال‌ها و signهای طبقه‌بندی‌نشده را ثبت کن.
- [x] تعریف اجرای LIF آفلاین برای زیرگراف فقط با ثابت‌های منبع و ثبت seed/trial؛ هیچ شمارش FlyWire در GameWorld تغییر نکند.
- [x] اجرای response sweep و input-ablation آفلاین، همراه با raw MN9 spike/rate و گزارش محدودیت‌ها.
- [ ] برچسب‌گذاری همهٔ خروجی‌ها به‌صورت `OFFLINE SUBGRAPH VALIDATION` و جلوگیری از ارسال نتیجه به FlyBody یا WebGPU benchmark.

## Sensory Expansion and Larger MN9 Subcircuit

- [ ] گردآوری منابع و شناسه‌های root برای ورودی بویایی و مکانورسپتوریِ قابل‌ردیابی در release v783، با تفکیک SOURCE DATA از stimulus encoding مدل‌شده.
- [x] تحلیل reachability چندگام از جمعیت‌های حسی منتخب به MN9 و انتخاب زیرمدار بر اساس مسیرهای واقعی، sign معتبر و اندازهٔ قابل‌اجرای آفلاین.
- [ ] تعریف protocol بویایی/مکانیکیِ versioned با نرخ Poisson مدل‌شده، control و ablation؛ هیچ slider محیطی نباید بدون این برچسب به شبکه تزریق شود.
- [x] اجرای LIF آفلاین روی زیرمدار بزرگ‌تر، ثبت raw MN9 output و مقایسه با کنترل منفی بدون ادعای رفتار زیستی کامل.
- [ ] بررسی Neon، object storage و گزینه‌های GPU/WebGPU از نظر نقش صحیح در ذخیره، query یا محاسبه؛ تصمیم نباید دادهٔ خام را وارد repository کند.
- [x] افزودن یک جمعیت حسیِ دارای root ID عمومی (water-GRN لابلایی) و اجرای corridor چهارhop مقایسه‌ای به MN9، با حفظ برچسب مدل‌شدهٔ stimulus encoding.

## GitHub Service and Simulation Search

- [x] جست‌وجوی GitHub برای کلاینت/API معتبر FlyWire/CAVE و ابزارهای query نسخه‌محور دادهٔ connectome.
- [x] جست‌وجوی GitHub برای runnerهای GPU/server و شبیه‌سازی sparse که license، نگهداری و معماری‌شان برای v783 قابل‌ارزیابی باشد.
- [x] بررسی README، مجوز، فعالیت، نیاز سخت‌افزاری، وابستگی به version داده و امکان بازتولید گزینه‌های برتر.
- [x] رد صریح پروژه‌هایی که شبیه‌سازی عمومی/AI دارند اما source-data، provenance یا validation لازم برای FlyWire ندارند.
- [x] ثبت shortlist و معماری پیشنهادی: object storage، data/query API، server/GPU و frontend، بدون ورود دادهٔ حجیم به repository.

## v783 Annotation Pin and Mechanical Sensor Continuation

- [x] دریافت و checksum-verify کردن release tag مشخص از `flywire_annotations` که با materialization 783 هم‌تراز است؛ آن را خارج از repository نگه دار.
- [x] جست‌وجوی annotation pinned برای یک جمعیت مکانورسپتوریِ دارای root ID عمومی و بازتولیدپذیر؛ در نبود آن، JON list عمومی Shiu را فقط به‌عنوان candidate جداگانه بررسی کن.
- [x] استخراج corridor چهارhop مکانیکی→MN9، گزارش root presence، sign و size، و اجرا فقط در صورت عبور gate.
- [x] ساخت prototype مستقل Brian2CUDA با equationهای مرجع، manifest-verified input و تشخیص صریح GPU/CUDA؛ بدون GPU نباید fallback کامل اجرا شود.
- [x] مستندسازی تفاوت دقیق بین runner آفلاین NumPy، Brian2CUDA و WebGPU browser قبل از هر ادعای performance یا کنترل بدن.

## Repository Identity and README

- [x] ممیزی remote، URLهای مستندات و نام‌های نمایشی پیش از تغییر نام مخزن خصوصی به `my-greatest-sin`.
- [x] بازنویسی README با معرفی پروژه، وضعیت علمی دقیق، راه‌اندازی محلی، معماری داده، مسیرهای validation و مرزهای مدل.
- [x] تغییر نام مخزن خصوصی GitHub از `digital-fly` به `my-greatest-sin` و بررسی به‌روزرسانی remote محلی.
- [x] ثبت checkpoint، push نام/README جدید و بازبینی قابل‌دسترسی‌بودن URL مخزن تازه.

## NVIDIA Brian2CUDA and md-C Continuation

- [x] ایجاد محیط pinned برای Brian2CUDA/NVIDIA و اجرای preflight شامل driver، `nvidia-smi`، `nvcc`، Brian2 و Brian2CUDA؛ در نبود GPU نتیجه باید blocked بماند.
- [x] پیاده‌سازی smoke test checksum-verified برای fixture کوچک CUDA، capهای corridor و گزارش raw MN9 فقط روی NVIDIA معتبر؛ sandbox بدون GPU درست `BLOCKED` شد.
- [x] اجرای واقعی smoke fixture و corridor checksum-verified روی Tesla T4/Colab معتبر و ثبت GPU/driver/CUDA/report checksum؛ corridor ۱٬۱۱۵ node / ۱۳٬۳۴۶ edge در ۱۰۰ Hz، ۱۱۰ spike مدل‌شدهٔ MN9 و SHA-256 گزارش `c95254c4dfbb9fd8310cb2b81611311240c178ed97e4a26adf5b0ff6ff4dcdf1` دارد. این نتیجه فقط server-side bounded model است.
- [ ] یافتن root IDهای md-C از annotation یا منبع version-aligned v783؛ بررسی مقاله، Dryad و annotation pin‌شدهٔ v783 به نتیجه نرسید و نام ژنتیکی/مقاله به‌تنهایی کافی نیست.
- [ ] استخراج corridor md-C→MN9، بررسی root presence و signهای طبقه‌بندی‌نشده، و اجرای LIF فقط پس از گذر از gate.
- [ ] ثبت جداگانهٔ نتایج Brian2CUDA، runner آفلاین و WebGPU؛ هیچ‌کدام نباید بدون معیار معتبر به FlyBody متصل شود.
- [ ] یافتن crosswalk بازتولیدپذیر rootهای md-C و هدف‌های صحیح MN11/MN12 برای v783؛ md-C نباید به MN9 نگاشت شود.

## md-C Crosswalk and Bounded CPU Continuation

- [x] جست‌وجوی چندمنبعی در Codex/CAVE، CATMAID/FAFB، مقاله، Dryad و repositoryهای مرتبط برای crosswalk md-C و MN11/MN12؛ نتیجهٔ فعلی `BLOCKED: NO VERSION-ALIGNED ROOT CROSSWALK` است و در `docs/MD_C_CROSSWALK_SEARCH.md` ثبت شد.
- [x] ثبت منبع، version/materialization و نتیجهٔ هر مسیر جست‌وجو؛ هیچ candidate فاقد crosswalk به‌عنوان md-C یا MN11/MN12 اجرا نشد.
- [x] ساخت CPU runner فقط برای corridor کوچک checksum-verified با schema، bound سخت شمار node/edge و label `CPU OFFLINE SUBGRAPH VALIDATION`.
- [x] تضمین با آزمون و audit مسیر که runner pack بزرگ‌تر از ۲٬۰۰۰ node را رد می‌کند، input-ablation را صفر می‌کند و فقط state React را به‌روزرسانی می‌کند؛ `GameWorld` و FlyBody خروجی ندارند.
- [x] اجرای baseline/ablation روی corridor تأییدشدهٔ sugar→MN9، نه md-C؛ UI در نبود rootهای md-C/MN11/MN12 نتیجهٔ `BLOCKED: NO VERSION-ALIGNED ROOT CROSSWALK` را حفظ می‌کند.
- [x] دریافت و جست‌وجوی TSV رسمی `flywire_annotations` در tag v3.1.0 هم‌نسخه با v783؛ `md-C`، `MN11`، `MN12` و `cibarium` هیچ hit عمومی نداشتند.
- [x] نمایش gate غیرقابل‌اجرا برای `md-C → MN11/MN12` در HUD و افزودن آزمون regression؛ gate صراحتاً substitute pharyngeal و `MN9` را رد می‌کند.
- [x] افزودن cancellation واقعی به CPU corridor با `AbortController` برای fetch و propagation، کنترل `CANCEL CPU CORRIDOR` و آزمون pre-abort؛ هیچ مسیر GameWorld/FlyBody افزوده نشد.

## Independent Completion Pass — Awaiting Authentication Only Where Required

- [x] ممیزی نهایی همهٔ مسیرهای عمومی crosswalk و ثبت دقیق آخرین blockerهای Codex/CAVE و CATMAID در سند پژوهش؛ queryهای authenticated static Codex برای md-C، MN11، MN12 و intersection ژنی همگی صفر بودند و CAVE token همچنان در دسترس نیست.
- [x] افزودن cancellation واقعی به اجرای CPU محدود، همراه با آزمون توقف و تضمین تداوم `0 N / 0 E` برای FlyWire.
- [x] تکمیل smoke-test و راهنمای checksum برای Brian2CUDA/Colab، بدون اجرای CUDA روی سخت‌افزار نامعتبر یا fallback پنهان CPU.
- [ ] اجرای type check، کل آزمون‌ها، build، browser validation، checkpoint و همگام‌سازی مخزن خصوصی پس از این pass.

## Materialization, Codex/CAVE and T4 Execution Request

- [x] تأیید شمارهٔ materialization و release رسمی FAFB v783 از FAQ Codex، annotation releases و مستندات CAVE؛ static snapshot و LTS materialization هر دو ۷۸۳ هستند.
- [ ] پس از authentication، ثبت timestamp/query provenance دقیق CAVE همراه با export و SHA-256 پیش از پذیرش هر root-ID.
- [x] آغاز ورود Google به Codex در browser session و اجرای structured queryهای `md-C`، `Tmc`، `nompC`، `MN11` و `MN12`؛ همهٔ matchهای دقیق/تقاطع ژنی صفر بود و هیچ root-ID افزوده نشد.
- [ ] پس از ورود، ذخیرهٔ export/version/materialization و افزودن crosswalk فقط اگر یک mapping دقیق، قابل‌بازتولید و biologically targeted به MN11/MN12 پیدا شد.
- [x] اجرای notebook در Colab Tesla T4/NVIDIA و ثبت `nvidia-smi`/`nvcc`، fixture PASS، corridor SHA-256 و report SHA-256؛ جزئیات کامل در `docs/BRIAN2CUDA_NVIDIA_RUNBOOK.md` است و هیچ خروجی به FlyBody/GameWorld وصل نشده است.

## CAVE Token Access Blocker

- [x] تأیید ورود Google به Codex و اجرای static queryهای v783؛ md-C، MN11، MN12 و intersection ژنی نتیجهٔ صفر داشتند.
- [ ] درخواست یا ایجاد رسمی token CAVE/FlyWire از صفحهٔ Account؛ user گزارش داد token موجود ندارد و token هرگز در چت ثبت نمی‌شود.
- [ ] اجرای Map Root IDs فقط پس از مجوز رسمی CAVE و ثبت datastack/materialization/query/export checksum.

## FlyWire Access Request — Consent Gate

- [x] استخراج و ثبت شرایط رسمی درخواست `brain_access`، دامنهٔ مجوز و اطلاعات موردنیاز؛ ارسال فقط پس از تأیید صریح کاربر انجام شد و receipt مشاهده نشد.
- [x] تهیهٔ متن دقیق و حداقلی برای کاربرد پژوهشی non-commercialِ root mapping/materialization 783، بدون ادعای کنترل حیوان یا اجرای full graph.
- [x] تکمیل فیلدهای غیرحساس فرم و دریافت تأیید کاربر پیش از submission؛ وضعیت دقیق `SUBMISSION ATTEMPTED — RECEIPT NOT OBSERVED` است و فرم تکرار نمی‌شود.

## Garden World, Day–Night and Runtime-Synchronous UI Revision

- [x] بررسی مستقیمِ ساختار صحنهٔ Babylon، دارایی‌های Garden، کنترل‌های محیط و قراردادهای فعلی نمایش/دادهٔ دوگونه.
- [x] طراحی و پیاده‌سازی چرخهٔ دیداریِ صبح، غروب و شب با sky panorama، نور خورشید/ماه، ستاره‌ها، firefly و نورهای محیطی؛ این چرخه فقط presentation-modelled ماند.
- [x] ارتقای دارایی‌ها و ترکیب‌بندی Garden با مسیر سنگی، گیاهان، درخت‌ها، سنگ‌ها، آبشار نواری، حوض/پل چوبی، قارچ‌ها و clearing مرکزی با مقیاس مناسب برای هر دو بدن سه‌بعدی.
- [x] بازطراحی HUD و کنترل‌ها به‌صورت context-aware تا حالت FlyWire staged مگس و source-topology فعال C. elegans را جدا، خوانا و هم‌راستا با قابلیت‌های واقعی نمایش دهد.
- [x] اعتبارسنجی تعامل‌های روز/شب، تعویض گونه، حدود ۲۰–۲۸ FPS در preview، console، TypeScript، ۲۸ آزمون، build و screenshot پیش از checkpoint.

## Sky Repair and Liquid-Glass Interface Revision

- [x] بازتولید و ریشه‌یابی خرابی sky panorama در frame نخست و حالت‌های صبح/شب؛ panoramaهای باغ به sky-only domeهای دوربین‌پایدار تبدیل شدند و چرخهٔ presentation-only حفظ شد.
- [x] مطالعهٔ نمونه‌های معتبر glassmorphism/liquid-glass و استخراج الگوی کم‌تراکم، خوانا و مناسب ابزار علمی؛ اصل انتخابی content-first، blur محدود، edge روشن و رنگ semantic است.
- [x] جایگزینی هدر فعلی با نشان شناورِ کم‌حجم liquid-glass، هویت بصری روشن و حذف telemetry تکراری.
- [x] حذف یا فشرده‌سازی کنترل‌ها و متن‌های غیرضروری؛ وضعیت گونه، کنترل‌های واقعی، گیت‌های علمی و feedback اجرایی حفظ شدند.
- [x] اعتبارسنجی Sky صبح/شب، تعویض گونه، console خالی، TypeScript، ۲۸ test، build و screenshot پیش از checkpoint.
