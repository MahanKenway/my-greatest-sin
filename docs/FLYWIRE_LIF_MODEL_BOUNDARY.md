# مرز مدل LIF برای ادامهٔ FlyWire v783

## یافتهٔ منبع

مدل همراه Shiu و همکاران یک شبکهٔ **leaky integrate-and-fire** در Brian2 است؛ نرخ پایهٔ نورون‌ها صفر است، ورودی‌های فعال‌سازی به‌صورت Poisson اعمال می‌شوند و silencing وزن همهٔ سیناپس‌های خروجی نورون انتخابی را صفر می‌کند. notebook همراه مقاله برای sugar-GRN نرخ‌های تحریک در بازهٔ ۱۰ تا ۲۰۰ Hz و مقایسهٔ MN9 در آزمایش‌های activation/silencing را نشان می‌دهد [1] [2].

| پارامتر منبع | مقدار گزارش‌شده | وضعیت در My Greatest Sin |
|---|---:|---|
| پتانسیل rest/reset | `-52 mV` | هنوز پیاده‌سازی نشده است. |
| آستانه | `-45 mV` | هنوز پیاده‌سازی نشده است. |
| ثابت غشا | `20 ms` | هنوز پیاده‌سازی نشده است. |
| decay هدایت | `5 ms` | هنوز پیاده‌سازی نشده است. |
| refractory | `2.2 ms` | هنوز پیاده‌سازی نشده است. |
| synaptic delay | `1.8 ms` | هنوز پیاده‌سازی نشده است. |
| وزن آزاد هر سیناپس | `0.275 mV` | هنوز پیاده‌سازی نشده است. |

## تصمیم اجرایی

مشتق browser فعلی v783 فقط `root_id`، CSR ورودی، `source_index` و `synapse_count` را برای benchmark دارد و ستون‌های احتمال ناقل عصبی را برای کاهش حجم انتقال نمی‌دهد. بنابراین هیچ kernel فعلی یا بعدیِ این نسخه نباید با نام «بازسازی مدل LIF مقاله» یا «نرخ شلیک زیستی» معرفی شود. kernel فعلی صرفاً **structural propagation score** است.

گام بعدیِ قابل‌دفاع، افزودن protocolهای activation و ablation به همین kernel ساختاری است؛ نتایج آن تنها برای کنترل path داده، checksum، گیت adapter و خوانش MN9 معتبر خواهند بود. برای پیاده‌سازی LIF قابل‌ردیابی باید مشتق رسمی v783 شامل پیش‌بینی ناقل، قرارداد تبدیل دقیق آن به وزن، زمان‌بندی رویداد و validation جداگانه آماده شود. این کار از فعال‌کردن بی‌برچسبِ ۱۳۹٬۲۵۵ نورون در `GameWorld` جدا است.

## مشتق LIF آماده‌شده — ۲۵ اوت ۲۰۲۶

از pack کاملِ خارج از مخزن، مشتق `flywire-v783-dfly-lif-candidate-v1` در `/home/ubuntu/webdev-static-assets/` ساخته شد. ابزار derivation پیش از هر copy، اندازه و SHA-256 همهٔ chunkها را با manifest کامل کنترل کرد و سپس checksum فایل کپی‌شده را دوباره‌سنجی کرد. این مشتق **۱۳۹٬۲۵۵ نورون**، **۱۶٬۸۴۷٬۹۹۷ اتصال**، ۱۵ chunk و **۳۳۸٬۶۳۱٬۰۰۴ بایت** دارد؛ SHA-256 manifest آن `2091a5cc474a99efbe3614848e17e9167d099b7b1028797079a8e9a2c49cc1b0` است.

ستون‌های انتخاب‌شده `root_id`، `incoming_offsets`، `source_index`، `synapse_count` و `nt_probabilities` هستند. ستون آخر `f16 × 6` و ترتیب ثبت‌شده‌اش `gaba_avg`، `ach_avg`، `glut_avg`، `oct_avg`، `ser_avg` و `da_avg` است. این تنها یک **LIF input candidate** است: هنوز به GPU upload نشده، به وزن تحریکی/مهاری نگاشت نشده و هیچ نورون FlyWire را در `GameWorld` فعال نمی‌کند.

## قاعدهٔ ناقل در مدل مرجع و blocker باقیمانده

مقالهٔ مرجع برای هر **presynaptic site**، بالاترین پیش‌بینی ناقل را پس از cleft-score cutoff برابر ۵۰ می‌گیرد. یک نورون زمانی مهاری طبقه‌بندی می‌شود که بیش از نیمی از siteهای پیش‌سیناپسی‌اش GABA یا glutamate باشند؛ در غیر این صورت تحریکی است. dopamine، octopamine و serotonin در دستهٔ تحریکی قرار داده شده‌اند و مدل اندازهٔ یکسانی برای وزن تحریکی و مهاری فرض می‌کند [1].

مشتق رسمیِ موجود در این پروژه، probabilityهای `gaba_avg` تا `da_avg` را برای **connection rowهای خلاصه‌شده** دارد، نه شمارش siteهای خام با cleft-score. بنابراین نمی‌توان بدون یک preprocessor بازتولیدپذیر و دادهٔ site-level، طبقه‌بندی نورون‌به‌نورون مقاله را دقیقاً بازسازی کرد. گام LIF فعلاً عمداً blocked می‌ماند: مشتق آماده، checksum-verified و قابل‌دریافت است؛ اما تولید sign/weight برای kernel تا تعیین منبع site-level یا روش دقیقِ هم‌ارز فعال نمی‌شود.

## منابع

[1]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11446845/ "Shiu et al. (2024), A Drosophila computational brain model reveals sensorimotor processing"
[2]: https://github.com/philshiu/Drosophila_brain_model "Drosophila Brain Model — source code and activation/silencing tutorial"
