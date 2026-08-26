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

## منبع site-level v783 و مسیر اقدام — ۲۶ اوت ۲۰۲۶

منبع رسمیِ موردنیاز در همان رکورد Zenodo v783 موجود است: `flywire_synapses_783.feather` با حدود ۱۳۰ میلیون synapse، `cleft_score` و احتمال‌های per-synapse برای شش ناقل. فایل نسخهٔ ۷۸۳٫۰، **۹٬۴۹۲٬۹۹۸٬۲۴۲ بایت** و MD5 رسمی `f8f1b97c9d4b0ea9b4c8b287f6b99091` دارد [2]. این جدول همان ورودی صحیح برای قاعدهٔ مقاله است؛ جدول `proofread_connections_783.feather` صرفاً خلاصهٔ هر neuron-pair/neuropil و ناقل‌های میانگین‌گرفته‌شده است.

دانلود resumable این فایل خارج از repository آغاز شده است. ابزار `build_flywire_v783_neuron_signs.py` فقط پس از تأیید MD5، rootهای proofread v783 را به siteهای پیش‌سیناپسی هم‌نسخه join می‌کند، winner شش‌گانهٔ هر site با cleft-score حداقل ۵۰ را می‌شمارد و sign را به شکل `-1` مهاری، `+1` تحریکی یا `0` طبقه‌بندی‌نشده می‌نویسد. هیچ sign یا وزن LIF تا پایان این conversion و گزارش checksum فعال نمی‌شود.

## منابع افزوده

[2]: https://zenodo.org/records/10676866 "FlyWire Whole-brain Connectome Connectivity Data, release 783"
[3]: https://fafbseg-py.readthedocs.io/en/latest/source/generated/fafbseg.flywire.synapses.get_transmitter_predictions.html "fafbseg transmitter prediction documentation"

## signهای site-level و آزمون آفلاین محدود — ۲۶ اوت ۲۰۲۶

دانلود رسمی site-level v783 تکمیل و MD5 Zenodo برای فایل ۹٫۴۹ GB تأیید شد. preprocessor روی ۱۳۹٬۲۵۵ root proofread، **۹۴٬۶۴۰ تحریکی**، **۴۴٬۰۱۱ مهاری** و **۶۰۴ طبقه‌بندی‌نشده** تولید کرد. manifest sign محلی checksum-verified است؛ طبقه‌بندی‌نشده‌ها عمداً موجب block اجرای LIF تمام‌گراف می‌شوند.

برای جلوگیری از CPU fallback تمام‌مغز، تنها ۱۳ مسیر ساختاری دوگامِ منتشرشده به زیرگراف ۳۳ نورون و ۶۷ یال تبدیل شد. همهٔ ۳۳ نورون sign معتبر داشتند. اجرای آفلاین با ثابت‌های Shiu، ۳۰ trial seeded و sweep ۰ تا ۲۰۰ Hz انجام شد. نتیجهٔ MN9 در همهٔ نرخ‌ها صفر بود؛ input-ablation نیز صفر ماند. self-check عددیِ جداگانه با edge مصنوعی فراآستانه ۱٬۰۰۰ synapse، ۱۵۲ spike MN9 تولید کرد و فقط صحت propagation کد را نشان می‌دهد، نه نتیجهٔ FlyWire.

این نتیجهٔ صفر یک **یافتهٔ منفیِ محدود** است: زیرگراف دوگام کوچک برای بازتولید پاسخ MN9 در مدل کامل کافی نیست. نباید آن را فقدان مسیر زیستی، نتیجهٔ مدل ۱۳۹k، benchmark WebGPU یا کنترل خرطوم تفسیر کرد. مدل کامل مقاله تمام نورون‌ها را شامل می‌شود؛ در مقابل، این artifact فقط `OFFLINE SUBGRAPH VALIDATION` است و GameWorld، FlyBody و شمارش FlyWire را تغییر نمی‌دهد.

نسخهٔ materialization **783** به‌عنوان نسخهٔ LTS همراه مقالات FlyWire شناخته می‌شود. رابط CAVE/fafbseg برای queryهای کوچک مفید است و table filtered آن synapseهای cleft-score کمتر یا مساوی ۵۰ را حذف می‌کند، اما برای bulk table محدودیت ردیف و بازگشت نامرتب دارد [4] [5]. بنابراین برای sign preprocessor تمام‌مغز، فایل site-level رسمی Zenodo v783 با MD5 تأییدشده مبنای canonical باقی می‌ماند؛ live/latest CAVE نباید با root IDهای v783 مخلوط شود.

[4]: https://natverse.org/fafbseg/reference/flywire_cave_query.html "CAVE materialization versions and v783 LTS guidance"
[5]: https://fafbseg-py.readthedocs.io/en/latest/_modules/fafbseg/flywire/synapses.html "fafbseg FlyWire synapse and transmitter query implementation"

## corridor ساختاری چهارهop به MN9 — ۲۶ اوت ۲۰۲۶

