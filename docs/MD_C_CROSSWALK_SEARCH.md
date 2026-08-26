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
