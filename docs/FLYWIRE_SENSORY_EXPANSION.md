# FlyWire Sensory Expansion — MN9 Boundary

## هدف

هدف این مرحله، افزودن «اسلایدرهای بیشتر» نیست. هر جمعیت حسی باید root IDهای version-aligned، مسیر ساختاری به MN9 و یک قرارداد stimulus جداگانه داشته باشد. تنها پس از آن، نرخ Poisson خارجی به‌عنوان `MODELLED SENSOR INPUT` مجاز است. هیچ‌یک از نتایج این سند، کنترل FlyBody یا اجرای کامل FlyWire نیستند.

| جمعیت | شواهد و شناسه | وضعیت اجرای v783 | تصمیم |
|---|---|---|---|
| sugar-GRN راست | ۲۱ root در notebook Shiu؛ ۲۰ مورد در v783 موجود | corridor چهارhop: ۱٬۱۱۵ N / ۱۳٬۳۴۶ E؛ پاسخ MN9 مدل‌شده | آمادهٔ validation آفلاین؛ نه ورودی زندهٔ بدن |
| water-GRN راست | ۱۸ root از notebook عمومی Shiu، presence در v783 دوباره بررسی شد | corridor چهارhop: ۹۶۱ N / ۱۱٬۲۳۱ E؛ پاسخ MN9 مدل‌شده | آمادهٔ validation آفلاین؛ encoding آب مدل‌شده است |
| مکانورسپتور md-C cibarium | شواهد ژنتیکی/رفتاری برای `Tmc`/`nompC` و SEZ وجود دارد؛ مقاله MN11/MN12 را بررسی می‌کند | root IDهای قابل‌ردیابی v783 برای md-C و MN11/MN12 منتشر و استخراج نشده‌اند | **وارد runtime MN9 نشود** تا crosswalk قابل‌بازسازی پیدا شود |
| MSNs bristle/peg لابلایی | مقاله مدارهای مخالف spread/retraction را گزارش می‌کند | root ID v783 در دسترس قرارداد فعلی نیست | **وارد runtime نشود** |
| بویایی ORN/PN | جمعیت بویایی و نقش feeding شناخته‌شده‌اند، اما مسیر و rootهای v783→MN9 تعیین نشده‌اند | هیچ corridor یا simulation اجرا نشده | **در انتظار انتخاب نوع ORN/PN و annotation** |

## نتیجه‌های response–ablation

هر دو آزمایش آفلاین از LIF Forward-Euler، ۳۰ trial seeded، نرخ‌های ۰/۲۵/۵۰/۱۰۰/۱۵۰/۲۰۰ Hz، signهای site-level و structural corridor با حداکثر چهار hop و حداقل سه synapse در هر connection row استفاده کردند. این‌ها مشاهدات حیوانی نیستند.

| ورودی مدل‌شده | میانگین MN9 baseline (Hz) | input-ablation (Hz) |
|---|---|---|
| sugar-GRN | ۰٫۰ / ۶۲٫۳ / ۱۱۷٫۲ / ۱۵۴٫۴ / ۱۷۶٫۲ / ۱۹۰٫۶ | ۰٫۰ در همهٔ نرخ‌ها |
| water-GRN | ۰٫۰ / ۰٫۰ / ۵٫۵ / ۷۵٫۶ / ۱۰۴٫۷ / ۱۱۷٫۵ | ۰٫۰ در همهٔ نرخ‌ها |

> input-ablation تنها injection خارجیِ مدل‌شده را صفر می‌کند. این آزمایش معادل silencing سیناپس‌ها یا نورون‌های زیستی نیست.

## بررسی رابط

در مرورگر، HUD همچنان `FLYWIRE V783 STAGED — NO EXECUTION` و `0 N / 0 E` را نشان می‌دهد. readout corridor sugar به‌صورت `OFFLINE FOUR-HOP CORRIDOR / STRUCTURAL MODEL RESPONSE` نمایش داده می‌شود و console خالی است. هیچ نرخ آفلاین به FlyBody، بال، پا، ریشهٔ مگس یا benchmark WebGPU متصل نشده است.

## References

[1]: https://raw.githubusercontent.com/philshiu/Drosophila_brain_model/main/figures.ipynb "Shiu et al. public figures notebook"

[2]: https://pmc.ncbi.nlm.nih.gov/articles/PMC6531006/ "Mechanosensory circuits coordinate two opposing motor actions in Drosophila feeding"

[3]: https://elifesciences.org/articles/88614 "Pharyngeal mechanosensory neurons control food swallow in Drosophila melanogaster"

## annotation pin و JO-A راست

برای جلوگیری از ترکیب annotationهای متغیر، release `v2.1.0` مخزن `flyconnectome/flywire_annotations` که با materialization 783 گزارش شده است، خارج از repository pin شد: commit `ebd66db2596fcc39c6950fb54ea3efa00f7fe8a0` و SHA-256 فایل annotation برابر `30be6c73975a70c56d930e27911f36455d3886e15abf383b78edd2a5d679e0b6` است. از این داده، با فیلتر دقیق `super_class=sensory`، `cell_class=mechanosensory`، `cell_type=JO-A` و `side=right`، **۴۶ root ID** برای Johnston-organ JO-A راست استخراج شد.

corridor ساختاری چهارhop این جمعیت به MN9، ۷۸۷ نورون و ۵٬۷۴۱ یال داشت؛ ۳۷ input root در مسیرهای retained بودند و همهٔ nodeها sign site-level معتبر داشتند. اجرای آفلاین با ۳۰ trial seeded در ۰ تا ۲۰۰ Hz، MN9 را در همهٔ نرخ‌ها ۰ Hz داد؛ input-ablation نیز ۰ Hz ماند. این یک یافتهٔ منفی محدود برای **JO-A auditory/mechanosensory corridor منتخب** است و نه نتیجه‌گیری دربارهٔ همهٔ مکانورسپتورها، hearing، feeding یا رفتار مگس. JO-A به‌دلیل availability annotation انتخاب شد؛ برای مدار feeding، md-C یا labellar MSN با root ID معتبر گزینهٔ زیستی نزدیک‌تری خواهند بود.

## تصحیح هدف md-C

مطالعهٔ md-C خروجی‌های swallow را با MN11 و MN12 بررسی می‌کند، نه MN9. علاوه بر نبود برچسب دقیق `md-C`، annotation pin‌شدهٔ v783 هیچ cell-type دقیق `MN11` یا `MN12` هم ندارد. بنابراین انتخاب یک pharyngeal sensory group به‌عنوان جانشین md-C، یا اتصال md-C به MN9، از نظر علمی نادرست خواهد بود. مدار sugar/water→MN9 و مسیر بالقوهٔ md-C→MN11/MN12 باید دو فرضیهٔ جدا بمانند تا root-ID crosswalk معتبر فراهم شود.
