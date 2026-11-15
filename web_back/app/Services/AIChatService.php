<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Doctor;
use App\Models\Medicien;
use GuzzleHttp\Client;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AIChatService
{
    private const SYSTEM_PROMPT = 'أنت المساعد الطبي والصيدلي الذكي لمنصة صيدليتي (MY_pharmacy). أجب باللغة العربية باحترافية ووضوح واختصار في نقاط منظمة، واستعن بقائمة الأدوية والأطباء المتاحة في الصيدلية عند ملاءمتها لسؤال المريض، مع التذكير اللطيف بأن هذه المعلومات الإرشادية لا تغني عن الفحص الطبي المباشر.';

    private const CACHE_TTL_SECONDS = 900; // 15 minutes

    private const GEMINI_MODELS = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
    ];

    private const OPENROUTER_MODELS = [
        'google/gemma-3-27b-it:free',
        'google/gemma-3-12b-it:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.2-3b-instruct:free',
    ];

    private const STOP_WORDS = [
        'ما', 'هي', 'هو', 'هل', 'في', 'من', 'عن', 'على', 'إلى', 'الى', 'او', 'أو',
        'مع', 'عند', 'كل', 'كم', 'كيف', 'متى', 'لماذا', 'ليه', 'ايه', 'إيه', 'اي', 'أي',
        'عايز', 'عاوز', 'محتاج', 'اريد', 'أريد', 'ممكن', 'لو', 'سمحت', 'علاج', 'دواء',
        'ادوية', 'أدوية', 'افضل', 'أفضل', 'احسن', 'أحسن', 'طريقة', 'طريقه', 'نصائح',
        'سعر', 'بكام', 'متوفر', 'موجود', 'عندكم', 'صيدلية', 'صيدليتي', 'اليوم', 'يوميا', 'يومياً',
    ];

    /**
     * إرسال سؤال المريض إلى نماذج الذكاء الاصطناعي المتاحة، مع محرك صيدلاني ذكي محلي مرتبط بقاعدة البيانات عند غياب مفتاح خارجي فعال
     */
    public function ask(string $question): string
    {
        return $this->askWithContext($question)['answer'];
    }

    /**
     * إرسال سؤال المريض وإرجاع الإجابة مع الروابط والبطاقات القابلة للنقر للأدوية والأطباء المطابقين في النظام
     *
     * @return array{answer: string, suggestions: array{medicines: array<int, array<string, mixed>>, doctors: array<int, array<string, mixed>>}}
     */
    public function askWithContext(string $question): array
    {
        $normalizedQuestion = trim(preg_replace('/\s+/u', ' ', $question) ?? $question);
        if ($normalizedQuestion === '') {
            return [
                'answer' => $this->buildWelcomeGuide(),
                'suggestions' => ['medicines' => [], 'doctors' => []],
            ];
        }

        $matchingMedicines = $this->findRelevantMedicines($normalizedQuestion);
        $matchingDoctors = $this->findRelevantDoctors($normalizedQuestion);
        $suggestions = $this->formatSuggestions($matchingMedicines, $matchingDoctors);

        $cacheKey = 'ai_chat:v2:' . sha1(mb_strtolower($normalizedQuestion, 'UTF-8'));
        $cachedAnswer = Cache::get($cacheKey);
        if (is_string($cachedAnswer) && $cachedAnswer !== '') {
            return [
                'answer' => $cachedAnswer,
                'suggestions' => $suggestions,
            ];
        }

        $dbContext = $this->formatDatabaseContext($matchingMedicines, $matchingDoctors);

        $client = new Client([
            'timeout' => 12,
            'connect_timeout' => 5,
            'verify' => $this->resolveSslVerifyOption(),
        ]);

        $openrouterKey = config('openrouter.api_key');
        if ($this->isValidApiKey(is_string($openrouterKey) ? $openrouterKey : null)) {
            $answer = $this->tryOpenRouter($client, (string) $openrouterKey, $normalizedQuestion, $dbContext);
            if ($answer !== null) {
                Cache::put($cacheKey, $answer, self::CACHE_TTL_SECONDS);
                return [
                    'answer' => $answer,
                    'suggestions' => $suggestions,
                ];
            }
        }

        $geminiKeys = array_filter(
            [config('gemini.api_key'), config('gemini.fallback_key')],
            fn ($key) => $this->isValidApiKey(is_string($key) ? $key : null)
        );

        foreach ($geminiKeys as $key) {
            $answer = $this->tryGemini($client, (string) $key, $normalizedQuestion, $dbContext);
            if ($answer !== null) {
                Cache::put($cacheKey, $answer, self::CACHE_TTL_SECONDS);
                return [
                    'answer' => $answer,
                    'suggestions' => $suggestions,
                ];
            }
        }

        return [
            'answer' => $this->buildSmartLocalAnswer($normalizedQuestion, $matchingMedicines, $matchingDoctors),
            'suggestions' => $suggestions,
        ];
    }

    /**
     * حل مشكلة شهادة SSL (cURL error 60) تلقائياً على بيئة Windows
     *
     * @return bool|string
     */
    private function resolveSslVerifyOption(): bool|string
    {
        foreach ([ini_get('curl.cainfo'), ini_get('openssl.cafile')] as $iniPath) {
            if (is_string($iniPath) && $iniPath !== '' && is_file($iniPath)) {
                return $iniPath;
            }
        }

        $candidateBundles = [
            'C:/Program Files/Git/usr/ssl/certs/ca-bundle.crt',
            'C:/Program Files/Git/mingw64/ssl/certs/ca-bundle.crt',
            'C:/xampp/apache/bin/curl-ca-bundle.crt',
            'C:/laragon/etc/ssl/cacert.pem',
        ];

        foreach ($candidateBundles as $bundle) {
            if (is_file($bundle)) {
                return $bundle;
            }
        }

        if (app()->environment(['local', 'testing'])) {
            return false;
        }

        return true;
    }

    private function isValidApiKey(?string $key): bool
    {
        if (empty($key)) {
            return false;
        }

        return !in_array($key, [
            'your_openrouter_api_key_here',
            'your_gemini_api_key_here',
        ], true);
    }

    private function tryOpenRouter(Client $client, string $apiKey, string $question, string $dbContext): ?string
    {
        $deadKeyFlag = 'ai_chat:dead_key:' . sha1('openrouter:' . $apiKey);
        if (Cache::get($deadKeyFlag) === true) {
            return null;
        }

        $systemContent = $dbContext !== ''
            ? self::SYSTEM_PROMPT . "\n\nبيانات متوفرة حالياً في قاعدة بيانات الصيدلية:\n" . $dbContext
            : self::SYSTEM_PROMPT;

        foreach (self::OPENROUTER_MODELS as $model) {
            try {
                $response = $client->post('https://openrouter.ai/api/v1/chat/completions', [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'system', 'content' => $systemContent],
                            ['role' => 'user', 'content' => $question],
                        ],
                    ],
                ]);

                $data = json_decode($response->getBody()->getContents(), true);
                $answer = trim((string) ($data['choices'][0]['message']['content'] ?? ''));

                if ($answer !== '') {
                    return $answer;
                }
            } catch (\Throwable $e) {
                Log::warning("AIChatService OpenRouter error ({$model}): " . $e->getMessage());
                if (in_array((int) $e->getCode(), [401, 403], true)) {
                    Cache::put($deadKeyFlag, true, 600);
                    return null;
                }
            }
        }

        return null;
    }

    private function tryGemini(Client $client, string $apiKey, string $question, string $dbContext): ?string
    {
        $deadKeyFlag = 'ai_chat:dead_key:' . sha1('gemini:' . $apiKey);
        if (Cache::get($deadKeyFlag) === true) {
            return null;
        }

        $systemContent = $dbContext !== ''
            ? self::SYSTEM_PROMPT . "\n\nبيانات متوفرة حالياً في قاعدة بيانات الصيدلية:\n" . $dbContext
            : self::SYSTEM_PROMPT;

        foreach (self::GEMINI_MODELS as $model) {
            try {
                $response = $client->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                    [
                        'headers' => ['Content-Type' => 'application/json'],
                        'json' => [
                            'systemInstruction' => [
                                'parts' => [['text' => $systemContent]],
                            ],
                            'contents' => [[
                                'role' => 'user',
                                'parts' => [['text' => $question]],
                            ]],
                        ],
                    ]
                );

                $data = json_decode($response->getBody()->getContents(), true);
                $answer = trim((string) ($data['candidates'][0]['content']['parts'][0]['text'] ?? ''));

                if ($answer !== '') {
                    return $answer;
                }
            } catch (\Throwable $e) {
                Log::warning("AIChatService Gemini error ({$model}): " . $e->getMessage());
                if (in_array((int) $e->getCode(), [401, 403], true) || str_contains($e->getMessage(), 'API_KEY_INVALID') || str_contains($e->getMessage(), 'reported as leaked')) {
                    Cache::put($deadKeyFlag, true, 600);
                    return null;
                }
            }
        }

        return null;
    }

    /**
     * البحث في جدول الأدوية عن الأصناف المرتبطة بسؤال المريض
     */
    private function findRelevantMedicines(string $question): Collection
    {
        try {
            $keywords = $this->extractKeywords($question);
            $expandedTerms = $this->expandMedicalSearchTerms($question, $keywords);

            if ($expandedTerms === []) {
                return collect();
            }

            return Medicien::query()
                ->where(function ($query) use ($expandedTerms) {
                    foreach ($expandedTerms as $term) {
                        $query->orWhere('name', 'like', "%{$term}%")
                            ->orWhere('propose', 'like', "%{$term}%")
                            ->orWhere('type', 'like', "%{$term}%");
                    }
                })
                ->orderByDesc('count')
                ->limit(3)
                ->get();
        } catch (\Throwable) {
            return collect();
        }
    }

    /**
     * البحث في جدول الأطباء عن التخصصات أو الأسماء المرتبطة بسؤال المريض
     */
    private function findRelevantDoctors(string $question): Collection
    {
        try {
            $specialtyHint = $this->inferSpecialtyFromQuestion($question);
            $keywords = $this->extractKeywords($question);
            $validKeywords = array_values(array_filter($keywords, fn ($kw) => mb_strlen($kw, 'UTF-8') >= 3));

            if ($specialtyHint === null && !$this->mentionsDoctorIntent($question) && $validKeywords === []) {
                return collect();
            }

            $query = Doctor::query()->activeAndSubscribed();

            if ($specialtyHint === null && !$this->mentionsDoctorIntent($question)) {
                // البحث المباشر باسم الطبيب أو تخصصه حتى بدون كلمة "دكتور"
                $query->where(function ($q) use ($validKeywords) {
                    foreach ($validKeywords as $kw) {
                        $q->orWhere('name', 'like', "%{$kw}%")
                          ->orWhere('specialty', 'like', "%{$kw}%");
                    }
                });
            } else {
                $query->where(function ($q) use ($specialtyHint, $validKeywords) {
                    if ($specialtyHint !== null) {
                        $q->orWhere('specialty', 'like', "%{$specialtyHint}%");
                    }
                    foreach ($validKeywords as $kw) {
                        $q->orWhere('name', 'like', "%{$kw}%")
                          ->orWhere('specialty', 'like', "%{$kw}%");
                    }
                });
            }

            return $query->limit(3)->get();
        } catch (\Throwable) {
            return collect();
        }
    }

    private function formatDatabaseContext(Collection $medicines, Collection $doctors): string
    {
        $lines = [];

        if ($medicines->isNotEmpty()) {
            $lines[] = 'الأدوية المطابقة في الصيدلية:';
            foreach ($medicines as $med) {
                $stock = (int) $med->count > 0 ? "متوفر ({$med->count} عبوة)" : 'غير متوفر حالياً';
                $lines[] = "- {$med->name} ({$med->type}): {$med->propose} — السعر {$med->price} ج.م — {$stock}";
            }
        }

        if ($doctors->isNotEmpty()) {
            $lines[] = 'الأطباء المتاحون للحجز:';
            foreach ($doctors as $doc) {
                $lines[] = "- د. {$doc->name} (تخصص {$doc->specialty}) — الكشف {$doc->price} ج.م — {$doc->location}";
            }
        }

        return implode("\n", $lines);
    }

    /**
     * تجهيز بطاقات الأدوية والأطباء القابلة للنقر للانتقال المباشر لصفحاتهم في الموقع
     *
     * @return array{medicines: array<int, array<string, mixed>>, doctors: array<int, array<string, mixed>>}
     */
    private function formatSuggestions(Collection $medicines, Collection $doctors): array
    {
        return [
            'medicines' => $medicines->map(fn (Medicien $med) => [
                'id' => $med->id,
                'name' => $med->name,
                'type' => $med->type,
                'price' => (float) $med->price,
                'in_stock' => (int) $med->count > 0,
                'url' => "/medicines/{$med->id}",
            ])->values()->all(),
            'doctors' => $doctors->map(fn (Doctor $doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'specialty' => $doc->specialty,
                'price' => (float) $doc->price,
                'location' => $doc->location,
                'url' => "/doctors/{$doc->id}",
            ])->values()->all(),
        ];
    }

    /**
     * محرك الإرشاد الصيدلاني المحلي الذكي المرتبط بقاعدة البيانات
     */
    private function buildSmartLocalAnswer(string $question, Collection $medicines, Collection $doctors): string
    {
        $q = $this->normalizeArabic($question);
        $sections = [];

        // 1. ترحيب أو سؤال عام عن قدرات المساعد
        if ($this->matchesAny($q, ['السلام عليكم', 'اهلا', 'مرحبا', 'ازيك', 'صباح الخير', 'مساء الخير', 'مين انت', 'بتعمل ايه'])) {
            return $this->buildWelcomeGuide();
        }

        // 2. الباراسيتامول / البنادول والجرعات اليومية
        if ($this->matchesAny($q, ['باراسيتامول', 'بنادول', 'panadol', 'paracetamol', 'ابيمول', 'سيتال'])) {
            $sections[] = "💊 **إرشادات استخدام الباراسيتامول (Paracetamol / Panadol):**\n"
                . "• **الجرعة المعتادة للبالغين:** من `500 ملجم` إلى `1000 ملجم` (قرص إلى قرصين تركيز 500 ملجم) كل **6 إلى 8 ساعات** عند الحاجة.\n"
                . "• **الحد الأقصى الآمن يومياً:** لا تتجاوز **4,000 ملجم (4 جرام)** خلال 24 ساعة للبالغين الأصحاء (أي بحد أقصى 8 أقراص تركيز 500 ملجم).\n"
                . "• **تنبيهات هامة:** يُعد آمناً على المعدة مقارنة بالمسكنات الأخرى، لكن يجب تجنب تناول أكثر من دواء يحتوي على الباراسيتامول في نفس الوقت (مثل أدوية البرد) وخفض الجرعة لمرضى الكبد.";
        }

        // 3. المضادات الحيوية والتداخلات الدوائية
        if ($this->matchesAny($q, ['مضاد حيوي', 'مضادات حيويه', 'المضادات الحيويه', 'اوجمنتين', 'augmentin', 'تفاعلات', 'تداخلات', 'التفاعلات الدوائيه', 'التداخلات الدوائيه'])) {
            $sections[] = "🛡️ **أهم الإرشادات لتناول المضادات الحيوية وتجنب التداخلات الدوائية:**\n"
                . "• **إكمال الكورس العلاجي كاملاً:** لا توقف المضاد الحيوي بمجرد تحسن الأعراض لمنع عودة البكتيريا ومقاومتها للعلاج.\n"
                . "• **الالتزام بالمواعيد الدقيقة:** تناول الجرعة كل 8 أو 12 ساعة بانتظام مع كوب ماء كامل (ويُفضل بعد الأكل لبعض الأنواع مثل أوجمنتين لتقليل اضطراب المعدة).\n"
                . "• **تجنب التداخلات الشائعة:** افصل بين المضادات الحيوية ومنتجات الألبان أو مكملات الكالسيوم والحديد ومضادات الحموضة بمدة **ساعتين على الأقل** لأنها قد تقلل امتصاص بعض المضادات.\n"
                . "• **لا تُستخدم للعدوى الفيروسية:** المضادات الحيوية لا تعالج نزلات البرد أو الإنفلونزا الفيروسية إلا إذا وُجدت عدوى بكتيرية يحددها الطبيب.";
        }

        // 4. الإنسولين وحفظ وتخزين الأدوية
        if ($this->matchesAny($q, ['انسولين', 'الانسولين', 'تخزين', 'حفظ الادويه', 'حفظ الدواء', 'ثلاجه', 'التلاجه'])) {
            $sections[] = "❄️ **الطريقة الصحيحة لحفظ الإنسولين والأدوية في المنزل:**\n"
                . "• **الأقلام والعبوات غير المفتوحة (الجديدة):** تُحفظ في باب أو رف الثلاجة الأوسط عند درجة حرارة **2 إلى 8 مئوية**، مع تجنب وضعها في الفريزر أو ملاصقة جدار التجميد نهائياً.\n"
                . "• **القلم أو العبوة قيد الاستخدام الحالي:** يمكن حفظها في درجة حرارة الغرفة المعتدلة (**أقل من 25–30 مئوية**) بعيداً عن أشعة الشمس والحرارة المباشرة لمدة تصل إلى **28 يوماً** حسب نوع الإنسولين.\n"
                . "• **نصيحة عامة لتخزين الأدوية:** تجنب حفظ الأدوية في الحمام أو المطبخ بسبب الرطوبة والحرارة، وتأكد دائماً من صفاء محلول الإنسولين وتاريخ الصلاحية قبل الاستخدام.";
        }

        // 5. المسكنات وبدائلها لمرضى المعدة
        if ($this->matchesAny($q, ['مسكن', 'المسكنات', 'بدائل المسكنات', 'كتافلام', 'cataflam', 'بروفين', 'فولتارين', 'التهاب المفاصل', 'اسنان', 'الاسنان'])) {
            $sections[] = "🩺 **إرشادات المسكنات والبدائل الآمنة لمرضى المعدة:**\n"
                . "• **الخيار الأول والأكثر أماناً على المعدة:** مادة **الباراسيتامول (مثل بنادول)** هي البديل الآمن الأول لتسكين الألم وخفض الحرارة لمرضى التهاب أو قرحة المعدة.\n"
                . "• **المسكنات المضادة للالتهاب (NSAIDs مثل كتافلام وبروفين):** فعالة لآلام الأسنان والعظام، لكن يُنصح بتناولها **بعد الأكل مباشرة** وبأقل جرعة فعالة لأقصر مدة، مع تجنبها لمرضى قرحة المعدة النشطة أو القصور الكلوي.\n"
                . "• **حماية المعدة والبدائل الموضعية:** عند الضرورة القصوى لاستخدام مضادات الالتهاب تحت إشراف طبي، يمكن وصف واقٍ للمعدة، أو الاعتماد على **الجل والكريمات المسكنة الموضعية** لآلام العضلات والمفاصل.";
        }

        // 6. نزلات البرد والإنفلونزا والرشح والكحة والحرارة
        if ($this->matchesAny($q, ['برد', 'انفلونزا', 'رشح', 'زكام', 'احتقان', 'كحه', 'سعال', 'سخونيه', 'حراره', 'حمى', 'كونجستال', 'congestal'])) {
            $sections[] = "🌡️ **التعامل الصيدلاني مع نزلات البرد والرشح وارتفاع الحرارة:**\n"
                . "• **الراحة والسوائل الدافئة:** الإكثار من شرب الماء والمشروبات الدافئة وفيتامين سي لدعم المناعة وتهدئة الحلق.\n"
                . "• **تخفيف الأعراض:** يمكن استخدام خافضات الحرارة ومضادات الاحتقان (مثل أقراص البرد المركبة)، مع **الحذر لمرضى الضغط المرتفع** من مضادات الاحتقان الفموية واستبدالها ببخاخ محلول الملح للأنف.\n"
                . "• **متى تراجع الطبيب فوراً؟** إذا استمرت الحرارة المرتفعة لأكثر من 3 أيام، أو صاحبها ضيق في التنفس أو ألم شديد في الصدر أو الأذن.";
        }

        // 7. الصداع
        if ($sections === [] && $this->matchesAny($q, ['صداع', 'الصداع', 'نصفي', 'دماغ', 'راس'])) {
            $sections[] = "🧠 **نصائح سريعة للتعامل مع الصداع:**\n"
                . "• **الأسباب الشائعة:** الجفاف وقلة شرب الماء، الإجهاد البصري، قلة النوم، التوتر، أو تغير مواعيد الكافيين.\n"
                . "• **العلاج الأولي:** شرب كوبين من الماء، الراحة في غرفة هادئة، ويمكن تناول مسكن آمن مثل **الباراسيتامول** بعد التأكد من عدم وجود موانع.\n"
                . "• **تنبيه طبي:** إذا كان الصداع مفاجئاً وشديداً غير معتاد، أو مصحوباً بزغللة في العين أو قيء أو ارتفاع في ضغط الدم، يُنصح بقياس الضغط ومراجعة الطبيب.";
        }

        // 8. المعدة والحموضة والارتجاع والقولون
        if ($this->matchesAny($q, ['معده', 'المعده', 'حموضه', 'الحموضه', 'ارتجاع', 'قرحه', 'قولون', 'انتفاخ', 'مغص', 'انتودين', 'antodine'])) {
            $sections[] = "🌿 **إرشادات تهدئة الحموضة وارتجاع المريء واضطرابات المعدة:**\n"
                . "• **عادات غذائية أساسية:** تقسيم الوجبات لكميات صغيرة، تجنب المقليات والأطعمة الحارة والقهوة على معدة فارغة، وعدم الاستلقاء قبل مرور **2–3 ساعات** من تناول الطعام.\n"
                . "• **الخيارات الدوائية:** مضادات الحموضة الفورية أو مثبطات إفراز الحمض (مثل فاموتيدين / أنتودين أو أوميبرازول) تساعد على تهدئة جدار المعدة بفعالية.\n"
                . "• **تجنب مهيجات المعدة:** ابتعد عن المسكنات القوية على معدة فارغة والتدخين.";
        }

        // 9. الفيتامينات والمناعة والإرهاق
        if ($this->matchesAny($q, ['فيتامين', 'فيتامينات', 'مناعه', 'المناعه', 'اجهاد', 'ارهاق', 'خمول', 'تعب', 'انيميا', 'حديد'])) {
            $sections[] = "🍊 **دعم المناعة ومقاومة الإجهاد والفيتامينات:**\n"
                . "• **فيتامين C والزنك:** يساعدان في دعم الجهاز المناعي وتقليل مدة نزلات البرد، ويُفضل تناول الفوار بعد وجبة الإفطار أو الغداء مع كمية كافية من الماء.\n"
                . "• **الشعور المستمر بالخمول:** في حال استمرار الإرهاق الشديد، يُنصح بإجراء تحليل صورة دم كاملة (CBC) ومخزون الحديد وفيتامين D قبل تناول مكملات بجرعات عالية.";
        }

        // 10. الضغط والقلب أو السكر
        if ($this->matchesAny($q, ['ضغط', 'الضغط', 'قلب', 'القلب', 'كوليسترول', 'سكر', 'السكر', 'سكري'])) {
            $sections[] = "❤️ **إرشادات هامة لمرضى الضغط والقلب والسكري:**\n"
                . "• **الانتظام الدقيق:** أدوية الضغط والقلب والسكري تُؤخذ يومياً في نفس الموعد ولا يتم إيقافها أو تعديل جرعتها أبداً دون الرجوع للطبيب المعالج حتى لو كانت القياسات طبيعية.\n"
                . "• **الحذر من الأدوية المتداخلة:** استشر الصيدلي قبل تناول أدوية البرد المحتوية على مضادات احتقان أو المسكنات المضادة للالتهاب أو الفوارات عالية الصوديوم.";
        }

        // 11. الحمل والرضاعة والأطفال
        if ($this->matchesAny($q, ['حامل', 'الحمل', 'رضاعه', 'الرضاعه', 'طفل', 'اطفال', 'رضيع'])) {
            $sections[] = "👶 **تنبيه خاص بالحمل والرضاعة وصحة الأطفال:**\n"
                . "• **خلال الحمل والرضاعة:** لا تتناولي أي دواء أو مكمل عشبي دون مراجعة الطبيب؛ ويُعد **الباراسيتامول العادي** (بدون كافيين أو إضافات) الخيار الأكثر أماناً عند الضرورة القصوى للألم أو الحرارة.\n"
                . "• **للأطفال:** تُحسب جرعات خافضات الحرارة والمضادات الحيوية **بدقة حسب وزن الطفل بالكيلوجرام** وليس العمر فقط، باستخدام سرنجة أو معيار مدرج.";
        }

        // 12. استفسار عن الطلب أو الحجز عبر المنصة
        if ($this->matchesAny($q, ['تتبع', 'طلب', 'توصيل', 'شحن', 'حجز موعد', 'احجز', 'ازاي اطلب'])) {
            $sections[] = "📦 **خدمات الطلب والحجز عبر منصة صيدليتي:**\n"
                . "• **شراء الأدوية:** تصفح صفحة **الأدوية** وأضف ما تحتاجه إلى السلة لإتمام الطلب والتوصيل السريع.\n"
                . "• **تتبع الطلب:** يمكنك متابعة حالة طلبك لحظياً من صفحة **تتبع طلبك** برقم الطلب ورقم الهاتف.\n"
                . "• **حجز عيادة:** اختر الطبيب والتخصص المناسب من صفحة **الأطباء** أو **حجز موعد** وحدد اليوم والساعة المتاحة فوراً.";
        }

        // إضافة نتائج حية من قاعدة بيانات الصيدلية إن وُجدت
        if ($medicines->isNotEmpty()) {
            $medLines = ["🏥 **الأدوية ذات الصلة المتوفرة حالياً في صيدليتي:**"];
            foreach ($medicines as $med) {
                $stockBadge = (int) $med->count > 0 ? 'متوفر بالمخزون' : 'غير متوفر حالياً';
                $medLines[] = "• **{$med->name}** ({$med->type}) — {$med->propose} | السعر: **{$med->price} ج.م** ({$stockBadge})";
            }
            $sections[] = implode("\n", $medLines);
        }

        if ($doctors->isNotEmpty()) {
            $docLines = ["👨‍⚕️ **أطباء معتمدون متاحون لحجز استشارة على المنصة:**"];
            foreach ($doctors as $doc) {
                $location = trim(($doc->location ?? '') . ($doc->tow_location ? " - {$doc->tow_location}" : ''));
                $docLines[] = "• **د. {$doc->name}** — تخصص **{$doc->specialty}** | الكشف: **{$doc->price} ج.م**" . ($location !== '' ? " ({$location})" : '');
            }
            $sections[] = implode("\n", $docLines);
        }

        // إذا كان السؤال مختلفاً ولم يطابق تصنيفاً محدداً، قدم رداً تفاعلياً مخصصاً لسؤال المستخدم بدلاً من جملة مكررة
        if ($sections === []) {
            $availableMeds = $this->getSampleAvailableMedicines();
            $reply = "شكراً لتواصلك مع **الصيدلي الذكي** بخصوص: «{$question}».\n\n"
                . "لتقديم أدق إرشاد دوائي آمن لحالتك، يمكنك توضيح:\n"
                . "• **الأعراض الأساسية** ومدتها، أو **اسم الدواء / المادة الفعالة** التي تستفسر عنها.\n"
                . "• العمر وما إذا كانت هناك أدوية مزمنة (مثل الضغط أو السكري أو حساسية دوائية).\n";

            if ($availableMeds !== '') {
                $reply .= "\n💊 **من أبرز الأصناف المتوفرة حالياً في صيدليتنا:**\n" . $availableMeds;
            }

            $reply .= "\n\n⚕️ ملاحظة صيدلانية: هذه الإرشادات للتوعية الطبية العامة ولا تغني عن مراجعة الطبيب المختص عند استمرار الأعراض.";
            return $reply;
        }

        $sections[] = "⚕️ ملاحظة صيدلانية: هذه الإرشادات للتوعية الطبية العامة ولا تغني عن استشارة الطبيب المختص في الحالات المزمنة أو الطارئة.";

        return implode("\n\n", $sections);
    }

    private function buildWelcomeGuide(): string
    {
        return "مرحباً بك في **الصيدلي الذكي لمنصة صيدليتي** 🤖!\n\n"
            . "يسعدني مساعدتك فوراً في أي مما يلي:\n"
            . "• **الجرعات وطريقة الاستخدام:** (مثل: جرعة الباراسيتامول أو المضادات الحيوية).\n"
            . "• **الأعراض الشائعة والبدائل الآمنة:** (البرد، الصداع، الحموضة، المسكنات لمرضى المعدة، حفظ الإنسولين).\n"
            . "• **البحث في مخزون الصيدلية والأطباء:** اسألني عن اسم أي دواء أو تخصص طبي لنعرض لك المتوفر وأسعاره مباشرة.";
    }

    private function getSampleAvailableMedicines(): string
    {
        try {
            $meds = Medicien::query()
                ->where('count', '>', 0)
                ->limit(3)
                ->get(['name', 'propose', 'price']);

            if ($meds->isEmpty()) {
                return '';
            }

            return $meds
                ->map(fn ($m) => "• **{$m->name}** — {$m->propose} (**{$m->price} ج.م**)")
                ->implode("\n");
        } catch (\Throwable) {
            return '';
        }
    }

    /**
     * توحيد الحروف العربية لتسهيل مطابقة الكلمات المفتاحية مهما اختلفت الهمزات أو التاء المربوطة
     */
    private function normalizeArabic(string $text): string
    {
        $lower = mb_strtolower($text, 'UTF-8');
        $search = ['أ', 'إ', 'آ', 'ة', 'ى', 'ؤ', 'ئ', 'ـ'];
        $replace = ['ا', 'ا', 'ا', 'ه', 'ي', 'و', 'ي', ''];
        $cleaned = str_replace($search, $replace, $lower);
        $cleaned = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $cleaned) ?? $cleaned;
        return trim(preg_replace('/\s+/u', ' ', $cleaned) ?? $cleaned);
    }

    /**
     * @param list<string> $phrases
     */
    private function matchesAny(string $normalizedText, array $phrases): bool
    {
        foreach ($phrases as $phrase) {
            $normPhrase = $this->normalizeArabic($phrase);
            if ($normPhrase !== '' && mb_strpos($normalizedText, $normPhrase, 0, 'UTF-8') !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return list<string>
     */
    private function extractKeywords(string $question): array
    {
        $clean = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $question) ?? $question;
        $parts = preg_split('/\s+/u', trim($clean)) ?: [];
        $keywords = [];

        foreach ($parts as $word) {
            $word = trim($word);
            if (mb_strlen($word, 'UTF-8') < 3) {
                continue;
            }
            $withoutAl = preg_replace('/^ال/u', '', $word) ?? $word;
            if (in_array(mb_strtolower($word, 'UTF-8'), self::STOP_WORDS, true) || in_array(mb_strtolower($withoutAl, 'UTF-8'), self::STOP_WORDS, true)) {
                continue;
            }
            $keywords[] = $word;
            if ($withoutAl !== $word && mb_strlen($withoutAl, 'UTF-8') >= 3) {
                $keywords[] = $withoutAl;
            }
        }

        return array_values(array_unique($keywords));
    }

    /**
     * @param list<string> $keywords
     * @return list<string>
     */
    private function expandMedicalSearchTerms(string $question, array $keywords): array
    {
        $q = $this->normalizeArabic($question);
        $terms = $keywords;

        $synonymMap = [
            'باراسيتامول' => ['بنادول', 'Panadol', 'مسكن', 'حرارة'],
            'صداع' => ['بنادول', 'صداع', 'مسكن'],
            'حراره' => ['بنادول', 'حرارة', 'خافض'],
            'سخونيه' => ['بنادول', 'حرارة'],
            'برد' => ['كونجستال', 'برد', 'إنفلونزا', 'فيتامين سي'],
            'انفلونزا' => ['كونجستال', 'إنفلونزا', 'برد'],
            'رشح' => ['كونجستال', 'رشح'],
            'مضاد حيوي' => ['أوجمنتين', 'Augmentin', 'مضاد حيوي'],
            'مضادات حيويه' => ['أوجمنتين', 'Augmentin', 'مضاد حيوي'],
            'مسكن' => ['بنادول', 'كتافلام', 'مسكن'],
            'اسنان' => ['كتافلام', 'مسكن'],
            'عظام' => ['كتافلام', 'التهاب', 'الروماتيزم'],
            'مفاصل' => ['كتافلام', 'الروماتيزم'],
            'معده' => ['أنتودين', 'Antodine', 'معدة', 'حموضة'],
            'حموضه' => ['أنتودين', 'حموضة', 'ارتجاع'],
            'ارتجاع' => ['أنتودين', 'ارتجاع'],
            'فيتامين' => ['فيتامين', 'Vitamin', 'مناعة'],
            'مناعه' => ['فيتامين سي', 'مناعة'],
        ];

        foreach ($synonymMap as $trigger => $mappedTerms) {
            if ($this->matchesAny($q, [$trigger])) {
                array_push($terms, ...$mappedTerms);
            }
        }

        return array_slice(array_values(array_unique($terms)), 0, 10);
    }

    private function inferSpecialtyFromQuestion(string $question): ?string
    {
        $q = $this->normalizeArabic($question);

        if ($this->matchesAny($q, ['قلب', 'ضغط', 'صدر', 'شرايين', 'نبض'])) {
            return 'قلب';
        }
        if ($this->matchesAny($q, ['عظام', 'مفاصل', 'ظهر', 'ركبه', 'غضروف', 'كسور', 'روماتيزم'])) {
            return 'عظام';
        }
        if ($this->matchesAny($q, ['طفل', 'اطفال', 'رضيع', 'تطعيم'])) {
            return 'أطفال';
        }
        if ($this->matchesAny($q, ['عين', 'عيون', 'نظر', 'رمد', 'زغلله'])) {
            return 'عيون';
        }
        if ($this->matchesAny($q, ['باطنه', 'معده', 'قولون', 'حموضه', 'ارتجاع', 'سكر', 'كبد', 'هضمي'])) {
            return 'باطنة';
        }

        return null;
    }

    private function mentionsDoctorIntent(string $question): bool
    {
        $q = $this->normalizeArabic($question);
        return $this->matchesAny($q, ['دكتور', 'طبيب', 'اطباء', 'استشاري', 'عياده', 'تخصص', 'كشف']);
    }
}
