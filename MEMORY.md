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
- اولویت فعلی روی C. elegans است: food seeking و obstacle avoidance باید به‌عنوان steering/body model شفاف، پس از اجرای source topology و با injection از cueهای موجود انجام شوند. graph، شمارش‌ها، مسیر FlyWire staged و ادعای «زنده‌بودن» تغییر نمی‌کنند.
- در preview، تعویض به C. elegans با source topology فعالِ ۲۷۹ N / ۶٬۲۶۱ E، وضعیت `SEEKING FOOD` و برچسب `MODELLED NAVIGATION` را نشان داد؛ فاصلهٔ غذا و forage rock نیز visible است. سنگ جدید نزدیک مسیر هدف قرار گرفت تا حالت اجتناب پس از نزدیک‌شدن قابل‌مشاهده باشد.
- با Auto Demo، کرم واقعاً به حالت `AVOIDING OBSTACLE` رسید: UI فاصلهٔ food/rock، turn حدود ۸۹٪ و سرعت محدود را نشان داد و بدن پیش از forage rock چرخید. console تازه خروجی خطا نداشت. این اعتبارسنجی فقط navigation/body mapping مدل‌شده است.
- regression مرورگر پس از بازگشت به مگس تأیید کرد FlyWire همچنان `STAGED OBSERVATION` با ۰ N / ۰ E و `DISPLAY GAIT` است؛ behavior کرم به fly path نشت نکرد و console خالی ماند.
- ممیزی اولیهٔ حرکت C. elegans نشان داد `SEEKING FOOD` و body wave قابل‌خواندن‌اند، اما در نبود/دوربودن هدف، حرکت هنوز خطی و کم‌تنوع است و turn نزدیک obstacle می‌تواند سریع به نظر برسد. بهبود بعدی باید turn smoothing، حالت rest، exploration کنترل‌شده و حافظهٔ کوتاه‌مدت بازدیدها را در لایهٔ MODELLED MAPPING اضافه کند.
- قرارداد توسعهٔ بعدی: سه food target با ارزش ثابت و cue مشترک، حافظهٔ محدود ۱۲ نقطهٔ مسیر / ۴ بازدید غذا، rest کوتاه بعد از feeding و exploration قطعی بدون غذا. این‌ها policy نمایشی/decoder هستند؛ topology منبع C. elegans و هیچ ادعای حیات یا cognition تغییر نمی‌کند.
- پس از پیاده‌سازی اولیه، preview C. elegans مقصد `BACTERIAL LAWN` با value ۱۰۰٪، PATH 2/12 و turn ۱۱٪ را نشان داد. سه marker رنگی غذا در Garden قابل‌دیدن‌اند و smoothing، چرخش اولیه را ملایم‌تر از مسیر قبلی نگه داشت.
- مشاهدهٔ ادامهٔ حرکت نشان داد body wave و چرخش اکنون پیوسته‌ترند، هرچند مسیر food-seeking هنوز عمداً کند و قابل‌خواندن است. کنترل range مرورگر در تست، تغییرات incremental ۰٫۰۵ را اعمال کرد؛ آزمون EXPLORING در سطح unit deterministic می‌ماند و برای UI باید کنترل تعاملی در صورت لزوم با key events آزموده شود.
- با کاهش field غذا تا زیر آستانه، preview به `EXPLORING` تغییر کرد و `NO FOOD FIELD / VALUE 0% / PATH 12/12` را همراه موج ملایم و turn حدود ۲۲٪ نمایش داد. console تازه فقط رکورد آزمون DOM پیشین را داشت و خطای runtime نداشت.
- پس از reload نهایی، مسیر FlyWire-staged مگس با سه marker غذای نمایشی در Garden پایدار ماند و console تازه کاملاً خالی بود؛ هیچ تغییر رفتاری C. elegans به مگس یا gate علمی آن نشت نکرد.
- منابع متن‌باز بررسی‌شده: `openworm/c302` (MIT، به‌روزرسانی ۲۰۲۶-۰۸-۲۱) برای تولید مدل‌های شبکهٔ C. elegans در NeuroML 2 از connectivity؛ و `openworm/CE_locomotion` (C++، بدون license metadata در GitHub) برای مدل neuromechanical forward/backward. c302 فقط به‌عنوان مرجع معماری/منشأ مناسب است؛ CE_locomotion بدون مجوز صریح وارد پروژه نمی‌شود. هیچ‌یک جایگزین pack source topology فعلی یا مجوز حرکت مستقیم بدن نیستند.
- پس از حذف forage rock، collision correction و navigator، preview C. elegans دیگر سنگ مانع ندارد و UI صریحاً `279 N / 6,261 E source topology → disclosed motor decoder → body wave` و `No autonomous navigation steering is active` را نشان داد. در لحظهٔ snapshot موتور صفر بود؛ بدن بدون فرمان موتور پیشروی یا چرخش مستقل نداشت.
- Auto Demo پس از حذف steering نیز در فاز wind، `BRACING` با خروجی موتور صفر نشان داد؛ کرم همان‌جا ماند و چرخش/حرکت مصنوعی جایگزین نشد. این رفتار برای مرز network-first درست است، اما پاسخ حرکتی source-runtime هنوز یک motor-decoder مدل‌سازی‌شده و برای ادعای زیست‌مکانیکی یا رفتار واقعی کافی نیست.
- یک موج پایهٔ باقی‌مانده نیز حذف شد: وزن و سرعت AnimationGroup کرم پیش از نخستین MotorFrame و هنگام gait صفر، صفر است. بنابراین smoothing فقط افت تدریجی فرمان قبلی را نمایش می‌دهد و در حالت فرمان عصبی صفر حرکت تازه‌ای تولید نمی‌کند.
- در نشست تازهٔ نهایی، C. elegans با ۲۷۹ N / ۶٬۲۶۱ E، `FORWARD 0% / TURN 0% / BODY WAVE 0%` و متنِ نبود autonomous steering نمایش یافت؛ کرم رندر شد، سنگ forage در صحنه نبود و بدون MotorFrame غیرصفر ساکن ماند. بازگشت مگس نیز ۰ N / ۰ E و display-only را حفظ کرد.
- گزارش کاربر از سکون کرم پس از حذف سیاست مستقل بازتولید شد: در manifest واقعی، گروه‌های motor شامل DA/DB/DD/VA/VB/VD واقعاً موجودند، اما decoder فعلی میانگین firing-rate آن‌ها را صفر می‌خواند. بررسی بعدی باید فقط انتقال activity از topology و mappingِ صریح motor را اصلاح کند؛ هیچ floor یا steering مستقل بازنمی‌گردد.
- probe تکرارپذیر روی بستهٔ checksum-verified نشان داد حسگرها مسیر جهت‌دار واقعی تا AVB/PVC (یک گام) و DB/VB (دو گام) دارند، اما نرمال‌سازی خطی وزن فعلی حتی با میدان کامل، هیچ activity موتور نمی‌سازد. نگاشت لگاریتمیِ وزن‌ها در تحریک reactive/all activity موتور نشان داد، اما food به‌تنهایی هنوز صفر بود؛ بنابراین scale/normalization بخشی `MODELLED MAPPING` باید شفاف و آزمون‌پذیر تنظیم شود، نه اینکه steering بازگردد.
- منبع Haspel et al. 2010 و C. elegans II تفکیک مناسب decoder را پشتیبانی می‌کنند: DB/VB در forward و VA/DA در backward؛ AVB/PVC به B motor neuronها ورودی می‌دهند. این صرفاً نگاشت انتشارِ modelled از activity source به بدن است؛ حرکت زیست‌مکانیکی اعتبارسنجی‌شده ادعا نمی‌شود.
- پس از نرمال‌سازی log-compressed با gain مدل‌سازی‌شدهٔ ۱٫۵ و decoder DB/VB، preview تازهٔ C. elegans در میدان پیش‌فرض `35 spikes/step`، `FORWARD 86%`، `TURN 39%` و `BODY WAVE 100%` نشان داد. این فرمان‌ها از firing-rate گروه‌های موتور خوانده می‌شوند؛ هیچ floor، سنگ، target یا steering مستقل در مسیر وجود ندارد.
- برای کالیبراسیون speed/turn، منابع بازبینی‌شده: Rabets et al. 2014 سرعت crawling روی agar مرطوب را در حدود ۳۰۰ μm/s گزارش می‌کند؛ Park et al. 2008 برای agar حدود ۰٫۵ mm/s از حاصل wavelength تقریباً ۱ mm و frequency تقریباً ۰٫۵ Hz گزارش می‌کند؛ Stephens et al. 2010 سرعت زاویه‌ای مسیر و رخدادهای turn بزرگ را جدا از دینامیک پیوستهٔ crawling تحلیل می‌کند. Garden نه agar assay است و نه مدل مکانیکی کامل؛ پس این اعداد فقط سقف/مقیاسِ MODELLED MAPPING هستند، نه ادعای اعتبار زیستی.
- منابع مستقیم: Rabets et al. (2014), https://pmc.ncbi.nlm.nih.gov/articles/PMC4213666/؛ Park et al. (2008), https://doi.org/10.1371/journal.pone.0002550؛ Stephens et al. (2010), https://doi.org/10.1371/journal.pone.0013914؛ Haspel et al. (2010), https://pmc.ncbi.nlm.nih.gov/articles/PMC2945236/؛ C. elegans II, https://www.ncbi.nlm.nih.gov/books/NBK19982/. منابع speed crawling در agar را گزارش می‌کنند و Stephens چرخش پیوسته را از reorientationهای بزرگ جدا می‌کند؛ هیچ‌یک پارامتر واحدی برای Garden یا یک decoder نورونی تأییدشده ارائه نمی‌کنند.
- نمودار DB/VB برای FlyWire staged عمداً دادهٔ ساختگی نشان نمی‌دهد و در HUD با `STAGED UNAVAILABLE` نمایش داده می‌شود. این وضعیت در preview تازه دیده شد و مرز ۰ N / ۰ E FlyWire را حفظ می‌کند.
- preview فعال C. elegans نمودار ۴۸-sample DB/VB را کنار Motor decode، مقدارهای live DB/VB و caption `0.30 MM/S CRAWL REFERENCE · 0.45 RAD/S CURVE CAP` نشان داد. کرم در مشاهدهٔ زمان‌دار حرکت پیوسته داشت؛ نمونهٔ دیده‌شده `FORWARD 81%` و `TURN 46%` بود. نمودار group-mean از firingRate runtime است و caption صراحتاً کالیبراسیون modelled را نشان می‌دهد.
