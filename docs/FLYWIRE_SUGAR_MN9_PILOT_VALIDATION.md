# اعتبارسنجی پایلوت FlyWire sugar-GRN → MN9

## دامنهٔ آزمون

این ثبت، وضعیت نسخهٔ دارای runtime گیت‌شدهٔ **sugar-GRN → MN9 / proboscis** را در ۲۵ اوت ۲۰۲۶ نشان می‌دهد. هدف، بررسی صداقت گیت داده، حالت خطا و جداسازی گونه‌ها بود؛ نه اثبات پاسخ زیستی، اجرای کامل FlyWire یا کنترل راه‌رفتن.

| آزمون | نتیجهٔ مشاهده‌شده | برداشت معتبر |
|---|---|---|
| اجرای پایلوت روی مگس | `PILOT EXECUTION: ERROR` با پیام ردشدن `requestAdapter()` | adapter معتبر وجود ندارد؛ score MN9 و خروجی خرطوم ساخته نشدند و CPU fallback وجود ندارد. |
| وضعیت FlyWire | `STAGED — NO EXECUTION`, `0 N / 0 E` | گراف ۱۳۹٬۲۵۵ نورونی به `GameWorld` وارد نشده و gait/بال نمایش‌محور باقی مانده‌اند. |
| تعویض به C. elegans | `SOURCE PACK ACTIVE`, `279 N / 6,261 E` و body wave | runtime جداگانهٔ منبع کرم دست‌نخورده است؛ sensor/motor/body آن همچنان `MODELLED MAPPING` هستند. |
| کنسول مرورگر | خروجی خالی | خطای runtime یا shader تازه‌ای پس از اجرای blocked و تعویض گونه مشاهده نشد. |
| کنترل ایستا | `pnpm check`، ۱۶ آزمون، و `pnpm build` موفق | decoder محدود خرطوم، قرارداد ریشه‌ها و مسیرهای موجود regression نداشتند. |

## مرز نتیجه

پایلوت اکنون یک مسیر اجرایی واقعی اما **مشروط به adapter** دارد: گزارش‌های شاهد و ستون‌های رسمی v783 را checksum-verify می‌کند، با شناسه‌های ۶۴ بیتی امن کار می‌کند، و فقط در adapter معتبر چهار گام score ساختاری را اجرا و MN9 را می‌خواند. تبدیل ورودی غذا و score به ریگ خرطوم، به‌ترتیب `MODELLED SENSOR INPUT` و `MODELLED MOTOR DECODER` هستند. نبود adapter در محیط فعلی نتیجهٔ علمیِ منفی دربارهٔ زیست‌شناسی مگس نیست؛ تنها اجازهٔ اجرای محاسبه را نمی‌دهد.

هشدار production build تنها اندازهٔ bundle جاوااسکریپت بزرگ‌تر از ۵۰۰ KiB بود؛ build متوقف نشد و هیچ معیار عملکرد GPU یا ادعای عملکرد کامل در این ثبت تولید نشده است.

## ادامهٔ protocol و capability — ۲۵ اوت ۲۰۲۶

رابط اکنون نرخ تحریک مدل‌شدهٔ sugar-GRN را بین ۰ تا ۲۰۰ Hz نمایش می‌دهد و یک کنترل منفی با نام `INPUT ABLATED` دارد. این کنترل فقط injection خارجی را صفر می‌کند؛ برخلاف silencing مدل Brian2 مرجع، هیچ ادعایی دربارهٔ صفرکردن همهٔ سیناپس‌های زیستی ورودی/خروجی نورون‌ها ندارد. نرخ ۱۰۰ Hz و حالت ablated در مرورگر آزموده شدند؛ runtime پس از کنترل شاهدها و manifest به گیت adapter رسید و همان‌طور که انتظار می‌رفت با خطای `WebGPU adapter request was rejected` متوقف شد. FlyWire همچنان `0 N / 0 E` باقی ماند و هیچ حرکت دهان، پا، بال یا CPU fallback رخ نداد.

