# GitHub Shortlist for FlyWire v783 Data and Server/GPU Simulation

## نتیجهٔ اصلی

هیچ مخزن بررسی‌شده یک «مغز کامل مگسِ آمادهٔ import با کنترل زیستی بدن» ارائه نمی‌دهد. ترکیب قابل‌دفاع، استفاده از ابزارهای رسمی/نزدیک به رسمی برای annotation و query، سپس اجرای مدل خودمان روی یک worker GPU است. این کار provenance v783، کنترل آزمایش و برچسب‌گذاری `MODELLED MAPPING` را حفظ می‌کند.

| اولویت | مخزن | کارکرد مناسب | تناسب با پروژه | محدودیت قطعی |
|---|---|---|---|---|
| ۱ | [flyconnectome/flywire_annotations](https://github.com/flyconnectome/flywire_annotations) | annotationهای سیستماتیک release 783؛ cell type، nerve، lineage، neurotransmitter | بهترین منبع برای پیدا‌کردن root IDهای حسی و version pinning | شبیه‌ساز یا GPU backend نیست؛ باید release tag مشخص pin شود |
| ۲ | [navis-org/fafbseg-py](https://github.com/navis-org/fafbseg-py) | query connectivity/annotation، skeleton/mesh و CAVE | بهترین کتابخانهٔ Python برای lookup و استخراج مسیرهای حسی | محاسبهٔ LIF را اجرا نمی‌کند؛ live query نباید با rootهای v783 مخلوط شود |
| ۳ | [philshiu/Drosophila_brain_model](https://github.com/philshiu/Drosophila_brain_model) | LIF، activation و silencing بر مبنای FlyWire | نزدیک‌ترین مدل مرجع برای protocol فعلی؛ README امکان پیکربندی 783 را توضیح می‌دهد | خروجی خودکار v783 یا سرویس آماده نیست؛ مدل اصلی با دادهٔ 630 اجرا شده و CPU/Colab ممکن است کند باشد |
| ۴ | [brian-team/brian2cuda](https://github.com/brian-team/brian2cuda) | تبدیل Brian2 به C++/CUDA روی NVIDIA GPU | کم‌تغییرترین مسیر GPU برای port مدل Shiu، چون همان اکوسیستم Brian2 است | نیازمند GPU NVIDIA، backend جدا و رعایت GPL-3.0 است |
| ۵ | [genn-team/genn](https://github.com/genn-team/genn) | شبیه‌سازی spiking مبتنی بر CUDA/HIP | گزینهٔ scale بالا برای GPU server در آینده | نیازمند بازنویسی مدل و pipeline داده است؛ import مستقیم نیست |
| ۶ | [nest/nest-gpu](https://github.com/nest/nest-gpu) | شبکه‌های spiking بزرگ با GPU/MPI | برای آزمایش‌های server-side بزرگ جذاب است | پورت مدل و لایهٔ داده لازم دارد؛ GPL-2.0 و نه FlyWire-specific |
| رد برای runtime | [murthylab/flywire-network-analysis](https://github.com/murthylab/flywire-network-analysis) | تحلیل شبکه و graph statistics | مفید برای تحلیل corridor و rank ورودی | تحلیل‌ها بر v630 و cluster انجام شده‌اند؛ runner sensorimotor نیست |

## معماری پیشنهادی

`v783 DFLY/object storage → Python worker (fafbseg + pinned annotations + Brian2CUDA) → API کوچک → UI پروژه`

در این معماری، object storage داده‌های chunked و immutable را نگه می‌دارد؛ worker فقط experiment protocolهای نسخه‌دار را اجرا می‌کند؛ API تنها raw spike/rate، checksum، seed، نسخهٔ مدل و status را به رابط می‌دهد. Neon، در صورت افزودن backend، فقط برای catalog آزمایش‌ها، کاربر و metadata مناسب است و جای GPU worker را نمی‌گیرد.

## گزینهٔ پیشنهادی برای شروع

پیشنهاد اول **`fafbseg-py` + `flywire_annotations`** برای حل annotationهای حسی است؛ سپس با **`Drosophila_brain_model` + Brian2CUDA** یک port server-side محدودِ v783 برای همان corridorها انجام می‌دهیم. این مسیر کوتاه‌ترین فاصله را از مدل مرجع به GPU دارد، ولی تا benchmark و validation مستقل، خروجی فقط `OFFLINE/SERVER STRUCTURAL-MODEL VALIDATION` خواهد بود.

## وضعیت prototype Brian2CUDA

یک prototype مستقل ساخته شد که معادلهٔ alpha-synapse LIF، آستانه، reset، delay، refractory، Poisson input و وزن `neuron-sign × synapse-count × 0.275 mV` را از مدل مرجع می‌گیرد و تنها یک corridor checksum-verified v783 را می‌پذیرد. preflight در محیط فعلی `BLOCKED` بود: `nvidia-smi`، `nvcc`، `brian2` و `brian2cuda` موجود نیستند. این یک توقف صریح سخت‌افزاری است؛ prototype عمداً CPU fallback ندارد و هیچ خروجی علمی یا body-control تولید نکرد.

## References

[1]: https://github.com/flyconnectome/flywire_annotations "FlyWire annotations for public release 783"

[2]: https://github.com/navis-org/fafbseg-py "fafbseg-py"

[3]: https://github.com/philshiu/Drosophila_brain_model "Drosophila brain LIF model"

[4]: https://github.com/brian-team/brian2cuda "Brian2CUDA"

[5]: https://github.com/genn-team/genn "GeNN"

[6]: https://github.com/nest/nest-gpu "NEST GPU"

[7]: https://github.com/murthylab/flywire-network-analysis "FlyWire Network Analysis"
