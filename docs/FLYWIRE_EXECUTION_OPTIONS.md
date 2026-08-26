# FlyWire Data and Execution Options

## نقش Neon

Neon یک PostgreSQL serverless با جداسازی storage و compute، scale-to-zero و branching است [1]. بنابراین برای **metadata کوچک تا متوسط** مناسب است: catalog آزمایش‌ها، raw MN9 readoutهای آفلاین، manifestها، annotationها، experiment provenance و صف jobها. Neon موتور WebGPU یا GPU compute نیست و نصب آن به‌تنهایی مشکل `requestAdapter()` مرورگر را حل نمی‌کند.

جدول site-level v783 با حدود ۱۳۰ میلیون synapse و فایل ۹٫۴۹ GB نباید نخستین‌بار به عنوان یک جدول عملیاتی Postgres وارد Neon شود. این کار هزینهٔ ingest، index و query را بالا می‌برد و برای download chunked مرورگر مزیتی نسبت به object storage ندارد. اگر backend کامل پروژه در آینده فعال شود، Neon می‌تواند فقط indexهای انتخابی، catalog pathway و خروجی‌ آزمایش‌ها را نگه دارد؛ دادهٔ خام و packهای DFLY باید در object storage checksum-verified باقی بمانند.

## نقش WebGPU

WebGPU محاسبهٔ عمومی GPU را در **GPU دستگاهی که مرورگر روی آن اجرا می‌شود** انجام می‌دهد. مسیر استاندارد آن `navigator.gpu` سپس `requestAdapter()` و `requestDevice()` است؛ اگر adapter موجود نباشد، backend ذخیره‌سازی جای آن را نمی‌گیرد [2]. در این پروژه، object storage فعلی برای fetch chunkهای CSR کافی است، اما اجرای browser-side به یک رایانه/مرورگر با adapter واقعی نیاز دارد.

| نیاز | گزینهٔ مناسب | نقش در این پروژه |
|---|---|---|
| فایل‌های بزرگ immutable و chunked | object storage فعلی | packهای DFLY، site-level derivative و checksum manifest |
| metadata و نتیجه‌های کوچک experiment | Neon PostgreSQL در backend آینده | اختیاری؛ نه در frontend استاتیک فعلی |
| LIF تمام‌گراف روی GPU رایگان | My Computer با Chrome/Edge و acceleration | بهترین مسیر کم‌هزینه، اگر قابل اتصال باشد |
| LIF تمام‌گراف مستقل از کاربر | cloud GPU با backend جدا | نیازمند هزینه، backend و سیاست نگهداری داده |
| اعتبارسنجی محدود بدون GPU | runner آفلاین bounded | فقط validation؛ هرگز fallback کامل FlyWire نیست |

## نتیجهٔ معماری فعلی

برای مرحلهٔ حاضر، بهترین تقسیم مسئولیت این است: **object storage برای دادهٔ بزرگ، runner آفلاین برای validation محدود، و WebGPU محلی برای اجرای مرورگر**. Neon تنها زمانی ارزش افزوده دارد که پروژه به backend با database آزمایش‌ها، حساب کاربری یا جست‌وجوی metadata ارتقا یابد.

## References

[1]: https://neon.com/docs/introduction/about "Neon: serverless Postgres and separated storage/compute"

[2]: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API "MDN WebGPU API"