پیش از ساخت bufferهای GPU، runtime اکنون بودجهٔ سه ستون لازم و سه buffer حالت `f32` را برآورد می‌کند و سقف storage-buffer، `maxBufferSize` و قابلیت timestamp-query را از adapter معتبر می‌سنجد. این preflight یک گیت اجرایی است، نه metric عملکرد؛ metric تنها پس از اجرای موفق روی سخت‌افزار سازگار ثبت می‌شود.

در بازبینی مستقیم مرورگر، HUD نرخ انتخاب‌شدهٔ ۱۰۰ Hz، هر دو وضعیت `INPUT OPEN` و `INPUT ABLATED` و پیام خطای adapter را بدون خطای کنسول نمایش داد. پس از تعویض گونه، C. elegans همچنان `SOURCE PACK ACTIVE` با ۲۷۹ نورون و ۶٬۲۶۱ یال باقی ماند. این مشاهده، کنترل correctness رابط و جداسازی گونه‌ها است؛ اعتبار علمی شدت–پاسخ یا ablation تا اجرای واقعی GPU ثبت نشده است.

## قرارداد آزمایش‌های بعدی

برای اجرای قابل‌بازبینی روی adapter معتبر، sweep برنامه شامل نرخ‌های **۰، ۲۵، ۵۰، ۱۰۰، ۱۵۰ و ۲۰۰ Hz** برای baseline و input-ablation است. منبع Brian2 همراه پژوهش، sweep دقیق‌تر ۱۰ تا ۲۰۰ Hz، trialهای ۱۰۰۰ ms و ۳۰ تکرار را گزارش می‌کند؛ قرارداد مرورگر در حال حاضر فقط rateهای منتخب را برای کنترل اقتصادی اولیه تعریف می‌کند و نباید معادل تحلیل آماری مقاله قلمداد شود [1] [2]. تا زمانی که GPU واقعاً اجرا نشود، جدول نتیجه باید خالی و وضعیت آن `PROTOCOL ONLY — NO GPU MEASUREMENT` بماند.

## منابع افزوده

[1]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11446845/ "Shiu et al. (2024), A Drosophila computational brain model reveals sensorimotor processing"
[2]: https://github.com/philshiu/Drosophila_brain_model "Drosophila Brain Model — figures notebook"

## تلاش اجرای protocol — ۲۵ اوت ۲۰۲۶

دو اجرای واقعی از رابط انجام شد: baseline با ورودی sugar باز در ۱۵۰ Hz و input-ablation در ۱۵۰ Hz. در هر دو مورد adapter پیش از دریافت ستون‌های حجیم گراف بررسی شد و `requestAdapter()` رد شد. در نتیجه، هیچ CSR v783 برای این دو تلاش به GPU upload نشد، هیچ MN9 structural score یا rate ثبت نشد، هیچ جدول شدت–پاسخ پر نشد و هیچ خروجی بدنی تغییر نکرد. کنسول مرورگر خالی بود.

| وضعیت | baseline ۱۵۰ Hz | input-ablation ۱۵۰ Hz |
|---|---|---|
| گیت adapter | `BLOCKED` | `BLOCKED` |
| MN9 readout | ثبت نشد | ثبت نشد |
| CPU fallback | استفاده نشد | استفاده نشد |
| تغییر GameWorld FlyWire | `0 N / 0 E` حفظ شد | `0 N / 0 E` حفظ شد |

بنابراین هنوز **هیچ نتیجهٔ شدت–پاسخ یا ablation زیستی/محاسباتی قابل‌تفسیر** نداریم. تنها نتیجهٔ معتبر این مرحله، عملکرد درست گیت سخت‌افزاری و جلوگیری از انتقال ۳۳۸٫۶ MiB دادهٔ LIF candidate در مرورگر بدون adapter است.
