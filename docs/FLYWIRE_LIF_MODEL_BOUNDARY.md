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

## منابع

[1]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11446845/ "Shiu et al. (2024), A Drosophila computational brain model reveals sensorimotor processing"
[2]: https://github.com/philshiu/Drosophila_brain_model "Drosophila Brain Model — source code and activation/silencing tutorial"
