<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AiConfiguration;
use App\Models\AiRequestLog;
use App\Models\Doctor;
use App\Models\Medicien;
use App\Models\User;
use App\Services\AI\AIQuestionClassifier;
use App\Services\AI\AuthorizedPatientDataService;
use App\Services\AI\MedicalKnowledgeRetriever;
use GuzzleHttp\Client;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class AIChatService
{
    private const CACHE_TTL_SECONDS = 600;
    private const HTTP_USER_AGENT = 'SaydaletyHealthcareAssistant/2.0 (https://github.com/a7med-ma7moud-7/MY_pharmacy; support@saydalety.local) GuzzleHttp/7';

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

    private const GROQ_MODELS = [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
    ];

    private const STOP_WORDS = [
        'ما', 'هي', 'هو', 'هم', 'هل', 'في', 'من', 'عن', 'على', 'إلى', 'الى', 'او', 'أو',
        'مع', 'عند', 'عندي', 'اشعر', 'أشعر', 'اعاني', 'أعاني', 'حاسس', 'كل', 'كم', 'كيف',
        'متى', 'لماذا', 'ليه', 'ايه', 'إيه', 'اي', 'أي', 'عايز', 'عاوز', 'محتاج', 'اريد',
        'أريد', 'ممكن', 'لو', 'سمحت', 'علاج', 'دواء', 'ادوية', 'أدوية', 'افضل', 'أفضل',
        'احسن', 'أحسن', 'طريقة', 'طريقه', 'نصائح', 'سعر', 'بكام', 'متوفر', 'موجود', 'عندكم',
        'صيدلية', 'صيدليتي', 'اليوم', 'يوميا', 'يومياً', 'فوائد', 'اضرار', 'أضرار', 'اعراض',
        'أعراض', 'اسباب', 'أسباب', 'استخدامات', 'استعمال', 'معلومات', 'تفاصيل', 'شرح', 'اشرح',
        'كلمني', 'حدثني', 'جسم', 'الجسم', 'انسان', 'الإنسان', 'دكتور', 'طبيب', 'هرمون',
        'what', 'is', 'are', 'the', 'for', 'used', 'side', 'effects', 'of', 'my', 'in', 'show', 'me',
    ];

    private readonly AIQuestionClassifier $classifier;
    private readonly AuthorizedPatientDataService $patientDataService;
    private readonly MedicalKnowledgeRetriever $knowledgeRetriever;

    public function __construct(
        ?AIQuestionClassifier $classifier = null,
        ?AuthorizedPatientDataService $patientDataService = null,
        ?MedicalKnowledgeRetriever $knowledgeRetriever = null
    ) {
        $this->classifier = $classifier ?? app(AIQuestionClassifier::class);
        $this->patientDataService = $patientDataService ?? app(AuthorizedPatientDataService::class);
        $this->knowledgeRetriever = $knowledgeRetriever ?? app(MedicalKnowledgeRetriever::class);
    }

    /**
     * واجهة مختصرة متوافقة مع الاستدعاءات السابقة
     */
    public function ask(string $question): string
    {
        return $this->askWithContext($question)['answer'];
    }

    /**
     * معالجة متكاملة لسؤال المستخدم: تصنيف تلقائي (General / Internal / Combined) + صلاحيات صارمة + مراجع موثقة + سياق محادثة
     *
     * @param array<int, array{sender: string, text: string, retrieval_mode?: string|null}> $conversationHistory
     * @return array{
     *   answer: string,
     *   language: 'ar'|'en',
     *   classification: string,
     *   retrieval_mode: string,
     *   references: array<int, array<string, mixed>>,
     *   suggestions: array{medicines: array<int, array<string, mixed>>, doctors: array<int, array<string, mixed>>},
     *   expert_assistance: array{recommended: bool, reason: string|null, find_doctor_url: string, find_pharmacy_url: string},
     *   guest_restricted: bool,
     *   unauthorized_blocked: bool,
     *   is_emergency: bool,
     *   response_time_ms: int,
     *   provider_used: string
     * }
     */
    public function askWithContext(
        string $question,
        ?User $user = null,
        array $conversationHistory = [],
        ?int $chatId = null
    ): array {
        $startedAt = microtime(true);
        $normalizedQuestion = trim(preg_replace('/\s+/u', ' ', $question) ?? $question);

        if (!AiConfiguration::getBool('ai_enabled', true)) {
            $lang = $this->classifier->detectLanguage($normalizedQuestion, $conversationHistory);
            $msg = $lang === 'en'
                ? 'The AI Pharmacist assistant is temporarily disabled by platform administration. You can still browse our Doctors and Pharmacy directories directly.'
                : 'خدمة الصيدلي الذكي متوقفة مؤقتاً من قِبل إدارة المنصة. يمكنك تصفح دليل الأطباء أو صيدلية الأدوية مباشرة.';
            return $this->finalizeResponse(
                answer: $msg,
                language: $lang,
                classification: 'disabled',
                retrievalMode: 'fallback',
                topicCategory: 'system',
                references: [],
                suggestions: ['medicines' => [], 'doctors' => []],
                expertRecommended: true,
                expertReason: 'service_disabled',
                guestRestricted: false,
                unauthorizedBlocked: false,
                isEmergency: false,
                providerUsed: 'system',
                startedAt: $startedAt,
                user: $user,
                chatId: $chatId
            );
        }

        if ($normalizedQuestion === '') {
            return $this->finalizeResponse(
                answer: $this->buildWelcomeGuide('ar'),
                language: 'ar',
                classification: 'general',
                retrievalMode: 'general',
                topicCategory: 'greeting',
                references: [],
                suggestions: ['medicines' => [], 'doctors' => []],
                expertRecommended: false,
                expertReason: null,
                guestRestricted: false,
                unauthorizedBlocked: false,
                isEmergency: false,
                providerUsed: 'hybrid_engine',
                startedAt: $startedAt,
                user: $user,
                chatId: $chatId,
                skipLog: true
            );
        }

        // 1. التصنيف الذكي التلقائي وفحص الأمان والطوارئ
        $classified = $this->classifier->classify($normalizedQuestion, $user, $conversationHistory);
        $lang = $classified['language'];
        $category = $classified['category'];
        $topicCategory = $classified['topic_category'];

        // فحص اللغات المدعومة في الإعدادات
        $supportedLangs = array_map('trim', explode(',', strtolower(AiConfiguration::getString('supported_languages', 'ar,en'))));
        if (!in_array($lang, $supportedLangs, true)) {
            $lang = in_array('ar', $supportedLangs, true) ? 'ar' : 'en';
        }

        // 2. رفض فوري لأي محاولة وصول لبيانات مريض آخر أو اختراق الأوامر (BR-06 / Scenario 6)
        if ($category === 'unauthorized') {
            $this->logSecurityAudit($user, (string) $classified['security_reason']);
            $denialMsg = $lang === 'en'
                ? '🔒 **Access Denied:** For strict healthcare privacy and security, you are only authorized to access your own account records. I cannot retrieve or display information belonging to any other patient.'
                : '🔒 **غير مصرح بالوصول:** حفاظاً على سرية البيانات الطبية وخصوصية المرضى، لا يُسمح بالوصول إلا إلى سجلات حسابك الشخصي فقط، ولا يمكن عرض أي بيانات تخص مريضاً أو مستخدماً آخر.';

            return $this->finalizeResponse(
                answer: $denialMsg,
                language: $lang,
                classification: 'unauthorized',
                retrievalMode: 'restricted',
                topicCategory: 'security',
                references: [],
                suggestions: ['medicines' => [], 'doctors' => []],
                expertRecommended: false,
                expertReason: null,
                guestRestricted: false,
                unauthorizedBlocked: true,
                isEmergency: false,
                providerUsed: 'security_guard',
                startedAt: $startedAt,
                user: $user,
                chatId: $chatId,
                logStatus: 'blocked',
                errorType: (string) ($classified['security_reason'] ?? 'unauthorized_access'),
                errorMessage: 'Blocked unauthorized cross-patient or prompt-injection request.'
            );
        }

        // 3. التعامل الفوري مع الحالات الطبية الطارئة عالية الخطورة (Section 5: High-Risk Questions)
        if ($category === 'emergency') {
            $emergencyMsg = $this->buildEmergencyResponse($lang, (string) $classified['emergency_type']);
            return $this->finalizeResponse(
                answer: $emergencyMsg,
                language: $lang,
                classification: 'emergency',
                retrievalMode: 'emergency',
                topicCategory: 'emergency',
                references: [],
                suggestions: ['medicines' => [], 'doctors' => []],
                expertRecommended: true,
                expertReason: 'urgent_medical_attention',
                guestRestricted: false,
                unauthorizedBlocked: false,
                isEmergency: true,
                providerUsed: 'safety_triage',
                startedAt: $startedAt,
                user: $user,
                chatId: $chatId
            );
        }

        // 4. التعامل مع الأسئلة الغامضة جداً بطلب التوضيح اللطيف
        if ($category === 'ambiguous') {
            $clarifyMsg = $lang === 'en'
                ? "Could you please clarify your question so I can assist you accurately?\n• For **general medical information**, mention the medication name, symptom, or health topic.\n• For **your personal records** (logged-in users), specify whether you are asking about your prescriptions, upcoming appointments, or medicine orders."
                : "يرجى توضيح سؤالك قليلاً حتى أتمكن من مساعدتك بدقة:\n• **للمعلومات الطبية والدوائية العامة:** اذكر اسم الدواء أو العرض الصحي أو سؤالك الطبي.\n• **لسجلات حسابك الشخصي** (للمستخدمين المسجلين): حدد ما إذا كنت تستفسر عن روشتاتك الطبية، مواعيدك القادمة، أو طلبات الأدوية الخاصة بك.";

            return $this->finalizeResponse(
                answer: $clarifyMsg,
                language: $lang,
                classification: 'ambiguous',
                retrievalMode: 'fallback',
                topicCategory: 'clarification',
                references: [],
                suggestions: ['medicines' => [], 'doctors' => []],
                expertRecommended: false,
                expertReason: null,
                guestRestricted: false,
                unauthorizedBlocked: false,
                isEmergency: false,
                providerUsed: 'hybrid_engine',
                startedAt: $startedAt,
                user: $user,
                chatId: $chatId
            );
        }

        // 5. الترحيب
        if ($this->isGreetingQuestion($normalizedQuestion)) {
            return $this->finalizeResponse(
                answer: $this->buildWelcomeGuide($lang, $user !== null),
                language: $lang,
                classification: 'general',
                retrievalMode: 'general',
                topicCategory: 'greeting',
                references: [],
                suggestions: ['medicines' => [], 'doctors' => []],
                expertRecommended: false,
                expertReason: null,
                guestRestricted: false,
                unauthorizedBlocked: false,
                isEmergency: false,
                providerUsed: 'hybrid_engine',
                startedAt: $startedAt,
                user: $user,
                chatId: $chatId
            );
        }

        // 6. تطبيق قيود الزوار (Guest Restrictions — BR-01, BR-02, Scenario 2) قبل أي استعلام داخلي!
        if (in_array($category, ['internal', 'combined'], true)) {
            if ($user === null) {
                $guestMsg = $lang === 'en'
                    ? "🔐 **Login Required for Personal Records:**\nYou are currently using the AI Pharmacist as a **Guest**. Guests cannot access personal prescriptions, appointments, medical history, or private account data.\n\n• **Recommended Next Step:** Please **Sign In** to your Saydalety account to access your authorized medical records, or feel free to ask me any **general medical or medication question** right here."
                    : "🔐 **يلزم تسجيل الدخول للوصول إلى السجلات الشخصية:**\nأنت تستخدم الصيدلي الذكي حالياً في **وضع الزائر (Guest)**. لا يمكن للزوار الوصول إلى الروشتات الطبية، المواعيد المحجوزة، السجل الطبي، أو بيانات الحساب الخاصة.\n\n• **الخطوة المقترحة:** يرجى **تسجيل الدخول** إلى حسابك في منصة صيدليتي للاطلاع على سجلاتك المصرح بها، أو يمكنك طرح أي **سؤال طبي أو دوائي عام** وسأجيبك فوراً.";

                return $this->finalizeResponse(
                    answer: $guestMsg,
                    language: $lang,
                    classification: $category,
                    retrievalMode: 'restricted',
                    topicCategory: $topicCategory,
                    references: [],
                    suggestions: ['medicines' => [], 'doctors' => []],
                    expertRecommended: false,
                    expertReason: null,
                    guestRestricted: true,
                    unauthorizedBlocked: false,
                    isEmergency: false,
                    providerUsed: 'auth_guard',
                    startedAt: $startedAt,
                    user: null,
                    chatId: null
                );
            }

            if (!AiConfiguration::getBool('internal_data_enabled', true)) {
                $disabledInternalMsg = $lang === 'en'
                    ? 'Personal record retrieval is currently disabled in AI settings. Please view your appointments and prescriptions directly from your account pages.'
                    : 'استرجاع البيانات الشخصية عبر المساعد الذكي متوقف حالياً في إعدادات النظام. يمكنك مراجعة مواعيدك وروشتاتك مباشرةً من صفحات حسابك.';

                return $this->finalizeResponse(
                    answer: $disabledInternalMsg,
                    language: $lang,
                    classification: $category,
                    retrievalMode: 'fallback',
                    topicCategory: $topicCategory,
                    references: [],
                    suggestions: ['medicines' => [], 'doctors' => []],
                    expertRecommended: false,
                    expertReason: null,
                    guestRestricted: false,
                    unauthorizedBlocked: false,
                    isEmergency: false,
                    providerUsed: 'system',
                    startedAt: $startedAt,
                    user: $user,
                    chatId: $chatId
                );
            }

            if ($category === 'combined' && !AiConfiguration::getBool('combined_retrieval_enabled', true)) {
                $category = 'internal';
            }
        }

        // 7. استرجاع البيانات الشخصية المصرح بها (فقط لـ internal أو combined وللمستخدم المسجل حصراً!)
        $patientData = null;
        $extractedMedications = [];
        if (in_array($category, ['internal', 'combined'], true) && $user !== null) {
            try {
                $patientData = $this->patientDataService->retrieve($user, $classified['internal_scopes']);
                $extractedMedications = $patientData['extracted_medications'];
            } catch (\Throwable $e) {
                Log::error('AIChatService internal data error: ' . $e->getMessage());
                $errMsg = $lang === 'en'
                    ? 'We encountered a temporary issue retrieving your account records. Please try again shortly.'
                    : 'حدث خطأ مؤقت أثناء استرجاع سجلات حسابك. يرجى المحاولة مرة أخرى بعد لحظات.';
                return $this->finalizeResponse(
                    answer: $errMsg,
                    language: $lang,
                    classification: $category,
                    retrievalMode: 'fallback',
                    topicCategory: $topicCategory,
                    references: [],
                    suggestions: ['medicines' => [], 'doctors' => []],
                    expertRecommended: false,
                    expertReason: null,
                    guestRestricted: false,
                    unauthorizedBlocked: false,
                    isEmergency: false,
                    providerUsed: 'hybrid_engine',
                    startedAt: $startedAt,
                    user: $user,
                    chatId: $chatId,
                    logStatus: 'failed',
                    errorType: 'internal_data_error',
                    errorMessage: 'Failed retrieving authorized internal patient records.'
                );
            }
        }

        // 8. البحث في دليل الأدوية والأطباء العام في المنصة عند الملاءمة
        $searchSeed = trim($normalizedQuestion . ($classified['follow_up_topic'] ? ' ' . $classified['follow_up_topic'] : '') . ($extractedMedications !== [] ? ' ' . implode(' ', $extractedMedications) : ''));
        $matchingMedicines = $category === 'internal' && !in_array('prescriptions', $classified['internal_scopes'], true)
            ? collect()
            : $this->findRelevantMedicines($searchSeed);
        $matchingDoctors = $this->findRelevantDoctors($searchSeed);
        $suggestions = $this->formatSuggestions($matchingMedicines, $matchingDoctors);

        // 9. استرجاع المعرفة الطبية العامة والمراجع الموثقة (فقط لـ general أو combined)
        $client = new Client([
            'timeout' => 12,
            'connect_timeout' => 5,
            'verify' => $this->resolveSslVerifyOption(),
            'headers' => ['User-Agent' => self::HTTP_USER_AGENT],
        ]);

        $generalKnowledge = [
            'sections_ar' => [],
            'sections_en' => [],
            'references' => [],
            'has_confident_match' => false,
        ];

        if (in_array($category, ['general', 'combined'], true)) {
            $knowledgeQuery = $normalizedQuestion;
            if ($classified['follow_up_topic'] !== null && !str_contains($normalizedQuestion, $classified['follow_up_topic'])) {
                $knowledgeQuery = $classified['follow_up_topic'] . ' — ' . $normalizedQuestion;
            }
            $generalKnowledge = $this->knowledgeRetriever->retrieve(
                $client,
                $knowledgeQuery,
                $lang,
                $extractedMedications
            );
        }

        // 10. توليد الإجابة النهائية (عبر المزود الخارجي النشط إن توفر مفتاح صالح، أو عبر المحرك الإكلينيكي المهيكل ثنائي اللغة)
        $providerUsed = 'hybrid_engine';
        $finalAnswer = null;

        $canUseStatelessCache = $category === 'general' && $conversationHistory === [];
        $cacheKey = 'ai_chat:v5:' . $lang . ':' . sha1(mb_strtolower($normalizedQuestion, 'UTF-8'));

        if ($canUseStatelessCache) {
            $cachedBundle = Cache::get($cacheKey);
            if (is_array($cachedBundle) && !empty($cachedBundle['answer'])) {
                return $this->finalizeResponse(
                    answer: (string) $cachedBundle['answer'],
                    language: $lang,
                    classification: $category,
                    retrievalMode: $category,
                    topicCategory: $topicCategory,
                    references: $cachedBundle['references'] ?? $generalKnowledge['references'],
                    suggestions: $suggestions,
                    expertRecommended: (bool) ($cachedBundle['expert_recommended'] ?? false),
                    expertReason: $cachedBundle['expert_reason'] ?? null,
                    guestRestricted: false,
                    unauthorizedBlocked: false,
                    isEmergency: false,
                    providerUsed: (string) ($cachedBundle['provider_used'] ?? 'hybrid_engine'),
                    startedAt: $startedAt,
                    user: $user,
                    chatId: $chatId
                );
            }
        }

        $activeProviderPref = strtolower(AiConfiguration::getString('active_provider', 'auto'));
        if ($activeProviderPref !== 'hybrid_local') {
            $llmResult = $this->tryConfiguredExternalProviders(
                $client,
                $activeProviderPref,
                $normalizedQuestion,
                $lang,
                $category,
                $patientData,
                $generalKnowledge,
                $matchingMedicines,
                $matchingDoctors,
                $conversationHistory
            );
            if ($llmResult !== null) {
                $finalAnswer = $llmResult['answer'];
                $providerUsed = $llmResult['provider'];
            }
        }

        $expertRecommended = false;
        $expertReason = null;

        if ($finalAnswer === null) {
            $synthesized = $this->synthesizeStructuredAnswer(
                question: $normalizedQuestion,
                lang: $lang,
                category: $category,
                patientData: $patientData,
                generalKnowledge: $generalKnowledge,
                medicines: $matchingMedicines,
                doctors: $matchingDoctors
            );
            $finalAnswer = $synthesized['answer'];
            $expertRecommended = $synthesized['expert_recommended'];
            $expertReason = $synthesized['expert_reason'];
        } else {
            // Recommend expert assistance on combined/clinical symptom queries as well
            $expertRecommended = $category === 'combined' || $topicCategory === 'symptoms';
            $expertReason = $expertRecommended ? 'clinical_consultation' : null;
        }

        if ($canUseStatelessCache && $finalAnswer !== '') {
            Cache::put($cacheKey, [
                'answer' => $finalAnswer,
                'references' => $generalKnowledge['references'],
                'expert_recommended' => $expertRecommended,
                'expert_reason' => $expertReason,
                'provider_used' => $providerUsed,
            ], self::CACHE_TTL_SECONDS);
        }

        return $this->finalizeResponse(
            answer: $finalAnswer,
            language: $lang,
            classification: $category,
            retrievalMode: $category,
            topicCategory: $topicCategory,
            references: $generalKnowledge['references'],
            suggestions: $suggestions,
            expertRecommended: $expertRecommended,
            expertReason: $expertReason,
            guestRestricted: false,
            unauthorizedBlocked: false,
            isEmergency: false,
            providerUsed: $providerUsed,
            startedAt: $startedAt,
            user: $user,
            chatId: $chatId
        );
    }

    /**
     * بناء الإجابة المهيكلة ثنائية اللغة مع الفصل الصارم بين السجلات الشخصية والمعلومات العامة والملاحظات الوقائية
     *
     * @param array<string, mixed>|null $patientData
     * @param array<string, mixed> $generalKnowledge
     * @return array{answer: string, expert_recommended: bool, expert_reason: string|null}
     */
    private function synthesizeStructuredAnswer(
        string $question,
        string $lang,
        string $category,
        ?array $patientData,
        array $generalKnowledge,
        Collection $medicines,
        Collection $doctors
    ): array {
        $blocks = [];
        $expertRecommended = false;
        $expertReason = null;

        // الحالة 1: سؤال شخصي بحت (Internal Patient Data)
        if ($category === 'internal') {
            $summary = $lang === 'en'
                ? (string) ($patientData['summary_en'] ?? '')
                : (string) ($patientData['summary_ar'] ?? '');

            $hasAny = (bool) ($patientData['has_any_data'] ?? false);

            if ($lang === 'en') {
                $blocks[] = "🗂️ **Personal Account Information (Authorized Records):**\n"
                    . ($summary !== '' ? $summary : '• No matching healthcare records are currently available in your account.');

                if (!$hasAny) {
                    $blocks[] = "💡 **Recommended Next Step:**\n"
                        . "• This information is not available in your current account records. You can book a doctor consultation or browse our pharmacy directory below if you need medical assistance.";
                    $expertRecommended = true;
                    $expertReason = 'missing_internal_records';
                } else {
                    $blocks[] = "⚕️ **Note:** Please follow your treating physician's instructions and never alter a prescribed medication regimen without consulting your doctor.";
                }
            } else {
                $blocks[] = "🗂️ **بيانات حسابك الشخصي المصرح بها:**\n"
                    . ($summary !== '' ? $summary : '• لا تتوفر سجلات طبية مطابقة في حسابك حالياً.');

                if (!$hasAny) {
                    $blocks[] = "💡 **الخطوة المقترحة:**\n"
                        . "• هذه المعلومات غير متوفرة حالياً في سجلات حسابك. يمكنك حجز موعد مع طبيب مختص أو تصفح صيدلية المنصة أدناه عند الحاجة.";
                    $expertRecommended = true;
                    $expertReason = 'missing_internal_records';
                } else {
                    $blocks[] = "⚕️ **ملاحظة طبية:** يُرجى الالتزام بتعليمات طبيبك المعالج وعدم تعديل أو إيقاف أي دواء موصوف دون مراجعته.";
                }
            }

            return [
                'answer' => implode("\n\n", $blocks),
                'expert_recommended' => $expertRecommended,
                'expert_reason' => $expertReason,
            ];
        }

        // الحالة 2: استرجاع مدمج (Combined: Personal Records + General Medical Knowledge)
        if ($category === 'combined') {
            $personalSummary = $lang === 'en'
                ? (string) ($patientData['summary_en'] ?? '')
                : (string) ($patientData['summary_ar'] ?? '');
            $hasAnyPersonal = (bool) ($patientData['has_any_data'] ?? false);
            $genSections = $lang === 'en' ? $generalKnowledge['sections_en'] : $generalKnowledge['sections_ar'];

            if ($lang === 'en') {
                $blocks[] = "🗂️ **1. From Your Personal Account Records:**\n"
                    . ($personalSummary !== '' ? $personalSummary : '• No prescriptions or recorded medications were found in your current account records.');

                if ($genSections !== []) {
                    $blocks[] = "🌐 **2. General Medical & Medication Information:**\n" . implode("\n\n", $genSections);
                } elseif (!$hasAnyPersonal) {
                    $blocks[] = "🌐 **2. General Medical Guidance:**\n"
                        . "• Because there are no recorded prescriptions in your account yet, please share the specific medication name if you would like general pharmacological information and precautions about it.";
                } else {
                    $medList = implode(', ', $patientData['extracted_medications'] ?? []);
                    $blocks[] = "🌐 **2. General Medication Precautions" . ($medList !== '' ? " ({$medList})" : '') . ":**\n"
                        . "• Take prescribed medications at the exact schedule and dosage recorded by your physician.\n"
                        . "• Inform your doctor or pharmacist about any allergies, kidney/liver conditions, pregnancy, or other supplements/medications to avoid drug interactions.\n"
                        . "• Do not start, stop, or change your prescribed treatment independently.";
                }

                $blocks[] = "⚕️ **Recommended Next Step:**\n"
                    . "• Personal records above reflect what is stored in your Saydalety account, whereas the medical notes are for general educational reference only. Always discuss specific side effects or dose adjustments with your treating doctor.";
            } else {
                $blocks[] = "🗂️ **أولاً — من سجلات حسابك الشخصي:**\n"
                    . ($personalSummary !== '' ? $personalSummary : '• لا توجد روشتات أو أدوية مسجلة حالياً في حسابك الشخصي.');

                if ($genSections !== []) {
                    $blocks[] = "🌐 **ثانياً — المعلومات الطبية والدوائية العامة:**\n" . implode("\n\n", $genSections);
                } elseif (!$hasAnyPersonal) {
                    $blocks[] = "🌐 **ثانياً — الإرشاد الدوائي العام:**\n"
                        . "• نظراً لعدم وجود روشتات مسجلة في حسابك حالياً، يمكنك كتابة اسم الدواء الذي تود الاستفسار عنه وسأوضح لك استخداماته واحتياطاته العامة فوراً.";
                } else {
                    $medList = implode('، ', $patientData['extracted_medications'] ?? []);
                    $blocks[] = "🌐 **ثانياً — الاحتياطات الدوائية العامة" . ($medList !== '' ? " ({$medList})" : '') . ":**\n"
                        . "• التزم بالجرعة والمواعيد المحددة من قِبل طبيبك المعالج في الروشتة المسجلة.\n"
                        . "• أبلغ الطبيب أو الصيدلي بأي حساسية دوائية أو أدوية ومكملات أخرى تتناولها لتفادي التداخلات الدوائية.\n"
                        . "• لا تقم بإيقاف العلاج الموصوف أو تعديل جرعته من تلقاء نفسك دون استشارة الطبيب.";
                }

                $blocks[] = "⚕️ **الخطوة الموصى بها:**\n"
                    . "• البيانات في القسم الأول مستخرجة من حسابك الشخصي في صيدليتي، بينما المعلومات في القسم الثاني هي إرشادات علمية عامة للتوعية ولا تُعد تشخيصاً أو تعديلاً للوصفة الطبية.";
            }

            return [
                'answer' => implode("\n\n", $blocks),
                'expert_recommended' => true,
                'expert_reason' => 'combined_medication_review',
            ];
        }

        // الحالة 3: سؤال معرفي طبي أو دوائي عام (General Knowledge)
        $genSections = $lang === 'en' ? $generalKnowledge['sections_en'] : $generalKnowledge['sections_ar'];

        if ($genSections !== []) {
            foreach ($genSections as $sec) {
                $blocks[] = $sec;
            }
        }

        // دمج التطابقات الفعلية من متجر الأدوية ودليل الأطباء في المنصة إن وُجدت
        if ($medicines->isNotEmpty()) {
            if ($lang === 'en') {
                $medLines = ["🏥 **Matching Items in Saydalety Pharmacy:**"];
                foreach ($medicines as $med) {
                    $stock = (int) $med->count > 0 ? 'In Stock' : 'Out of Stock';
                    $medLines[] = "• **{$med->name}** ({$med->type}) — {$med->propose} | **{$med->price} EGP** ({$stock})";
                }
                $blocks[] = implode("\n", $medLines);
            } else {
                $medLines = ["🏥 **المتوفر في نظام صيدليتي (الأدوية ذات الصلة):**"];
                foreach ($medicines as $med) {
                    $stock = (int) $med->count > 0 ? 'متوفر بالمخزون' : 'غير متوفر حالياً';
                    $medLines[] = "• **{$med->name}** ({$med->type}) — {$med->propose} | السعر: **{$med->price} ج.م** ({$stock})";
                }
                $blocks[] = implode("\n", $medLines);
            }
        }

        if ($doctors->isNotEmpty()) {
            if ($lang === 'en') {
                $docLines = ["👨‍⚕️ **Specialists Available on Saydalety:**"];
                foreach ($doctors as $doc) {
                    $docLines[] = "• **Dr. {$doc->name}** — **{$doc->specialty}** | Fee: **{$doc->price} EGP** ({$doc->location})";
                }
                $blocks[] = implode("\n", $docLines);
            } else {
                $docLines = ["👨‍⚕️ **الأطباء المتاحون للحجز في منصة صيدليتي:**"];
                foreach ($doctors as $doc) {
                    $loc = trim(($doc->location ?? '') . ($doc->tow_location ? " - {$doc->tow_location}" : ''));
                    $docLines[] = "• **د. {$doc->name}** — تخصص **{$doc->specialty}** | الكشف: **{$doc->price} ج.م**" . ($loc !== '' ? " ({$loc})" : '');
                }
                $blocks[] = implode("\n", $docLines);
            }
        }

        // السيناريو 13: إذا لم تتوفر معلومات موثوقة كافية للإجابة بثقة، صرّح بوضوح بالحدود واقترح استشارة مختص!
        if ($blocks === []) {
            if ($lang === 'en') {
                $limitationAnswer = "ℹ️ **Information Limitation:**\n"
                    . "I cannot answer your question («{$question}») with sufficient clinical confidence from the currently verified medical references, and I do not guess or fabricate medical facts.\n\n"
                    . "💡 **Recommended Next Step:**\n"
                    . "• Try specifying the exact generic/brand medication name or medical term.\n"
                    . "• For personalized clinical evaluation or pharmacy guidance, please use **Find a Doctor** or **Find a Pharmacy** below.";
            } else {
                $limitationAnswer = "ℹ️ **حدود المعرفة المتاحة:**\n"
                    . "لا أستطيع الإجابة على هذا الاستفسار («{$question}») بدرجة ثقة علمية كافية من المصادر الطبية الموثقة المتاحة حالياً، ويلتزم المساعد بعدم تخمين أو اختلاق أي معلومات طبية.\n\n"
                    . "💡 **الخطوة الموصى بها:**\n"
                    . "• يمكنك إعادة صياغة السؤال بذكر **الاسم العلمي أو التجاري الدقيق للدواء** أو الحالة الصحية.\n"
                    . "• للحصول على تقييم طبي متخصص أو استشارة صيدلانية مباشرة، استخدم أزرار **ابحث عن طبيب** أو **تصفح الصيدلية** أدناه.";
            }

            return [
                'answer' => $limitationAnswer,
                'expert_recommended' => true,
                'expert_reason' => 'insufficient_confidence',
            ];
        }

        if ($lang === 'en') {
            $blocks[] = "⚕️ **Medical Safety Note:** This information is provided for general health and pharmaceutical education only and does not constitute a medical diagnosis or prescription. Consult a qualified physician or pharmacist before starting, stopping, or changing any medication.";
        } else {
            $blocks[] = "⚕️ **تنبيه صيدلاني:** هذه المعلومات مخصصة للتوعية الطبية والصيدلانية العامة ولا تُعد تشخيصاً طبياً مستقلاً أو وصفة علاجية، ولا تغني عن استشارة الطبيب أو الصيدلي المختص.";
        }

        return [
            'answer' => implode("\n\n", $blocks),
            'expert_recommended' => $doctors->isNotEmpty(),
            'expert_reason' => $doctors->isNotEmpty() ? 'specialist_available' : null,
        ];
    }

    private function buildEmergencyResponse(string $lang, string $emergencyType): string
    {
        if ($lang === 'en') {
            return "🚨 **URGENT MEDICAL ATTENTION REQUIRED:**\n"
                . "The symptoms or situation you described (**" . str_replace('_', ' ', $emergencyType) . "**) may represent a **serious medical emergency**.\n\n"
                . "• **Immediate Action:** Please contact local **Emergency Services (123)** immediately or go to the nearest hospital emergency department right now.\n"
                . "• If this involves a suspected medication overdose or poisoning, take the medication packaging with you to the emergency room and do not induce vomiting unless instructed by emergency personnel.\n"
                . "• *An AI assistant cannot manage medical emergencies — please seek immediate in-person emergency care.*";
        }

        return "🚨 **تنبيه طوارئ طبي عاجل:**\n"
            . "الأعراض أو الحالة التي وصفتها قد تشير إلى **حالة طبية طارئة وعالية الخطورة** تتطلب تدخلاً طبياً فورياً ولا ينبغي الانتظار عليها.\n\n"
            . "• **الإجراء الفوري:** يرجى الاتصال بـ **الإسعاف والطوارئ (123)** فوراً أو التوجه مباشرةً إلى أقرب قسم طوارئ في المستشفى.\n"
            . "• في حال الاشتباه بجرعة دوائية زائدة أو تسمم دوائي، اصطحب عبوة الدواء معك إلى قسم الطوارئ.\n"
            . "• *المساعد الذكي لا يمكنه إدارة الحالات الطارئة — سلامتك أولاً، يرجى طلب الرعاية الإسعافية العاجلة الآن.*";
    }

    private function buildWelcomeGuide(string $lang, bool $isAuthenticated = false): string
    {
        if ($lang === 'en') {
            return "Welcome to the **Saydalety AI Pharmacist Assistant** 🤖!\n\n"
                . "I can help you in both **Arabic and English** with:\n"
                . "• 🌐 **General Medical & Drug Knowledge:** Uses, precautions, side effects, interactions, and storage guidelines backed by medical references.\n"
                . ($isAuthenticated
                    ? "• 🗂️ **Your Personal Account Records:** Ask about your prescriptions, upcoming appointments, follow-ups, or medicine orders — or combine them with medication explanations."
                    : "• 🔐 **Personal Account Queries:** Sign in anytime to ask about your own prescriptions, appointments, and recorded medications.");
        }

        return "مرحباً بك في **المساعد الطبي والصيدلي الذكي لمنصة صيدليتي** 🤖!\n\n"
            . "يسعدني مساعدتك باللغتين **العربية والإنجليزية** في:\n"
            . "• 🌐 **المعرفة الطبية والدوائية العامة:** دواعي الاستعمال، الاحتياطات، الأعراض الجانبية، التداخلات الدوائية، والمراجع الطبية الموثقة.\n"
            . ($isAuthenticated
                ? "• 🗂️ **سجلات حسابك الشخصي:** اسألني عن روشتاتك الطبية، مواعيدك القادمة، متابعاتك، أو اشرح لك الأدوية المسجلة في وصفتك الطبية."
                : "• 🔐 **السجلات الطبية الشخصية:** سجل دخولك للاستفسار عن روشتاتك ومواعيدك وطلباتك الخاصة بأمان تام.");
    }

    /**
     * محاولة الاتصال بمزودي الذكاء الاصطناعي الخارجيين وفق إعدادات المشرف مع تمرير البيانات المصرح بها فقط
     *
     * @param array<string, mixed>|null $patientData
     * @param array<string, mixed> $generalKnowledge
     * @param array<int, array{sender: string, text: string}> $history
     * @return array{answer: string, provider: string}|null
     */
    private function tryConfiguredExternalProviders(
        Client $client,
        string $activeProviderPref,
        string $question,
        string $lang,
        string $category,
        ?array $patientData,
        array $generalKnowledge,
        Collection $medicines,
        Collection $doctors,
        array $history
    ): ?array {
        $systemPrompt = $this->buildExternalSystemPrompt($lang, $category, $patientData, $generalKnowledge, $medicines, $doctors);
        $maxTokens = max(250, min(AiConfiguration::getInt('max_response_tokens', 900), 2048));

        $providersToTry = match ($activeProviderPref) {
            'openrouter' => ['openrouter'],
            'groq' => ['groq'],
            'gemini' => ['gemini'],
            default => ['openrouter', 'groq', 'gemini'],
        };

        foreach ($providersToTry as $prov) {
            if ($prov === 'openrouter') {
                $key = config('openrouter.api_key');
                if ($this->isValidApiKey(is_string($key) ? $key : null)) {
                    $ans = $this->tryOpenAiCompatible($client, 'openrouter', 'https://openrouter.ai/api/v1/chat/completions', self::OPENROUTER_MODELS, (string) $key, $systemPrompt, $question, $history, $maxTokens);
                    if ($ans !== null) {
                        return ['answer' => $ans, 'provider' => 'openrouter'];
                    }
                }
            }

            if ($prov === 'groq') {
                $key = env('GROQ_API_KEY');
                if ($this->isValidApiKey(is_string($key) ? $key : null)) {
                    $ans = $this->tryOpenAiCompatible($client, 'groq', 'https://api.groq.com/openai/v1/chat/completions', self::GROQ_MODELS, (string) $key, $systemPrompt, $question, $history, $maxTokens);
                    if ($ans !== null) {
                        return ['answer' => $ans, 'provider' => 'groq'];
                    }
                }
            }

            if ($prov === 'gemini') {
                $geminiKeys = array_filter(
                    [config('gemini.api_key'), config('gemini.fallback_key')],
                    fn ($k) => $this->isValidApiKey(is_string($k) ? $k : null)
                );
                foreach ($geminiKeys as $gKey) {
                    $ans = $this->tryGemini($client, (string) $gKey, $systemPrompt, $question, $history, $maxTokens, $category === 'general');
                    if ($ans !== null) {
                        return ['answer' => $ans, 'provider' => 'gemini'];
                    }
                }
            }
        }

        return null;
    }

    /**
     * @param array<string, mixed>|null $patientData
     * @param array<string, mixed> $generalKnowledge
     */
    private function buildExternalSystemPrompt(
        string $lang,
        string $category,
        ?array $patientData,
        array $generalKnowledge,
        Collection $medicines,
        Collection $doctors
    ): string {
        $langInstruction = $lang === 'en'
            ? 'Respond clearly in English.'
            : 'أجب باللغة العربية الفصحى الواضحة والمنظمة.';

        $lines = [
            "You are the Saydalety (صيدليتي) AI Pharmacist healthcare assistant. {$langInstruction}",
            'Safety & Privacy Rules:',
            '- You are an informational assistant, NOT a replacement for a doctor or pharmacist.',
            '- Never provide an independent diagnosis or prescribe/start/stop/alter medication regimens.',
            '- Never invent prescriptions, appointments, diagnoses, medical history, or fake citations.',
            '- Clearly distinguish between General Medical Information and Authorized Personal Account Information.',
        ];

        if ($patientData !== null && ($patientData['authorized'] ?? false) === true) {
            $personalBlock = $lang === 'en' ? ($patientData['summary_en'] ?? '') : ($patientData['summary_ar'] ?? '');
            $lines[] = "Authorized Personal Records for Current User (retrieval_mode={$category}):\n" . ($personalBlock !== '' ? $personalBlock : 'None recorded.');
        }

        $genSections = $lang === 'en' ? ($generalKnowledge['sections_en'] ?? []) : ($generalKnowledge['sections_ar'] ?? []);
        if ($genSections !== []) {
            $lines[] = "Verified General Medical Reference Notes:\n" . implode("\n", $genSections);
        }

        $storeCtx = $this->formatDatabaseContext($medicines, $doctors);
        if ($storeCtx !== '') {
            $lines[] = "Saydalety Platform Directory Matches:\n" . $storeCtx;
        }

        return implode("\n\n", $lines);
    }

    /**
     * @param list<string> $models
     * @param array<int, array{sender: string, text: string}> $history
     */
    private function tryOpenAiCompatible(
        Client $client,
        string $providerName,
        string $endpoint,
        array $models,
        string $apiKey,
        string $systemPrompt,
        string $question,
        array $history,
        int $maxTokens
    ): ?string {
        $deadKeyFlag = 'ai_chat:dead_key:' . sha1($providerName . ':' . $apiKey);
        if (Cache::get($deadKeyFlag) === true) {
            return null;
        }

        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach (array_slice($history, -6) as $h) {
            if (!empty($h['text'])) {
                $messages[] = [
                    'role' => ($h['sender'] ?? 'user') === 'user' ? 'user' : 'assistant',
                    'content' => mb_substr((string) $h['text'], 0, 800, 'UTF-8'),
                ];
            }
        }
        $messages[] = ['role' => 'user', 'content' => $question];

        foreach ($models as $model) {
            try {
                $response = $client->post($endpoint, [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'model' => $model,
                        'max_tokens' => $maxTokens,
                        'messages' => $messages,
                    ],
                ]);

                $data = json_decode($response->getBody()->getContents(), true);
                $answer = trim((string) ($data['choices'][0]['message']['content'] ?? ''));
                if ($answer !== '') {
                    return $answer;
                }
            } catch (\Throwable $e) {
                Log::warning("AIChatService {$providerName} error ({$model}): " . $e->getMessage());
                $this->recordProviderFailureLog($providerName, $e->getMessage());
                if (in_array((int) $e->getCode(), [401, 403], true)) {
                    Cache::put($deadKeyFlag, true, 600);
                    return null;
                }
            }
        }

        return null;
    }

    /**
     * @param array<int, array{sender: string, text: string}> $history
     */
    private function tryGemini(
        Client $client,
        string $apiKey,
        string $systemPrompt,
        string $question,
        array $history,
        int $maxTokens,
        bool $enableSearchGrounding
    ): ?string {
        $deadKeyFlag = 'ai_chat:dead_key:' . sha1('gemini:' . $apiKey);
        if (Cache::get($deadKeyFlag) === true) {
            return null;
        }

        $contents = [];
        foreach (array_slice($history, -6) as $h) {
            if (!empty($h['text'])) {
                $contents[] = [
                    'role' => ($h['sender'] ?? 'user') === 'user' ? 'user' : 'model',
                    'parts' => [['text' => mb_substr((string) $h['text'], 0, 800, 'UTF-8')]],
                ];
            }
        }
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $question]],
        ];

        foreach (self::GEMINI_MODELS as $index => $model) {
            $attempts = ($index === 0 && $enableSearchGrounding) ? [true, false] : [false];

            foreach ($attempts as $useSearch) {
                try {
                    $payload = [
                        'systemInstruction' => ['parts' => [['text' => $systemPrompt]]],
                        'contents' => $contents,
                        'generationConfig' => ['maxOutputTokens' => $maxTokens],
                    ];
                    if ($useSearch) {
                        $payload['tools'] = [['google_search' => new \stdClass()]];
                    }

                    $response = $client->post(
                        "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                        [
                            'headers' => ['Content-Type' => 'application/json'],
                            'json' => $payload,
                        ]
                    );

                    $data = json_decode($response->getBody()->getContents(), true);
                    $parts = $data['candidates'][0]['content']['parts'] ?? [];
                    $chunks = [];
                    foreach ($parts as $p) {
                        if (!empty($p['text']) && is_string($p['text'])) {
                            $chunks[] = trim($p['text']);
                        }
                    }
                    $answer = trim(implode("\n", $chunks));
                    if ($answer !== '') {
                        return $answer;
                    }
                } catch (\Throwable $e) {
                    Log::warning("AIChatService Gemini error ({$model}): " . $e->getMessage());
                    if (
                        in_array((int) $e->getCode(), [401, 403], true)
                        || str_contains($e->getMessage(), 'API_KEY_INVALID')
                        || str_contains($e->getMessage(), 'reported as leaked')
                    ) {
                        Cache::put($deadKeyFlag, true, 600);
                        $this->recordProviderFailureLog('gemini', 'Gemini API key rejected (401/403). Fell back to hybrid engine.');
                        return null;
                    }
                }
            }
        }

        return null;
    }

    /**
     * تسجيل حدث مراقبة مزود خارجي بأمان دون كشف أي مفاتيح سرية أو بيانات مرضى
     */
    private function recordProviderFailureLog(string $provider, string $rawMessage): void
    {
        try {
            if (!Schema::hasTable('ai_request_logs')) {
                return;
            }
            // Sanitize any query params or keys from URLs
            $sanitized = preg_replace('/key=[A-Za-z0-9_\-]+/i', 'key=[REDACTED]', $rawMessage) ?? $rawMessage;
            $sanitized = mb_substr($sanitized, 0, 240, 'UTF-8');

            $recentKey = 'ai_provider_err_logged:' . $provider;
            if (Cache::get($recentKey) === true) {
                return;
            }
            Cache::put($recentKey, true, 300);

            AiRequestLog::create([
                'user_id' => null,
                'is_guest' => true,
                'ai_chat_id' => null,
                'language' => 'ar',
                'classification_category' => 'provider_health',
                'topic_category' => 'system',
                'retrieval_mode' => 'fallback',
                'provider_used' => $provider,
                'status' => 'failed',
                'response_time_ms' => 0,
                'references_count' => 0,
                'error_type' => 'provider_error',
                'error_message' => "{$provider} provider error: {$sanitized}",
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // Ignore logging error
        }
    }

    private function logSecurityAudit(?User $user, string $reason): void
    {
        try {
            if (Schema::hasTable('medical_audit_logs')) {
                DB::table('medical_audit_logs')->insert([
                    'actor_user_id' => $user?->id,
                    'actor_role' => $user?->role ?? 'guest',
                    'action' => 'ai_blocked_' . $reason,
                    'target_type' => 'ai_pharmacist',
                    'target_id' => null,
                    'metadata' => json_encode(['reason' => $reason], JSON_UNESCAPED_UNICODE),
                    'ip_address' => request()?->ip(),
                    'created_at' => now(),
                ]);
            }
        } catch (\Throwable) {
            // Safe no-op
        }
    }

    /**
     * @param array<int, array<string, mixed>> $references
     * @param array{medicines: array<int, array<string, mixed>>, doctors: array<int, array<string, mixed>>} $suggestions
     * @return array<string, mixed>
     */
    private function finalizeResponse(
        string $answer,
        string $language,
        string $classification,
        string $retrievalMode,
        string $topicCategory,
        array $references,
        array $suggestions,
        bool $expertRecommended,
        ?string $expertReason,
        bool $guestRestricted,
        bool $unauthorizedBlocked,
        bool $isEmergency,
        string $providerUsed,
        float $startedAt,
        ?User $user,
        ?int $chatId,
        string $logStatus = 'success',
        ?string $errorType = null,
        ?string $errorMessage = null,
        bool $skipLog = false
    ): array {
        $elapsedMs = max(1, (int) round((microtime(true) - $startedAt) * 1000));

        if (!$skipLog) {
            try {
                if (Schema::hasTable('ai_request_logs')) {
                    AiRequestLog::create([
                        'user_id' => $user?->id,
                        'is_guest' => $user === null,
                        'ai_chat_id' => $chatId,
                        'language' => $language,
                        'classification_category' => $classification,
                        'topic_category' => $topicCategory,
                        'retrieval_mode' => $retrievalMode,
                        'provider_used' => $providerUsed,
                        'status' => $logStatus,
                        'response_time_ms' => $elapsedMs,
                        'references_count' => count($references),
                        'error_type' => $errorType,
                        'error_message' => $errorMessage,
                        'created_at' => now(),
                    ]);
                }
            } catch (\Throwable) {
                // Never break response if telemetry fails
            }
        }

        return [
            'answer' => $answer,
            'language' => $language,
            'classification' => $classification,
            'retrieval_mode' => $retrievalMode,
            'references' => array_values($references),
            'suggestions' => $suggestions,
            'expert_assistance' => [
                'recommended' => $expertRecommended,
                'reason' => $expertReason,
                'find_doctor_url' => '/doctors',
                'find_pharmacy_url' => '/medicines',
            ],
            'guest_restricted' => $guestRestricted,
            'unauthorized_blocked' => $unauthorizedBlocked,
            'is_emergency' => $isEmergency,
            'response_time_ms' => $elapsedMs,
            'provider_used' => $providerUsed,
        ];
    }

    /**
     * @return bool|string
     */
    private function resolveSslVerifyOption(): bool|string
    {
        foreach ([ini_get('curl.cainfo'), ini_get('openssl.cafile')] as $iniPath) {
            if (is_string($iniPath) && $iniPath !== '' && is_file($iniPath)) {
                return $iniPath;
            }
        }

        foreach ([
            'C:/Program Files/Git/usr/ssl/certs/ca-bundle.crt',
            'C:/Program Files/Git/mingw64/ssl/certs/ca-bundle.crt',
            'C:/xampp/apache/bin/curl-ca-bundle.crt',
            'C:/laragon/etc/ssl/cacert.pem',
        ] as $bundle) {
            if (is_file($bundle)) {
                return $bundle;
            }
        }

        return app()->environment(['local', 'testing']) ? false : true;
    }

    private function isValidApiKey(?string $key): bool
    {
        if (empty($key)) {
            return false;
        }
        return !in_array($key, [
            'your_openrouter_api_key_here',
            'your_gemini_api_key_here',
            'your_groq_api_key_here',
        ], true);
    }

    private function isGreetingQuestion(string $question): bool
    {
        $q = $this->normalizeArabic($question);
        $lower = strtolower(trim($question, '?!. '));
        if (in_array($lower, ['hi', 'hello', 'hey', 'good morning', 'good evening', 'who are you', 'what can you do'], true)) {
            return true;
        }
        return $this->matchesAny($q, [
            'السلام عليكم', 'اهلا', 'مرحبا', 'ازيك', 'صباح الخير', 'مساء الخير', 'مين انت', 'بتعمل ايه',
        ]) && mb_strlen($q, 'UTF-8') <= 28;
    }

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
            $lines[] = 'Matching Medicines in Saydalety Store:';
            foreach ($medicines as $med) {
                $stock = (int) $med->count > 0 ? "In stock ({$med->count})" : 'Out of stock';
                $lines[] = "- {$med->name} ({$med->type}): {$med->propose} — {$med->price} EGP — {$stock}";
            }
        }
        if ($doctors->isNotEmpty()) {
            $lines[] = 'Matching Doctors in Saydalety Directory:';
            foreach ($doctors as $doc) {
                $lines[] = "- Dr. {$doc->name} ({$doc->specialty}) — {$doc->price} EGP — {$doc->location}";
            }
        }
        return implode("\n", $lines);
    }

    /**
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
            if (
                in_array(mb_strtolower($word, 'UTF-8'), self::STOP_WORDS, true)
                || in_array(mb_strtolower($withoutAl, 'UTF-8'), self::STOP_WORDS, true)
            ) {
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
        $lowerEn = strtolower($question);

        $asksSpecificOtherVitamin = ($this->matchesAny($q, ['فيتامين د', 'فيتامين ب', 'فيتامين ك', 'فيتامين ه', 'فيتامين ا'])
            || str_contains($lowerEn, 'vitamin d') || str_contains($lowerEn, 'vitamin b'))
            && !$this->matchesAny($q, ['فيتامين سي', 'فيتامين ج'])
            && !str_contains($lowerEn, 'vitamin c');

        $filteredKeywords = $asksSpecificOtherVitamin
            ? array_values(array_filter($keywords, fn ($kw) => !in_array($this->normalizeArabic($kw), ['فيتامين', 'vitamin'], true)))
            : $keywords;

        $terms = $filteredKeywords;

        $synonymMap = [
            'باراسيتامول' => ['بنادول', 'Panadol', 'مسكن', 'حرارة'],
            'paracetamol' => ['Panadol', 'بنادول'],
            'acetaminophen' => ['Panadol', 'بنادول'],
            'صداع' => ['بنادول', 'صداع', 'مسكن'],
            'headache' => ['Panadol', 'بنادول', 'صداع'],
            'حراره' => ['بنادول', 'حرارة', 'خافض'],
            'برد' => ['كونجستال', 'برد', 'إنفلونزا', 'فيتامين سي'],
            'انفلونزا' => ['كونجستال', 'إنفلونزا', 'برد'],
            'رشح' => ['كونجستال', 'رشح'],
            'مضاد حيوي' => ['أوجمنتين', 'Augmentin', 'مضاد حيوي'],
            'antibiotic' => ['Augmentin', 'أوجمنتين'],
            'مسكن' => ['بنادول', 'كتافلام', 'مسكن'],
            'اسنان' => ['كتافلام', 'مسكن'],
            'عظام' => ['كتافلام', 'التهاب', 'الروماتيزم'],
            'معده' => ['أنتودين', 'Antodine', 'معدة', 'حموضة'],
            'حموضه' => ['أنتودين', 'حموضة', 'ارتجاع'],
            'فيتامين سي' => ['فيتامين سي', 'Vitamin C', 'مناعة'],
            'مناعه' => ['فيتامين سي', 'مناعة'],
        ];

        foreach ($synonymMap as $trigger => $mappedTerms) {
            if ($this->matchesAny($q, [$trigger]) || str_contains($lowerEn, $trigger)) {
                array_push($terms, ...$mappedTerms);
            }
        }

        return array_slice(array_values(array_unique($terms)), 0, 10);
    }

    private function inferSpecialtyFromQuestion(string $question): ?string
    {
        $q = $this->normalizeArabic($question);
        $en = strtolower($question);

        if ($this->matchesAny($q, ['قلب', 'ضغط', 'صدر', 'شرايين', 'نبض']) || str_contains($en, 'cardio') || str_contains($en, 'heart')) {
            return 'قلب';
        }
        if ($this->matchesAny($q, ['عظام', 'مفاصل', 'ظهر', 'ركبه', 'غضروف', 'روماتيزم', 'نقرس']) || str_contains($en, 'orthop') || str_contains($en, 'joint')) {
            return 'عظام';
        }
        if ($this->matchesAny($q, ['طفل', 'اطفال', 'رضيع', 'تطعيم']) || str_contains($en, 'pediatr')) {
            return 'أطفال';
        }
        if ($this->matchesAny($q, ['عين', 'عيون', 'نظر', 'رمد']) || str_contains($en, 'eye') || str_contains($en, 'ophthalm')) {
            return 'عيون';
        }
        if ($this->matchesAny($q, ['باطنه', 'معده', 'قولون', 'حموضه', 'ارتجاع', 'سكر', 'السكري', 'كبد', 'غده درقيه']) || str_contains($en, 'stomach') || str_contains($en, 'diabetes')) {
            return 'باطنة';
        }

        return null;
    }

    private function mentionsDoctorIntent(string $question): bool
    {
        $q = $this->normalizeArabic($question);
        $en = strtolower($question);
        return $this->matchesAny($q, ['دكتور', 'طبيب', 'اطباء', 'استشاري', 'عياده', 'تخصص', 'كشف'])
            || str_contains($en, 'doctor') || str_contains($en, 'specialist');
    }
}
