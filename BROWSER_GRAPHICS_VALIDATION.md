# گزارش سنجش رندر مرورگرهای هدف

**تاریخ اجرا:** ۲۶ اوت ۲۰۲۶.  
**موضوع:** تفکیک شفاف رندر WebGL2 از قابلیت محاسباتی WebGPU برای My Greatest Sin.

> این گزارش فقط نتایج مشاهده‌شده در محیط در دسترس را بیان می‌کند. نبود Firefox و Safari به معنی ناموفق‌بودن آن‌ها نیست؛ صرفاً در این محیط سنجیده نشده‌اند.

| مرورگر / موتور | WebGL2 | مسیر app آزموده‌شده | WebGPU API | `requestAdapter()` | نتیجه |
|---|---|---|---|---|---|
| Chromium 151.0.7922.71 / Ubuntu 24.04 | PASS | FlyWire staged و C. elegans live در Babylon canvas | موجود | REJECTED | WebGL2 قابل‌استفاده؛ WebGPU در این sandbox قابل‌اجرا نیست |
| Firefox | سنجیده نشد | مرورگر در محیط موجود نیست | سنجیده نشد | سنجیده نشد | هیچ نتیجه‌ای گزارش نمی‌شود |
| Safari / WebKit | سنجیده نشد | مرورگر/سیستم‌عامل موجود نیست | سنجیده نشد | سنجیده نشد | هیچ نتیجه‌ای گزارش نمی‌شود |

## روش و شواهد

در Chromium، `webgl2: true` و نسخهٔ `WebGL 2.0 (OpenGL ES 3.0 Chromium)` گزارش شد. Canvas در اندازهٔ ۱۲۸۰×۱۱۰۰ رندر شد و هر دو نمونهٔ FlyWire staged و C. elegans live بدون خطای Babylon shader مشاهده شدند. renderer محیط `ANGLE / Vulkan 1.3 / SwiftShader Device (Subzero)` است؛ بنابراین این **رندر نرم‌افزاری sandbox** است و عددی برای عملکرد GPU سخت‌افزاری یا دستگاه کاربر ارائه نمی‌کند.

در همان Chromium، `navigator.gpu` وجود داشت اما `navigator.gpu.requestAdapter()` مقدار `null` برگرداند. preflight رسمی برنامه نیز همین وضعیت را نشان داد. در نتیجه هیچ benchmark زمان‌دار WebGPU، throughput، latency یا اجرای FlyWire GPU ثبت نشده است. FlyWire در ۰ N / ۰ E و CPU execution forbidden باقی ماند.

## نتیجهٔ عملی

رندر فعلی Babylon در WebGL2 Chromium قابل‌نمایش است. WebGPU تنها در مرورگری/دستگاهی که `requestAdapter()` یک adapter واقعی بازگرداند باید وارد benchmark رسمی شود. برای پوشش واقعی Firefox و Safari باید همین protocol روی آن مرورگرها و دستگاه‌های دارای GPU سخت‌افزاری اجرا شود.
