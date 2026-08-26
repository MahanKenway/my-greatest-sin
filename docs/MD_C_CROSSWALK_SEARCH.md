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

[2]: https://github.com/flyconnectome/flywire_annotations "FlyWire systematic annotations and versioned releases"
[3]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11616994/ "Qin et al. (2024), Pharyngeal mechanosensory neurons control food swallow"
