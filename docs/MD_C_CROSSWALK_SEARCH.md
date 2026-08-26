# md-C / MN11 / MN12 Crosswalk Search

## نتیجهٔ موقت

تا ۲۶ اوت ۲۰۲۶، هیچ root-ID crosswalk version-aligned برای md-C یا MN11/MN12 در release v783 پیدا نشد. اجرای هر corridor به‌نام md-C یا MN11/MN12 تا یافتن چنین crosswalkی blocked می‌ماند.

| منبع | یافته | نتیجه برای پروژه |
|---|---|---|
| [Qin et al. 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11616994/) | md-C با intersection ژنتیکی `Tmc-GAL4 ∩ nompC-QF`، تقریباً دو جفت در cibarium، و ارتباط با MN11/MN12 تعریف شده است. | تعریف زیستی روشن است، اما FlyWire root ID ندارد. |
| [Dryad dataset](https://doi.org/10.5061/dryad.vdncjsz4q) | دادهٔ behaviour، calcium imaging و confocal با حجم ۱۷٫۰۷ GB دارد. | فایل root-ID connectome یا mapping به FlyWire ندارد. |
| [Manzo et al. 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC3341050/) | MN11 و MN12 نام خطوط/زیرجمعیت‌های motor neuron برای ماهیچه‌های پمپ cibarial هستند. | root-ID FAFB/FlyWire ندارد؛ نام ژنتیکی جانشین شناسهٔ connectome نیست. |
| [Codex FAFB v783 FAQ](https://codex.flywire.ai/faq) | snapshot v783 با annotationهای consolidated، دانلود static و mapping root نسخه‌محور از طریق CAVE توضیح شده است. | بهترین مسیر بعدی برای جست‌وجو/mapping است، ولی query/دانلود فعال نیاز به ورود Google و گاهی token CAVE دارد. |
| [VFB FAFB CATMAID](https://www.virtualflybrain.org/hosted/fafb-catmaid/) | reconstructionهای دستی و API CATMAID از publicationهای متعدد نگه‌داری می‌شود. | برای کشف skeleton-ID یا paper annotation مفید است، اما crosswalk خودکار به root v783 نیست. |

## مرز موتور

مدار **sugar/water → MN9** یک فرضیهٔ proboscis جداست. مطالعهٔ md-C خروجی‌های swallow را با **MN11/MN12** بررسی می‌کند؛ md-C نباید صرفاً برای داشتن ورودی مکانیکی به MN9 متصل شود. یک crosswalk معتبر باید هم rootهای sensory md-C و هم motor targetهای صحیح را با materialization/release مشخص ثبت کند.

## مسیر بعدی قابل‌دفاع

پس از ورود کاربر به Codex/CAVE، یک query annotation نسخه‌دار برای `Tmc`، `nompC`، pharyngeal/cibarium و motor/effector labels اجرا می‌شود. هر candidate قبل از استفاده باید root ID، snapshot، annotation source، روش mapping و نتیجهٔ بررسی presence در `proofread_root_ids_783.npy` داشته باشد.

## ممیزی رسمی Codex — ۲۶ اوت ۲۰۲۶

راهنمای Codex تأیید می‌کند که snapshot پیش‌فرض FlyWire FAFB در Codex برابر **v783** است و annotation/جست‌وجوی آن فقط همان snapshot را می‌بیند. همچنین صراحتاً می‌گوید root ID به source segmentation و snapshot وابسته است؛ برای ID حذف‌شده یا تغییرکرده باید از `Map Root IDs` استفاده شود، و این ابزار ممکن است permission یا token مربوط به CAVE/FlyWire بخواهد. بنابراین یک ID از CATMAID، تصویر confocal یا یک snapshot دیگر، بدون mapping materialization-مشخص، root v783 محسوب نمی‌شود [1].

[1]: https://codex.flywire.ai/faq "Codex FAQ: versions, root-ID mapping and CAVE access"

## annotationهای عمومی v783 و مقالهٔ md-C

صفحهٔ رسمی `flywire_annotations` می‌گوید TSV نورونی شامل root ID، cell type، nerve، lineage، neurotransmitter و VirtualFlyBrain ID است و tag `v2.1.0` همان annotation reportشده در مقاله‌های ۲۰۲۴ و materialization 783 است [2]. این منبع همچنین از updateهای جدیدتر مبتنی بر همان v783 خبر می‌دهد؛ بنابراین نسخه‌های release باید جداگانه و با checksum جست‌وجو شوند، نه آن‌که labelهای یک release جدید به‌صورت خام به snapshot قدیمی منتقل شوند.

Qin و همکاران md-C را یک intersection عملکردیِ `Tmc-GAL4 ∩ nompC-QF` برای حدود دو جفت neuron multi-dendritic در cibarium تعریف می‌کنند و آن را با swallow مرتبط می‌دانند [3]. این تعریف، root ID یا skeleton ID انتشار نمی‌دهد. پس حتی وجود ستون‌های `Tmc`، `nompC` یا `synonyms` در یک annotation عمومی، بدون evidence از همان intersection و mapping نسخه‌دار، برای انتساب md-C کافی نیست.

در ادامه، tag رسمی `v3.1.0` (commit `8587524c1748ce5ef2080822a2fc890fc03bf597`) نیز جداگانه دریافت و `Supplemental_file1_neuron_annotations.tsv` آن جست‌وجو شد: ۱۳۹٬۲۴۹ ردیف، SHA-256 `9a4f8b2f843196074431ebd7cd883536afa1be86c8a4ce90970441e8be81d1be`. جست‌وجوی exact-column و جست‌وجوی متن گسترده برای `md-C`، `MN11`، `MN12` و `cibarium` هر دو **صفر hit** داشتند. بنابراین update عمومی v3.1.0 نیز crosswalk لازم را اضافه نکرده است.

رابط `fafb-flywire.catmaid.org` وجود skeletonهای FlyWire و ابزار تحلیل را اعلام می‌کند، اما در نشست فعلی به صفحهٔ ورود Username/Password یا ORCID هدایت شد. بنابراین بدون ورود کاربر، هیچ query annotation یا export قابل‌بازبینی از CATMAID انجام نشد؛ این مسیر فقط یک candidate دسترسی است، نه منبعی که تا این مرحله crosswalk عمومی اثبات‌شده ارائه داده باشد.

endpoint رسمی Codex مشخصاً FAFB **v783** را با ۱۳۹٬۲۵۵ neuron و ۳٬۷۳۲٬۴۶۰ connection فهرست می‌کند، اما Search، Annotations و Download Data را پشت ورود Google قرار می‌دهد. پس مسیر query ساختاریافته برای `Tmc`/`nompC`/`MN11`/`MN12` اکنون به authentication کاربر وابسته است؛ تا ورود موفق، از APIهای غیرمستند یا scraping برای دورزدن این gate استفاده نمی‌شود.

بازبینی session در ۲۶ اوت ۲۰۲۶ پس از درخواست ادامه نیز همچنان صفحهٔ `Sign in with Google` را نشان داد؛ بنابراین ورود در این browser session تکمیل نشده یا persistent نبوده است. در نتیجه هیچ query server-side یا Map Root IDs اجرا نشد.

## تکمیل ممیزی منابع عمومی — ۲۶ اوت ۲۰۲۶

صفحهٔ رسمی Dryad به‌طور دقیق فایل‌ها را `behavior.zip`، `calcium_imaging.zip` و `confocal.zip` می‌نامد. محتوای آن‌ها به‌ترتیب خروجی GraphPad/پیوند ویدئو، imaging کلسیم MN11/MN12 و md-C، و raw confocal/GRASP است؛ هیچ skeleton، neuron table، FlyWire root ID، CATMAID skeleton ID یا materialization mapping در فهرست/README توصیف نشده است [4]. بنابراین دانلود ۱۷٫۰۷ GB imaging نمی‌تواند یک crosswalk v783 معتبر بسازد.

FlyBase برای `nompC` یک gene-level record و reporterهای متعدد عرضه می‌کند؛ این اطلاعات expression یا driver-level است و هویت همان intersection سلولی `Tmc-GAL4 ∩ nompC-QF` را در connectome مشخص نمی‌کند [5]. افزون بر آن، ارزیابی eLife ارتباط حسی–حرکتی مقاله را از نظر evidence کاملاً کامل نمی‌داند [6]. در نتیجه، gene/reporter metadata یا نزدیکی GRASP به‌هیچ‌وجه مجوز ساختن edge یا انتخاب root md-C نیست.

[4]: https://datadryad.org/dataset/doi:10.5061/dryad.vdncjsz4q "Dryad: files and data structure for Qin et al."
[5]: https://flybase.org/reports/FBgn0016920 "FlyBase gene report: Dmel nompC"
[6]: https://elifesciences.org/articles/88614 "eLife assessment of Qin et al. (2024)"

## تأیید materialization — ۲۶ اوت ۲۰۲۶

شرط نسخه اکنون روشن و تأییدشده است: FAQ رسمی Codex، FAFB را static snapshot **v783** (اکتبر ۲۰۲۳) معرفی می‌کند و repository رسمی annotation نیز releaseهای v2.1.0 تا v3.1.0 را بر پایهٔ FlyWire/CAVE **materialization 783** مستند می‌سازد [7] [8]. مستندات `fafbseg` نیز v783 را نسخهٔ long-term-support مناسبِ تحلیل منتشرشده توضیح می‌دهد و نمونهٔ query صریح `version = 783` را نشان می‌دهد [9].

این تأیید فقط شرط version-alignment را برآورده می‌کند؛ **root crosswalk را تولید نمی‌کند**. برای افزودن mapping هنوز باید پس از ورود authenticated، query/exportی با datastack، `version=783` یا timestamp معادل، متن query، نتیجهٔ root-ID و SHA-256 export ثبت شود. تا آن زمان `md-C → MN11/MN12` همچنان `BLOCKED: NO VERSION-ALIGNED ROOT CROSSWALK` باقی می‌ماند.

[7]: https://codex.flywire.ai/faq "Codex FAQ: FAFB static snapshot v783"
[8]: https://github.com/flyconnectome/flywire_annotations "FlyWire annotations: releases based on materialization 783"
[9]: https://natverse.org/fafbseg/reference/flywire_cave_query.html "fafbseg: CAVE materialization versions and v783 LTS"

## Codex authenticated query log — ۲۶ اوت ۲۰۲۶

یک session authenticated در Codex روی selector صریح **FAFB v783** در دسترس شد. صفحهٔ نتیجه همان snapshot را با ۱۳۹٬۲۵۵ cell، ۵۰٬۶۶۶٬۶۴۸ synapse و timestamp دادهٔ «Updated 2025-06-23» نمایش داد. queryهای ساختاریافتهٔ زیر با match دقیق اجرا شدند:

| Query | نتیجهٔ Codex | نتیجهٔ پژوهشی |
|---|---:|---|
| `label == "md-C"` | ۰ match | هیچ root-ID برای md-C در static snapshot ندارد. |
| `label == "MN11"` | ۰ match | هیچ root-ID دقیق MN11 در static snapshot ندارد. |
| `label == "MN12"` | ۰ match | هیچ root-ID دقیق MN12 در static snapshot ندارد. |
| `gene == Tmc && gene == nompC` | ۰ match؛ diagnostics هر دو clause را unmatched دانست | Codex gene field این intersection ژنتیکی را به cell/root در v783 نگاشت نکرده است. |

این queryها وجود session و materialization ثابت Codex را تأیید می‌کنند، اما نه CAVE Map Root IDs را و نه crosswalk را. بنابراین `md-C → MN11/MN12` با شواهد **صفر root-ID** همچنان blocked است و هیچ root به runtime افزوده نشده است.

## شرایط رسمی درخواست CAVE/FlyWire access — ۲۶ اوت ۲۰۲۶

فرم رسمی `brain_access` دسترسی production را برای **مشارکت در proofreading/annotation** می‌خواهد و اعلام می‌کند که پس از درخواست، جلسهٔ onboarding، مرور FlyWire Principles و setup ابزار/داده برگزار می‌شود [10]. فرم فقط Name، Email و Affiliation می‌خواهد، اما Terms تصریح می‌کند که کاربر زیر ۱۸ سال باید رضایت ولی داشته باشد؛ edit/annotation می‌تواند همراه username و زمان عمومی شود و مشارکت‌ها با CC-BY-NC 4.0 منتشر می‌شوند [11].

بنابراین درخواست فقط با اطلاعات حقیقی و تأیید کاربر ارسال می‌شود. دلیل کاربردی پروژه به‌صورت حداقلی این است: بررسی بازتولیدپذیر root-ID/materialization 783 برای یک crosswalk پژوهشی محدود، نه کنترل حیوان، نه اجرای کامل graph و نه تجاری‌سازی. نام، email و affiliation در فرم یا این سند ذخیره نشده‌اند.

[10]: https://flywire.ai/brain_access "FlyWire Female Adult Brain proofreading access request"
[11]: https://flywire.ai/tos "FlyWire Terms of Service & Privacy Notice"

## وضعیت درخواست access — ۲۶ اوت ۲۰۲۶

کاربر شرایط proofreading/annotation را تأیید و affiliation «Independent researcher» را اعلام کرد؛ فرم رسمی پس از تأیید صریح کاربر ارسال شد. رابط پس از click فیلدها را پاک کرد و browser به صفحهٔ خالی رفت، اما هیچ receipt یا message قابل‌استخراجی نشان نداد. پس وضعیت دقیق به‌صورت **`SUBMISSION ATTEMPTED — RECEIPT NOT OBSERVED`** ثبت می‌شود؛ برای پرهیز از درخواست تکراری، فرم دوباره ارسال نخواهد شد. onboarding یا token فقط پس از پاسخ رسمی FlyWire فعال فرض می‌شود.

[2]: https://github.com/flyconnectome/flywire_annotations "FlyWire systematic annotations and versioned releases"
[3]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11616994/ "Qin et al. (2024), Pharyngeal mechanosensory neurons control food swallow"
