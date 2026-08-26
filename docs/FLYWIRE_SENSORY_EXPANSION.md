# FlyWire Sensory Expansion — MN9 Boundary

## هدف

هدف این مرحله، افزودن «اسلایدرهای بیشتر» نیست. هر جمعیت حسی باید root IDهای version-aligned، مسیر ساختاری به MN9 و یک قرارداد stimulus جداگانه داشته باشد. تنها پس از آن، نرخ Poisson خارجی به‌عنوان `MODELLED SENSOR INPUT` مجاز است. هیچ‌یک از نتایج این سند، کنترل FlyBody یا اجرای کامل FlyWire نیستند.

| جمعیت | شواهد و شناسه | وضعیت اجرای v783 | تصمیم |
|---|---|---|---|
| sugar-GRN راست | ۲۱ root در notebook Shiu؛ ۲۰ مورد در v783 موجود | corridor چهارhop: ۱٬۱۱۵ N / ۱۳٬۳۴۶ E؛ پاسخ MN9 مدل‌شده | آمادهٔ validation آفلاین؛ نه ورودی زندهٔ بدن |
| water-GRN راست | ۱۸ root از notebook عمومی Shiu، presence در v783 دوباره بررسی شد | corridor چهارhop: ۹۶۱ N / ۱۱٬۲۳۱ E؛ پاسخ MN9 مدل‌شده | آمادهٔ validation آفلاین؛ encoding آب مدل‌شده است |
| مکانورسپتور md-C cibarium | شواهد ژنتیکی/رفتاری برای `Tmc`/`nompC` و SEZ وجود دارد | root IDهای قابل‌ردیابی v783 منتشر و استخراج نشده‌اند | **وارد runtime نشود** تا annotation قابل‌بازسازی پیدا شود |
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