زیرگراف دوگام برای پاسخ MN9 ناکافی بود، بنابراین یک corridor ساختاری جدید مستقیم از CSR رسمی proofread v783 استخراج شد. این artifact تمام مسیرهای با حداکثر چهار connection row، حداقل سه synapse در هر row، از ۲۰ root sugar-GRN موجود تا MN9 را حفظ می‌کند. خروجی **۱٬۱۱۵ نورون، ۱۳٬۳۴۶ یال** و sign site-level معتبر برای تمام nodeهای retained دارد. انتخاب حداقل سه synapse و طول چهار hop، یک bound محاسباتی برای validation است؛ این افراد واسط را neuronهای علّیِ اثبات‌شده یا یک مدار کامل feeding نمی‌نامد.

روی همین corridor، مدل آفلاین با ۳۰ trial seeded و پارامترهای Shiu اجرا شد. baseline با ۰، ۲۵، ۵۰، ۱۰۰، ۱۵۰ و ۲۰۰ Hz به‌ترتیب میانگین نرخ MN9 برابر **۰٫۰، ۶۲٫۳، ۱۱۷٫۲، ۱۵۴٫۴، ۱۷۶٫۲ و ۱۹۰٫۶ Hz** داد. کنترل input-ablation در تمام نرخ‌ها ۰٫۰ Hz ماند. این نشان می‌دهد که در **این تقریب LIF محدود**، مسیرهای اضافی ساختاری برای انتقال ورودی sugar به MN9 کافی‌اند و بستن injection خارجی آن را حذف می‌کند.

این یک نتیجهٔ آفلاین مدل‌محور است، نه اندازه‌گیری حیوان، پیش‌بینی معتبرِ firing rate MN9 یا کنترل زیستی خرطوم. جمعیت ورودی sugar از notebook عمومی مقاله گرفته شده، اما external Poisson encoding، Forward-Euler solver، آستانهٔ سه-synapse و corridor selection همچنان `MODELLED MAPPING` هستند. GameWorld FlyWire روی `0 N / 0 E` باقی می‌ماند و هیچ خروجی به FlyBody ارسال نشده است.

## مسیر حس‌های افزوده

برای گسترش حسی، ابتدا باید root IDهای release-783 را از منبعی قابل‌ردیابی استخراج کنیم. گزینهٔ مکانیکی نزدیک‌تر به مدار feeding، md-Cهای cibarium با بیان مشترک `Tmc`/`nompC` هستند که به SEZ و مدار swallow گزارش شده‌اند؛ اما مقالهٔ مربوطه هویت دقیق rootهای v783 را به‌صورت فهرست عمومی ارائه نمی‌کند، پس هنوز نباید آن‌ها را به runtime تزریق کرد [6]. مکانورسپتورهای labellar bristle و peg نیز رفتارهای feeding متفاوتی دارند [7]. برای ورودی بویایی، ابتدا باید نوع ORN/PN، شناسه‌های v783 و مسیر رسیدن آن‌ها به SEZ/MN9 را به‌طور جداگانه مستند کنیم؛ بویایی نباید صرفاً جایگزین اسلایدر غذا شود.

[6]: https://elifesciences.org/articles/88614 "Pharyngeal mechanosensory neurons control food swallow in Drosophila melanogaster"
[7]: https://pmc.ncbi.nlm.nih.gov/articles/PMC6531006/ "Mechanosensory circuits coordinate two opposing motor actions in Drosophila feeding"

## water-GRN corridor به MN9 — ۲۶ اوت ۲۰۲۶

به‌عنوان نخستین گسترش ورودی حسی با root IDهای عمومی و قابل‌بازبینی، ۱۸ water-sensing GRN لابلاییِ راست از notebook عمومی Shiu دوباره با v783 تطبیق داده شدند. corridor ساختاری چهارhop با همان bound حداقل سه synapse، **۹۶۱ نورون و ۱۱٬۲۳۱ یال** داشت و تمام nodeهای آن sign site-level معتبر داشتند.

اجرای آفلاین ۳۰-trial، baseline MN9 را در نرخ‌های ۰، ۲۵، ۵۰، ۱۰۰، ۱۵۰ و ۲۰۰ Hz به‌ترتیب **۰٫۰، ۰٫۰، ۵٫۵، ۷۵٫۶، ۱۰۴٫۷ و ۱۱۷٫۵ Hz** داد. input-ablation در همهٔ نرخ‌ها ۰٫۰ Hz بود. این response در همان معنا یک **structural-model result محدود** است: خود input water و Poisson encoding مدل‌شده‌اند و این نتیجه هیچ ادعایی دربارهٔ حس آب واقعی، نوشیدن، رفتار یا کنترل خرطوم ندارد. با این‌حال، comparison با corridor sugar نشان می‌دهد که گسترش به مسیرهای چندhop واقعی می‌تواند خروجی MN9 متفاوتی تولید کند.

md-Cهای pharyngeal و MSNs مکانیکی labellar گزینه‌های بعدی با ارتباط feeding مستقیم‌ترند، اما تا زمانی که فهرست root ID v783 آن‌ها از منبع قابل‌ردیابی منتشر یا به‌صورت بازتولیدپذیر annotation نشود، در شبیه‌سازی وارد نمی‌شوند.

## منابع

[1]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11446845/ "Shiu et al. (2024), A Drosophila computational brain model reveals sensorimotor processing"
[2]: https://github.com/philshiu/Drosophila_brain_model "Drosophila Brain Model — source code and activation/silencing tutorial"
