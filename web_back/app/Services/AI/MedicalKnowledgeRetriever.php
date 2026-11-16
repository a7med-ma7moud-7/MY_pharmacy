<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Models\AiConfiguration;
use App\Models\AiKnowledgeSource;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class MedicalKnowledgeRetriever
{
    private const HTTP_USER_AGENT = 'SaydaletyHealthcareAssistant/2.0 (https://github.com/a7med-ma7moud-7/MY_pharmacy; support@saydalety.local) GuzzleHttp/7';
    private const WEB_CACHE_TTL = 86400;

    /**
     * @var array<string, string>
     */
    private const GENERAL_TOPIC_ALIASES = [
        'كونكور' => 'بيسوبرولول',
        'concor' => 'bisoprolol',
        'جلوكوفاج' => 'ميتفورمين',
        'سيدوفاج' => 'ميتفورمين',
        'glucophage' => 'metformin',
        'ميتفورمين' => 'ميتفورمين',
        'metformin' => 'metformin',
        'نيكسيوم' => 'إيزوميبرازول',
        'nexium' => 'esomeprazole',
        'اوميز' => 'أوميبرازول',
        'اوميبرازول' => 'أوميبرازول',
        'omeprazole' => 'omeprazole',
        'انتودين' => 'فاموتيدين',
        'antodine' => 'famotidine',
        'بنادول' => 'باراسيتامول',
        'بانادول' => 'باراسيتامول',
        'ابيمول' => 'باراسيتامول',
        'سيتال' => 'باراسيتامول',
        'panadol' => 'acetaminophen',
        'paracetamol' => 'acetaminophen',
        'acetaminophen' => 'acetaminophen',
        'كتافلام' => 'ديكلوفيناك',
        'فولتارين' => 'ديكلوفيناك',
        'cataflam' => 'diclofenac',
        'بروفين' => 'إيبوبروفين',
        'brufen' => 'ibuprofen',
        'ibuprofen' => 'ibuprofen',
        'اوجمنتين' => 'أموكسيسيلين/حمض الكلافولانيك',
        'augmentin' => 'amoxicillin',
        'amoxicillin' => 'amoxicillin',
        'زيثروماكس' => 'أزيثروميسين',
        'ازيثروميسين' => 'أزيثروميسين',
        'azithromycin' => 'azithromycin',
        'اوزمبيك' => 'سيماغلوتيد',
        'ozempic' => 'semaglutide',
        'التروكسين' => 'ليفوثيروكسين',
        'eltroxin' => 'levothyroxine',
        'اسبرين' => 'أسبرين',
        'aspirin' => 'aspirin',
        'اوميجا 3' => 'أحماض أوميغا 3 الدهنية',
        'اوميغا 3' => 'أحماض أوميغا 3 الدهنية',
        'omega 3' => 'omega-3 fatty acids',
        'فيتامين د' => 'فيتامين د',
        'vitamin d' => 'vitamin D',
        'فيتامين ب12' => 'فيتامين ب12',
        'vitamin b12' => 'vitamin B12',
        'جرثومه المعده' => 'ملوية بوابية',
        'القولون العصبي' => 'متلازمة القولون المتهيج',
        'خمول الغده' => 'قصور الدرقية',
        'قصور الغده الدرقيه' => 'قصور الدرقية',
        'مقاومه الانسولين' => 'مقاومة الإنسولين',
        'النقرس' => 'نقرس',
        'نقرس' => 'نقرس',
    ];

    /**
     * استرجاع المعرفة الطبية العامة والمراجع الموثقة المفعّلة (باللغتين العربية والإنجليزية)
     *
     * @param list<string> $extraTerms مصطلحات إضافية مستخرجة (مثلاً أسماء الأدوية من روشتة المريض في الوضع المدمج)
     * @return array{
     *   sections_ar: list<string>,
     *   sections_en: list<string>,
     *   references: list<array{source_name: string, title: string, source_url: string, source_type: string, published_or_updated_at: string|null}>,
     *   has_confident_match: bool
     * }
     */
    public function retrieve(Client $client, string $question, string $language = 'ar', array $extraTerms = []): array
    {
        if (!AiConfiguration::getBool('general_knowledge_enabled', true)) {
            return [
                'sections_ar' => [],
                'sections_en' => [],
                'references' => [],
                'has_confident_match' => false,
            ];
        }

        $enabledSlugs = $this->getEnabledSourceSlugs();
        $combinedSearchInput = trim($question . ($extraTerms !== [] ? ' ' . implode(' ', $extraTerms) : ''));
        $normAr = $this->normalizeArabic($combinedSearchInput);
        $lowerEn = mb_strtolower($combinedSearchInput, 'UTF-8');

        $sectionsAr = [];
        $sectionsEn = [];
        $references = [];

        // 1. المونوجرافات الإكلينيكية والدوائية المعتمدة (MedlinePlus / WHO / Saydalety Clinical Guidelines)
        $curated = $this->matchCuratedMonographs($normAr, $lowerEn, $enabledSlugs);
        foreach ($curated['sections_ar'] as $s) {
            $sectionsAr[] = $s;
        }
        foreach ($curated['sections_en'] as $s) {
            $sectionsEn[] = $s;
        }
        foreach ($curated['references'] as $ref) {
            $references[] = $ref;
        }

        // 2. البحث الخارجي الحي في المصادر المفعلة (OpenFDA + MediaWiki Medical) عند السماح بذلك
        $allowExternal = AiConfiguration::getBool('external_medical_sources_enabled', true)
            && !app()->environment('testing');

        if ($allowExternal && $this->shouldQueryExternalSources($combinedSearchInput, $normAr, $lowerEn, $sectionsAr === [])) {
            // OpenFDA Drug Label API
            if (in_array('openfda-drug-labels', $enabledSlugs, true)) {
                $fdaHit = $this->lookupOpenFda($client, $combinedSearchInput, $extraTerms);
                if ($fdaHit !== null) {
                    if ($language === 'en' || $sectionsEn === []) {
                        $sectionsEn[] = "📋 **Official Drug Label Summary ({$fdaHit['title']}):**\n" . $fdaHit['summary'];
                    }
                    if ($language === 'ar' && $sectionsAr === []) {
                        $sectionsAr[] = "📋 **ملخص البطاقة الدوائية المعتمدة ({$fdaHit['title']}):**\n" . $fdaHit['summary'];
                    }
                    $references[] = $fdaHit['reference'];
                }
            }

            // MediaWiki Medical / Pharmacology Reference
            if (in_array('wikimedia-medical', $enabledSlugs, true)) {
                $wikiLang = $language === 'en' ? 'en' : 'ar';
                $wikiHit = $this->lookupMediaWiki($client, $wikiLang, $combinedSearchInput);
                if ($wikiHit === null && $wikiLang === 'ar') {
                    $wikiHit = $this->lookupMediaWiki($client, 'en', $combinedSearchInput);
                }

                if ($wikiHit !== null) {
                    if ($language === 'en') {
                        array_unshift($sectionsEn, "🌐 **Medical & Scientific Overview ({$wikiHit['title']}):**\n{$wikiHit['summary']}");
                    } else {
                        array_unshift($sectionsAr, "🌐 **معلومات طبية وعلمية عامة عن «{$wikiHit['title']}»:**\n{$wikiHit['summary']}");
                    }
                    $references[] = $wikiHit['reference'];
                }
            }
        }

        $dedupedRefs = $this->deduplicateReferences($references);

        return [
            'sections_ar' => $sectionsAr,
            'sections_en' => $sectionsEn,
            'references' => $dedupedRefs,
            'has_confident_match' => ($sectionsAr !== [] || $sectionsEn !== []),
        ];
    }

    /**
     * @return list<string>
     */
    private function getEnabledSourceSlugs(): array
    {
        try {
            if (!Schema::hasTable('ai_knowledge_sources')) {
                return [
                    'saydalety-clinical-guidelines',
                    'openfda-drug-labels',
                    'nih-medlineplus',
                    'who-guidelines',
                    'wikimedia-medical',
                ];
            }

            return AiKnowledgeSource::query()
                ->where('is_enabled', true)
                ->pluck('slug')
                ->all();
        } catch (\Throwable) {
            return [
                'saydalety-clinical-guidelines',
                'openfda-drug-labels',
                'nih-medlineplus',
                'who-guidelines',
                'wikimedia-medical',
            ];
        }
    }

    /**
     * @param list<string> $enabledSlugs
     * @return array{sections_ar: list<string>, sections_en: list<string>, references: list<array<string, string|null>>}
     */
    private function matchCuratedMonographs(string $normAr, string $lowerEn, array $enabledSlugs): array
    {
        $hasMedline = in_array('nih-medlineplus', $enabledSlugs, true);
        $hasWho = in_array('who-guidelines', $enabledSlugs, true);
        $hasGuidelines = in_array('saydalety-clinical-guidelines', $enabledSlugs, true);

        if (!$hasMedline && !$hasWho && !$hasGuidelines) {
            return ['sections_ar' => [], 'sections_en' => [], 'references' => []];
        }

        $sectionsAr = [];
        $sectionsEn = [];
        $references = [];

        $monographs = [
            // 1. Paracetamol / Acetaminophen
            [
                'ar_triggers' => ['باراسيتامول', 'بنادول', 'بانادول', 'ابيمول', 'سيتال'],
                'en_triggers' => ['paracetamol', 'acetaminophen', 'panadol', 'tylenol'],
                'ar' => "💊 **الاستخدام والإرشادات الدوائية للباراسيتامول (Paracetamol / Acetaminophen):**\n"
                    . "• **دواعي الاستعمال العامة:** مسكن للألم الخفيف إلى المتوسط (الصداع، آلام الأسنان، العضلات) وخافض للحرارة.\n"
                    . "• **نطاق الجرعة الإرشادي للبالغين:** `500 ملجم` إلى `1000 ملجم` كل 6–8 ساعات عند اللزوم، وبحد أقصى لا يتجاوز **4,000 ملجم (4 جرام)** خلال 24 ساعة للبالغين الأصحاء.\n"
                    . "• **احتياطات وموانع هامة:** يُعد لطيفاً على المعدة مقارنةً بمضادات الالتهاب، لكن يجب تجنب الجمع بين أكثر من مستحضر يحتوي على الباراسيتامول (مثل أدوية البرد المركبة)، واستشارة الطبيب في حالات أمراض الكبد المزمنة.",
                'en' => "💊 **General Medication Information — Paracetamol (Acetaminophen):**\n"
                    . "• **Direct Answer & Uses:** Commonly used to relieve mild-to-moderate pain (headache, toothache, muscle aches) and to reduce fever.\n"
                    . "• **General Adult Guidance:** Typically `500 mg` to `1,000 mg` every 6–8 hours as needed, never exceeding **4,000 mg (4 g)** within 24 hours in healthy adults.\n"
                    . "• **Important Precautions:** Gentle on the stomach compared to NSAIDs, but avoid taking multiple products containing acetaminophen simultaneously (such as multi-symptom cold remedies), and consult a physician if you have liver disease.",
                'ref' => $hasMedline ? [
                    'source_name' => 'NIH MedlinePlus Drug Information',
                    'title' => 'Acetaminophen (Paracetamol) — Drug Information',
                    'source_url' => 'https://medlineplus.gov/druginfo/meds/a681004.html',
                    'source_type' => 'medical_organization',
                    'published_or_updated_at' => '2024-01',
                ] : null,
            ],

            // 2. Ibuprofen / Diclofenac / NSAIDs
            [
                'ar_triggers' => ['ايبوبروفين', 'بروفين', 'ديكلوفيناك', 'كتافلام', 'فولتارين', 'مسكن', 'المسكنات', 'بدائل المسكنات'],
                'en_triggers' => ['ibuprofen', 'brufen', 'diclofenac', 'cataflam', 'voltaren', 'nsaid', 'nsaids'],
                'ar' => "🩺 **معلومات عامة عن مضادات الالتهاب غير الستيرويدية (Ibuprofen / Diclofenac):**\n"
                    . "• **الاستخدام العام:** تسكين الآلام المصحوبة بالتهاب مثل آلام الأسنان، المفاصل، العضلات، وخفض الحرارة.\n"
                    . "• **الأعراض الجانبية الشائعة:** تهيج المعدة، الحموضة، الغثيان، الدوخة، أو احتباس السوائل وارتفاع ضغط الدم عند الاستخدام المتكرر.\n"
                    . "• **احتياطات وموانع الاستعمال:** يُفضّل تناولها بعد الطعام مباشرةً وبأقل جرعة فعالة لأقصر مدة؛ وتُمنع أو تُستخدم بحذر شديد لمرضى قرحة المعدة النشطة، القصور الكلوي، الربو الحساس للمسكنات، أو الثلث الأخير من الحمل.",
                'en' => "🩺 **General Medication Information — NSAIDs (Ibuprofen / Diclofenac):**\n"
                    . "• **Direct Answer & Uses:** Used to reduce inflammation, fever, and mild-to-moderate pain (dental pain, arthritis, musculoskeletal pain, menstrual cramps).\n"
                    . "• **Common Side Effects:** Stomach upset, heartburn, nausea, mild dizziness, and potential fluid retention or elevated blood pressure.\n"
                    . "• **Important Precautions & Contraindications:** Take with food or milk to minimize gastric irritation. Avoid or consult a doctor if you have active peptic ulcer disease, kidney impairment, heart failure, blood-thinning therapy, or late-stage pregnancy.",
                'ref' => $hasMedline ? [
                    'source_name' => 'NIH MedlinePlus Drug Information',
                    'title' => 'Ibuprofen — Uses, Side Effects, and Precautions',
                    'source_url' => 'https://medlineplus.gov/druginfo/meds/a682159.html',
                    'source_type' => 'medical_organization',
                    'published_or_updated_at' => '2024-02',
                ] : null,
            ],

            // 3. Antibiotics vs Antivirals & Amoxicillin/Augmentin
            [
                'ar_triggers' => ['مضاد حيوي', 'مضادات حيويه', 'اوجمنتين', 'اموكسيسيلين', 'ازيثروميسين', 'زيثروماكس', 'مضادات الفيروسات', 'تداخلات'],
                'en_triggers' => ['antibiotic', 'antibiotics', 'antiviral', 'antivirals', 'augmentin', 'amoxicillin', 'azithromycin'],
                'ar' => "🛡️ **المضادات الحيوية والفرق بينها وبين مضادات الفيروسات:**\n"
                    . "• **الفرق العلمي:** **المضادات الحيوية (Antibiotics)** تستهدف العدوى **البكتيرية** فقط (مثل التهاب اللوز البكتيري أو عدوى المسالك)، بينما **مضادات الفيروسات (Antivirals)** تستهدف الفيروسات المحددة؛ لذلك لا تعالج المضادات الحيوية نزلات البرد أو الإنفلونزا الفيروسية.\n"
                    . "• **إرشادات واحتياطات هامة:** يجب عدم تناول المضادات الحيوية إلا بوصفة طبية، وإكمال مدة العلاج المقررة بالكامل لمنع مقاومة البكتيريا، والفصل بمدة **ساعتين** عن منتجات الكالسيوم والحديد ومضادات الحموضة لبعض الفئات الدوائية.",
                'en' => "🛡️ **Antibiotics vs. Antivirals & Safe Usage Precautions:**\n"
                    . "• **Direct Explanation:** **Antibiotics** (e.g., Amoxicillin/Clavulanate, Azithromycin) treat **bacterial** infections by killing or inhibiting bacteria, whereas **Antivirals** target specific **viral** replication. Antibiotics are ineffective against viral illnesses like the common cold or flu.\n"
                    . "• **Important Precautions:** Use antibiotics strictly when prescribed by a licensed clinician, complete the full prescribed course to prevent antimicrobial resistance, report any rash or allergic history (e.g., penicillin allergy), and space certain antibiotics at least **2 hours** apart from calcium, iron, or antacids.",
                'ref' => $hasWho ? [
                    'source_name' => 'World Health Organization (WHO)',
                    'title' => 'Antimicrobial Resistance & Rational Antibiotic Use Fact Sheet',
                    'source_url' => 'https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance',
                    'source_type' => 'medical_organization',
                    'published_or_updated_at' => '2023-11',
                ] : null,
            ],

            // 4. Metformin & Diabetes / Insulin Storage
            [
                'ar_triggers' => ['ميتفورمين', 'جلوكوفاج', 'سيدوفاج', 'مقاومه الانسولين', 'السكري', 'انسولين', 'تخزين'],
                'en_triggers' => ['metformin', 'glucophage', 'insulin', 'diabetes', 'blood sugar'],
                'ar' => "🩸 **إرشادات دوائية عامة حول أدوية السكري (الميتفورمين والإنسولين):**\n"
                    . "• **الميتفورمين (Metformin):** يساعد على تحسين حساسية الجسم للإنسولين وخفض إنتاج الجلوكوز في الكبد؛ يُؤخذ مع الوجبات لتقليل اضطراب المعدة، ويُراعى فحص وظائف الكلى ومستوى فيتامين `B12` دورياً.\n"
                    . "• **حفظ الإنسولين:** تُحفظ العبوات غير المفتوحة في الثلاجة (`2–8°C`) بعيداً عن الفريزر، بينما يُحفظ القلم قيد الاستخدام في حرارة الغرفة المعتدلة (`أقل من 25–30°C`) لمدة تصل إلى 28 يوماً.",
                'en' => "🩸 **General Medication Information — Diabetes Care (Metformin & Insulin Storage):**\n"
                    . "• **Metformin:** Improves insulin sensitivity and lowers hepatic glucose production in type 2 diabetes. Taking it with meals reduces gastrointestinal side effects; periodic kidney function and Vitamin `B12` monitoring are recommended.\n"
                    . "• **Insulin Storage:** Store unopened pens/vials in a refrigerator (`2–8°C`, never freeze). In-use pens can typically remain at controlled room temperature (`below 25–30°C`) away from direct heat/sunlight for up to 28 days.",
                'ref' => $hasMedline ? [
                    'source_name' => 'NIH MedlinePlus Drug Information',
                    'title' => 'Metformin — Patient Medication Guide',
                    'source_url' => 'https://medlineplus.gov/druginfo/meds/a696005.html',
                    'source_type' => 'medical_organization',
                    'published_or_updated_at' => '2024-03',
                ] : null,
            ],

            // 5. Hypertension / Beta-blockers / Concor / Bisoprolol
            [
                'ar_triggers' => ['ضغط', 'كونكور', 'بيسوبرولول', 'قلب', 'كوليسترول'],
                'en_triggers' => ['bisoprolol', 'concor', 'hypertension', 'blood pressure', 'beta blocker', 'cholesterol'],
                'ar' => "❤️ **معلومات عامة عن أدوية ضغط الدم والقلب (مثل بيسوبرولول / كونكور):**\n"
                    . "• **الاستخدام العام:** تُستخدم لضبط ضغط الدم المرتفع وحماية عضلة القلب وتنظيم النبض تحت إشراف طبي.\n"
                    . "• **تحذير هام:** لا يجوز إيقاف حاصرات بيتا أو أدوية الضغط فجأة دون مراجعة الطبيب لتجنب الارتفاع الارتدادي الحاد في الضغط أو النبض، كما يجب تجنب أدوية البرد المحتوية على مضادات احتقان فموية.",
                'en' => "❤️ **General Information — Blood Pressure & Beta-Blocker Medications (e.g., Bisoprolol):**\n"
                    . "• **General Uses:** Prescribed to manage hypertension, angina, and certain heart rhythm or heart failure conditions.\n"
                    . "• **Important Precautions:** Never stop blood pressure or beta-blocker therapy abruptly without consulting your physician, as sudden withdrawal can trigger rebound tachycardia or blood pressure spikes. Avoid oral decongestants unless cleared by your doctor.",
                'ref' => $hasMedline ? [
                    'source_name' => 'NIH MedlinePlus Drug Information',
                    'title' => 'Bisoprolol — Drug Information & Precautions',
                    'source_url' => 'https://medlineplus.gov/druginfo/meds/a693024.html',
                    'source_type' => 'medical_organization',
                    'published_or_updated_at' => '2023-09',
                ] : null,
            ],

            // 6. Acid Reflux / Omeprazole / Famotidine / GI
            [
                'ar_triggers' => ['حموضه', 'ارتجاع', 'معده', 'قرحه', 'قولون', 'اوميبرازول', 'نيكسيوم', 'انتودين', 'فاموتيدين'],
                'en_triggers' => ['omeprazole', 'esomeprazole', 'famotidine', 'antodine', 'acid reflux', 'gerd', 'heartburn', 'ulcer'],
                'ar' => "🌿 **معلومات عامة عن أدوية الحموضة وارتجاع المريء (Omeprazole / Famotidine):**\n"
                    . "• **طريقة الاستخدام العامة:** مثبطات مضخة البروتون (مثل أوميبرازول) تكون أكثر فعالية عند تناولها **قبل الوجبة بـ 30 دقيقة**، بينما تعمل حاصرات `H2` (مثل فاموتيدين / أنتودين) على تقليل إفراز الحمض سريعاً.\n"
                    . "• **احتياطات:** تجنب الاستلقاء خلال 2–3 ساعات بعد الطعام، وراجع الطبيب في حال صعوبة البلع، القيء المستمر، أو فقدان الوزن غير المبرر.",
                'en' => "🌿 **General Information — Acid-Reducing Medications (Omeprazole / Famotidine):**\n"
                    . "• **General Usage:** Proton pump inhibitors (e.g., Omeprazole) work best when taken **30 minutes before a meal**, while H2 blockers (e.g., Famotidine) reduce stomach acid production for heartburn and ulcer relief.\n"
                    . "• **Precautions:** Avoid lying down within 2–3 hours after meals. Seek medical evaluation if you experience difficulty swallowing, persistent vomiting, black stools, or unexplained weight loss.",
                'ref' => $hasMedline ? [
                    'source_name' => 'NIH MedlinePlus Drug Information',
                    'title' => 'Omeprazole — Drug Information',
                    'source_url' => 'https://medlineplus.gov/druginfo/meds/a693050.html',
                    'source_type' => 'medical_organization',
                    'published_or_updated_at' => '2024-01',
                ] : null,
            ],

            // 7. Vitamins (D, B12, C, Omega-3, Iron)
            [
                'ar_triggers' => ['فيتامين د', 'فيتامين ب12', 'فيتامين ب 12', 'اوميجا 3', 'اوميغا 3', 'فيتامين سي', 'نقص الحديد', 'انيميا'],
                'en_triggers' => ['vitamin d', 'vitamin b12', 'omega 3', 'omega-3', 'vitamin c', 'iron deficiency', 'anemia'],
                'ar' => "☀️ **معلومات عامة عن الفيتامينات والمكملات الغذائية:**\n"
                    . "• **الفيتامينات الذائبة في الدهون (مثل فيتامين د / Vitamin D وأوميجا 3):** ضرورية لصحة العظام والمناعة والقلب، ويُفضّل تناولها مع وجبة رئيسية تحتوي على دهون صحية لتحسين الامتصاص.\n"
                    . "• **الحديد وفيتامين C:** يُحسّن فيتامين `C` امتصاص الحديد، بينما يُقلل الشاي والقهوة ومنتجات الألبان امتصاصه لذا يُفصل بينها بساعتين.\n"
                    . "• **احتياطات:** تجنب الجرعات العالية من المكملات دون إجراء التحاليل المعملية ومراجعة الطبيب أو الصيدلي.",
                'en' => "☀️ **General Information — Vitamins & Nutritional Supplements:**\n"
                    . "• **Fat-Soluble Supplements (Vitamin D, Omega-3):** Best absorbed when taken alongside a meal containing healthy fats.\n"
                    . "• **Iron & Vitamin C:** Vitamin C enhances iron absorption, whereas tea, coffee, and calcium/dairy can reduce absorption and should be spaced at least 2 hours apart.\n"
                    . "• **Precautions:** Confirm deficiencies via lab testing before taking high-dose supplements, and inform your doctor if you take blood thinners or thyroid medications.",
                'ref' => $hasMedline ? [
                    'source_name' => 'NIH Office of Dietary Supplements / MedlinePlus',
                    'title' => 'Vitamins and Minerals — Patient Health Reference',
                    'source_url' => 'https://medlineplus.gov/vitamins.html',
                    'source_type' => 'medical_organization',
                    'published_or_updated_at' => '2024-04',
                ] : null,
            ],

            // 8. Cold, Flu, Cough, Headache & General Medication Precautions
            [
                'ar_triggers' => ['برد', 'انفلونزا', 'رشح', 'زكام', 'كحه', 'سعال', 'حراره', 'صداع', 'احتياطات قبل تناول', 'كونجستال'],
                'en_triggers' => ['cold', 'flu', 'cough', 'runny nose', 'fever', 'headache', 'precautions before taking', 'before taking a medication'],
                'ar' => "🌡️ **الإرشادات الطبية العامة والاحتياطات الدوائية الأساسية:**\n"
                    . "• **التعامل مع الأعراض الشائعة (البرد والصداع):** الراحة، شرب السوائل بكثرة، محلول الملح للأنف، واستخدام خافضات الحرارة المناسبة.\n"
                    . "• **أهم الاحتياطات قبل تناول أي دواء:** التحقق من المادة الفعالة لمنع تكرار الجرعة، إبلاغ الطبيب أو الصيدلي بأي حساسية دوائية أو أمراض مزمنة (الضغط، الكبد، الكلى، السكري) أو حمل ورضاعة، ومراجعة التداخلات مع أدويتك الحالية.",
                'en' => "🌡️ **General Clinical Guidance & Essential Medication Precautions:**\n"
                    . "• **Symptom Relief (Cold, Fever, Headache):** Prioritize hydration, rest, saline nasal sprays, and appropriate single-ingredient symptom relief when needed.\n"
                    . "• **Key Precautions Before Taking Any Medication:** Always check the active ingredient to avoid duplicate dosing, disclose allergies, pregnancy/breastfeeding status, kidney/liver or blood pressure conditions, and review potential drug-drug or food-drug interactions with your doctor or pharmacist.",
                'ref' => $hasGuidelines ? [
                    'source_name' => 'NIH MedlinePlus — Safe Medication Use',
                    'title' => 'Safe Medication Use & Drug Safety Precautions',
                    'source_url' => 'https://medlineplus.gov/ency/patientinstructions/000882.htm',
                    'source_type' => 'clinical_guideline',
                    'published_or_updated_at' => '2024-01',
                ] : null,
            ],
        ];

        foreach ($monographs as $m) {
            if ($this->matchesAny($normAr, $m['ar_triggers']) || $this->matchesAny($lowerEn, $m['en_triggers'])) {
                $sectionsAr[] = $m['ar'];
                $sectionsEn[] = $m['en'];
                if ($m['ref'] !== null) {
                    $references[] = $m['ref'];
                }
            }
        }

        return [
            'sections_ar' => $sectionsAr,
            'sections_en' => $sectionsEn,
            'references' => $references,
        ];
    }

    private function shouldQueryExternalSources(string $raw, string $normAr, string $lowerEn, bool $noCuratedMatch): bool
    {
        if ($noCuratedMatch) {
            return true;
        }

        foreach (array_keys(self::GENERAL_TOPIC_ALIASES) as $alias) {
            if (str_contains($normAr, $this->normalizeArabic($alias)) || str_contains($lowerEn, strtolower($alias))) {
                return true;
            }
        }

        $explicitKnowledgeTriggers = [
            'ما هو', 'ما هي', 'معلومات عن', 'فوائد', 'اضرار', 'اعراض جانبيه', 'استخدامات',
            'what is', 'side effects', 'used for', 'benefits of', 'explain',
        ];

        return $this->matchesAny($normAr, $explicitKnowledgeTriggers) || $this->matchesAny($lowerEn, $explicitKnowledgeTriggers);
    }

    /**
     * @param list<string> $extraTerms
     * @return array{title: string, summary: string, reference: array<string, string|null>}|null
     */
    private function lookupOpenFda(Client $client, string $question, array $extraTerms): ?array
    {
        $candidates = [];
        foreach ($extraTerms as $t) {
            if (preg_match('/([a-zA-Z][a-zA-Z0-9\-]{3,})/', $t, $m) === 1) {
                $candidates[] = strtolower($m[1]);
            }
        }

        $lower = strtolower($question);
        foreach (self::GENERAL_TOPIC_ALIASES as $alias => $canonical) {
            if (preg_match('/^[a-z\- ]+$/i', $canonical) === 1 && (str_contains($lower, strtolower($alias)) || str_contains($this->normalizeArabic($question), $this->normalizeArabic($alias)))) {
                $candidates[] = strtolower($canonical);
            }
        }

        if ($candidates === [] && preg_match_all('/\b([a-zA-Z]{4,})\b/', $question, $matches)) {
            $stopEn = ['what', 'when', 'where', 'which', 'have', 'this', 'that', 'with', 'from', 'your', 'used', 'side', 'effects', 'common', 'precautions', 'should', 'know', 'before', 'taking', 'medication', 'medicine', 'prescription', 'latest', 'explain', 'generally', 'difference', 'between', 'show', 'previous', 'discuss', 'doctor', 'about'];
            foreach ($matches[1] as $word) {
                $lw = strtolower($word);
                if (!in_array($lw, $stopEn, true)) {
                    $candidates[] = $lw;
                }
            }
        }

        $candidates = array_slice(array_values(array_unique($candidates)), 0, 2);
        if ($candidates === []) {
            return null;
        }

        foreach ($candidates as $term) {
            $cacheKey = 'ai_fda:v1:' . sha1($term);
            $cached = Cache::get($cacheKey);
            if (is_array($cached)) {
                return $cached;
            }

            try {
                $escaped = addslashes($term);
                $response = $client->get('https://api.fda.gov/drug/label.json', [
                    'timeout' => 4,
                    'connect_timeout' => 3,
                    'headers' => ['User-Agent' => self::HTTP_USER_AGENT],
                    'query' => [
                        'search' => "openfda.generic_name:\"{$escaped}\"+openfda.brand_name:\"{$escaped}\"",
                        'limit' => 1,
                    ],
                ]);

                $data = json_decode($response->getBody()->getContents(), true);
                $result = $data['results'][0] ?? null;
                if (!is_array($result)) {
                    continue;
                }

                $brand = $result['openfda']['brand_name'][0] ?? ucfirst($term);
                $generic = $result['openfda']['generic_name'][0] ?? '';
                $indications = trim((string) ($result['indications_and_usage'][0] ?? $result['purpose'][0] ?? ''));
                if ($indications === '') {
                    continue;
                }

                $effectiveRaw = (string) ($result['effective_time'] ?? '');
                $formattedDate = strlen($effectiveRaw) >= 8
                    ? substr($effectiveRaw, 0, 4) . '-' . substr($effectiveRaw, 4, 2) . '-' . substr($effectiveRaw, 6, 2)
                    : null;

                $title = $generic !== '' && strcasecmp((string) $brand, (string) $generic) !== 0
                    ? "{$brand} ({$generic})"
                    : (string) $brand;

                $payload = [
                    'title' => $title,
                    'summary' => $this->trimSentences($indications, 3, 520),
                    'reference' => [
                        'source_name' => 'U.S. Food and Drug Administration (OpenFDA)',
                        'title' => "Official FDA Drug Label — {$title}",
                        'source_url' => 'https://open.fda.gov/apis/drug/label/',
                        'source_type' => 'drug_authority',
                        'published_or_updated_at' => $formattedDate,
                    ],
                ];

                Cache::put($cacheKey, $payload, self::WEB_CACHE_TTL);
                return $payload;
            } catch (\Throwable $e) {
                Log::info('MedicalKnowledgeRetriever OpenFDA lookup skipped: ' . $e->getMessage());
            }
        }

        return null;
    }

    /**
     * @return array{title: string, summary: string, reference: array<string, string|null>}|null
     */
    private function lookupMediaWiki(Client $client, string $lang, string $question): ?array
    {
        $candidate = $this->extractPrimarySearchCandidate($question, $lang);
        if ($candidate === null) {
            return null;
        }

        $cacheKey = "ai_wiki_ref:v1:{$lang}:" . sha1(mb_strtolower($candidate, 'UTF-8'));
        $cached = Cache::get($cacheKey);
        if (is_array($cached)) {
            return $cached;
        }

        try {
            $response = $client->get("https://{$lang}.wikipedia.org/w/api.php", [
                'timeout' => 5,
                'connect_timeout' => 3,
                'headers' => [
                    'User-Agent' => self::HTTP_USER_AGENT,
                    'Accept' => 'application/json',
                ],
                'query' => [
                    'action' => 'query',
                    'generator' => 'search',
                    'gsrsearch' => $candidate,
                    'gsrlimit' => 3,
                    'prop' => 'extracts|info',
                    'inprop' => 'url',
                    'exintro' => 1,
                    'explaintext' => 1,
                    'exchars' => 950,
                    'utf8' => 1,
                    'format' => 'json',
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            $pages = $data['query']['pages'] ?? [];
            if (!is_array($pages) || $pages === []) {
                return null;
            }

            usort($pages, fn ($a, $b) => ((int) ($a['index'] ?? 99)) <=> ((int) ($b['index'] ?? 99)));

            foreach ($pages as $page) {
                $title = trim((string) ($page['title'] ?? ''));
                $extract = trim((string) ($page['extract'] ?? ''));
                $fullUrl = trim((string) ($page['fullurl'] ?? ''));
                $touched = trim((string) ($page['touched'] ?? ''));

                if ($title === '' || mb_strlen($extract, 'UTF-8') < 55) {
                    continue;
                }

                if (
                    str_contains($title, 'توضيح')
                    || str_contains($extract, 'قد يقصد من')
                    || str_contains($extract, 'may refer to:')
                    || !$this->isResultRelevant($candidate, $title, $extract)
                ) {
                    continue;
                }

                $updatedDate = $touched !== '' ? substr($touched, 0, 10) : null;
                $summary = $this->trimSentences($extract, 3, 560);

                $payload = [
                    'title' => $title,
                    'summary' => $summary,
                    'reference' => [
                        'source_name' => $lang === 'ar'
                            ? 'الموسوعة العلمية والطبية (Wikipedia Medical AR)'
                            : 'Medical & Pharmacology Reference (Wikipedia EN)',
                        'title' => $title,
                        'source_url' => $fullUrl !== '' ? $fullUrl : "https://{$lang}.wikipedia.org/wiki/" . rawurlencode(str_replace(' ', '_', $title)),
                        'source_type' => 'encyclopedia',
                        'published_or_updated_at' => $updatedDate,
                    ],
                ];

                Cache::put($cacheKey, $payload, self::WEB_CACHE_TTL);
                return $payload;
            }
        } catch (\Throwable $e) {
            Log::info("MedicalKnowledgeRetriever MediaWiki ({$lang}) lookup skipped: " . $e->getMessage());
        }

        return null;
    }

    private function extractPrimarySearchCandidate(string $question, string $lang): ?string
    {
        $normAr = $this->normalizeArabic($question);
        $lowerEn = mb_strtolower($question, 'UTF-8');

        foreach (self::GENERAL_TOPIC_ALIASES as $trigger => $canonical) {
            $isLatinCanonical = preg_match('/^[a-z0-9\- ]+$/i', $canonical) === 1;
            if (($lang === 'en' && $isLatinCanonical) || ($lang === 'ar' && !$isLatinCanonical)) {
                if (str_contains($normAr, $this->normalizeArabic($trigger)) || str_contains($lowerEn, strtolower($trigger))) {
                    return $canonical;
                }
            }
        }

        $cleaned = preg_replace('/[؟?!.,،؛:"\'«»()\[\]]/u', ' ', $question) ?? $question;
        $patterns = [
            '/^\s*(لو سمحت|من فضلك|ممكن|عايز اعرف|عاوز اعرف|كلمني عن|حدثني عن|اشرح لي|اديني معلومات عن|عندي|اشعر ب|أشعر ب|اعاني من|أعاني من)\s+/iu',
            '/^\s*(ما هو|ما هي|ما هم|ايه هو|إيه هو|ايه هي|إيه هي|يعني ايه|ما فوائد|فوائد|ما اضرار|أضرار|ما اعراض|أعراض|طرق علاج|علاج|استخدامات|الفرق بين)\s+/iu',
            '/^\s*(what is|what are|what are the common side effects of|what are the side effects of|tell me about|explain|benefits of|side effects of|uses of|precautions for)\s+/iu',
            '/^\s*(دواء|برشام|اقراص|أقراص|كبسولات|مرض|متلازمة|هرمون|تحليل|عن|the medication|the medicine|medication|medicine|hormone)\s+/iu',
        ];

        for ($i = 0; $i < 3; $i++) {
            foreach ($patterns as $p) {
                $cleaned = preg_replace($p, '', $cleaned) ?? $cleaned;
            }
        }

        $cleaned = preg_replace('/\s+(ومحتاج|وعايز|وهل متوفر|في الصيدلية|في صيدليتي|عندكم|للجسم|للانسان|للإنسان|used for|in my prescription).*$/iu', '', $cleaned) ?? $cleaned;
        $cleaned = trim(preg_replace('/\s+/u', ' ', $cleaned) ?? $cleaned);

        if (mb_strlen($cleaned, 'UTF-8') < 3 || mb_strlen($cleaned, 'UTF-8') > 65) {
            return null;
        }

        return $cleaned;
    }

    private function isResultRelevant(string $searchQuery, string $title, string $extract): bool
    {
        $normQuery = $this->normalizeArabic($searchQuery);
        $normTitle = $this->normalizeArabic($title);
        $normLead = $this->normalizeArabic(mb_substr($extract, 0, 180, 'UTF-8'));

        if ($normQuery === '' || $normTitle === '') {
            return false;
        }

        foreach (['تاريخ ', 'قائمه ', 'محافظه ', 'جمهوريه ', 'مباراه ', 'بطوله ', 'فيلم ', 'مسلسل ', 'روايه ', 'history of ', 'list of '] as $noisyPrefix) {
            if (str_starts_with($normTitle, $noisyPrefix) && !str_contains($normQuery, trim($noisyPrefix))) {
                return false;
            }
        }

        if (str_contains($normTitle, $normQuery) || str_contains($normQuery, $normTitle)) {
            return true;
        }

        $tokens = array_values(array_filter(preg_split('/\s+/u', $normQuery) ?: [], fn ($w) => mb_strlen($w, 'UTF-8') >= 3));
        foreach ($tokens as $token) {
            $stem = preg_replace('/^ال/u', '', $token) ?? $token;
            if (mb_strlen($stem, 'UTF-8') >= 3 && (str_contains($normTitle, $stem) || str_contains($normLead, $stem))) {
                return true;
            }
        }

        return false;
    }

    private function trimSentences(string $raw, int $maxSentences, int $maxChars): string
    {
        $text = preg_replace('/\s+/u', ' ', trim($raw)) ?? trim($raw);
        $sentences = preg_split('/(?<=[.؟!])\s+/u', $text) ?: [$text];
        $out = [];
        $len = 0;

        foreach ($sentences as $s) {
            $s = trim($s);
            if ($s === '') {
                continue;
            }
            $out[] = $s;
            $len += mb_strlen($s, 'UTF-8');
            if (count($out) >= $maxSentences || $len >= $maxChars) {
                break;
            }
        }

        return trim(implode(' ', $out));
    }

    /**
     * @param list<array<string, string|null>> $references
     * @return list<array{source_name: string, title: string, source_url: string, source_type: string, published_or_updated_at: string|null}>
     */
    private function deduplicateReferences(array $references): array
    {
        $seen = [];
        $result = [];

        foreach ($references as $ref) {
            $url = trim((string) ($ref['source_url'] ?? ''));
            $name = trim((string) ($ref['source_name'] ?? ''));
            if ($name === '' || $url === '') {
                continue;
            }
            $key = strtolower($url . '|' . ($ref['title'] ?? ''));
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $result[] = [
                'source_name' => $name,
                'title' => trim((string) ($ref['title'] ?? $name)),
                'source_url' => $url,
                'source_type' => trim((string) ($ref['source_type'] ?? 'medical_organization')),
                'published_or_updated_at' => $ref['published_or_updated_at'] ?? null,
            ];
        }

        return array_slice($result, 0, 4);
    }

    private function normalizeArabic(string $text): string
    {
        $lower = mb_strtolower($text, 'UTF-8');
        $cleaned = str_replace(['أ', 'إ', 'آ', 'ة', 'ى', 'ؤ', 'ئ', 'ـ'], ['ا', 'ا', 'ا', 'ه', 'ي', 'و', 'ي', ''], $lower);
        $cleaned = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $cleaned) ?? $cleaned;
        return trim(preg_replace('/\s+/u', ' ', $cleaned) ?? $cleaned);
    }

    /**
     * @param list<string> $phrases
     */
    private function matchesAny(string $haystack, array $phrases): bool
    {
        foreach ($phrases as $p) {
            if ($p !== '' && mb_strpos($haystack, $p, 0, 'UTF-8') !== false) {
                return true;
            }
        }
        return false;
    }
}
