<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Models\User;
use App\Support\PhoneNormalizer;

class AIQuestionClassifier
{
    /**
     * تصنيف تلقائي ذكي للسؤال (عربي + إنجليزي) مع مراعاة سياق المحادثة وفحص الأمان والطوارئ
     *
     * @param array<int, array{sender: string, text: string, retrieval_mode?: string|null}> $conversationHistory
     * @return array{
     *   language: 'ar'|'en',
     *   category: 'general'|'internal'|'combined'|'emergency'|'unauthorized'|'ambiguous',
     *   retrieval_mode: 'general'|'internal'|'combined'|'emergency'|'restricted'|'fallback',
     *   topic_category: string,
     *   internal_scopes: list<string>,
     *   follow_up_topic: string|null,
     *   security_reason: string|null,
     *   emergency_type: string|null
     * }
     */
    public function classify(string $question, ?User $user = null, array $conversationHistory = []): array
    {
        $trimmed = trim($question);
        $language = $this->detectLanguage($trimmed, $conversationHistory);
        $normAr = $this->normalizeArabic($trimmed);
        $lowerEn = mb_strtolower($trimmed, 'UTF-8');

        // 1. فحص محاولات اختراق الأوامر (Prompt Injection) أو طلب بيانات مريض آخر غير مصرح بها
        $securityViolation = $this->detectSecurityViolation($trimmed, $normAr, $lowerEn, $user);
        if ($securityViolation !== null) {
            return [
                'language' => $language,
                'category' => 'unauthorized',
                'retrieval_mode' => 'restricted',
                'topic_category' => 'security',
                'internal_scopes' => [],
                'follow_up_topic' => null,
                'security_reason' => $securityViolation,
                'emergency_type' => null,
            ];
        }

        // 2. فحص الأعراض والحالات الطارئة عالية الخطورة فوراً (High-Risk / Emergency Triage)
        $emergencyType = $this->detectEmergency($normAr, $lowerEn);
        if ($emergencyType !== null) {
            return [
                'language' => $language,
                'category' => 'emergency',
                'retrieval_mode' => 'emergency',
                'topic_category' => 'emergency',
                'internal_scopes' => [],
                'follow_up_topic' => null,
                'security_reason' => null,
                'emergency_type' => $emergencyType,
            ];
        }

        // 3. فحص الأسئلة الغامضة جداً التي لا تحمل موضوعاً واضحاً ولا سياقاً سابقاً
        if ($this->isAmbiguousWithoutContext($trimmed, $normAr, $lowerEn, $conversationHistory)) {
            return [
                'language' => $language,
                'category' => 'ambiguous',
                'retrieval_mode' => 'fallback',
                'topic_category' => 'clarification',
                'internal_scopes' => [],
                'follow_up_topic' => null,
                'security_reason' => null,
                'emergency_type' => null,
            ];
        }

        // 4. استخراج النطاقات الشخصية المطلوبة (إن وُجدت) وإشارات المعرفة الطبية العامة
        $internalScopes = $this->detectInternalScopes($normAr, $lowerEn);
        $hasGeneralMedicalIntent = $this->detectGeneralMedicalIntent($normAr, $lowerEn);
        $followUpTopic = $this->resolveFollowUpContext($normAr, $lowerEn, $conversationHistory, $internalScopes, $hasGeneralMedicalIntent);

        if ($internalScopes !== [] && $hasGeneralMedicalIntent) {
            return [
                'language' => $language,
                'category' => 'combined',
                'retrieval_mode' => 'combined',
                'topic_category' => $this->resolveTopicCategory($internalScopes, $normAr, $lowerEn),
                'internal_scopes' => $internalScopes,
                'follow_up_topic' => $followUpTopic,
                'security_reason' => null,
                'emergency_type' => null,
            ];
        }

        if ($internalScopes !== []) {
            return [
                'language' => $language,
                'category' => 'internal',
                'retrieval_mode' => 'internal',
                'topic_category' => $this->resolveTopicCategory($internalScopes, $normAr, $lowerEn),
                'internal_scopes' => $internalScopes,
                'follow_up_topic' => $followUpTopic,
                'security_reason' => null,
                'emergency_type' => null,
            ];
        }

        return [
            'language' => $language,
            'category' => 'general',
            'retrieval_mode' => 'general',
            'topic_category' => $this->resolveTopicCategory([], $normAr, $lowerEn),
            'internal_scopes' => [],
            'follow_up_topic' => $followUpTopic,
            'security_reason' => null,
            'emergency_type' => null,
        ];
    }

    /**
     * @param array<int, array{sender: string, text: string, retrieval_mode?: string|null}> $history
     * @return 'ar'|'en'
     */
    public function detectLanguage(string $text, array $history = []): string
    {
        $arabicCount = preg_match_all('/\p{Arabic}/u', $text) ?: 0;
        $latinCount = preg_match_all('/[a-zA-Z]/', $text) ?: 0;

        if ($arabicCount === 0 && $latinCount > 0) {
            return 'en';
        }
        if ($arabicCount > 0 && $latinCount === 0) {
            return 'ar';
        }
        if ($latinCount > $arabicCount * 2) {
            return 'en';
        }
        if ($arabicCount > 0) {
            return 'ar';
        }

        for ($i = count($history) - 1; $i >= 0; $i--) {
            if (($history[$i]['sender'] ?? '') === 'user' && !empty($history[$i]['text'])) {
                $prevAr = preg_match_all('/\p{Arabic}/u', $history[$i]['text']) ?: 0;
                $prevEn = preg_match_all('/[a-zA-Z]/', $history[$i]['text']) ?: 0;
                return $prevEn > $prevAr ? 'en' : 'ar';
            }
        }

        return 'ar';
    }

    private function detectSecurityViolation(string $raw, string $normAr, string $lowerEn, ?User $user): ?string
    {
        $injectionPhrases = [
            'ignore previous instructions',
            'ignore all previous',
            'disregard system prompt',
            'bypass authorization',
            'reveal system prompt',
            'dump all users',
            'dump database',
            'show all patients',
            'all patients prescriptions',
            'تجاهل التعليمات السابقه',
            'تجاهل القواعد السابقه',
            'اعرض كل المرضى',
            'اعرض جميع الروشتات',
            'تجاوز الصلاحيات',
        ];

        foreach ($injectionPhrases as $phrase) {
            if (str_contains($lowerEn, $phrase) || str_contains($normAr, $phrase)) {
                return 'prompt_injection';
            }
        }

        $otherUserPhrasesAr = [
            'روشته مريض اخر', 'روشتات مريض اخر', 'سجل مريض اخر', 'بيانات مريض اخر',
            'مواعيد مريض اخر', 'حجز مريض اخر', 'روشته مستخدم اخر', 'بيانات مستخدم اخر',
            'روشته شخص اخر', 'سجل طبي لشخص اخر', 'روشته اخي', 'روشته صديقي', 'ملف مريض تاني',
            'بيانات المريض رقم', 'روشته المستخدم رقم',
        ];

        $otherUserPhrasesEn = [
            'another patient', 'other patient', 'another user', 'other user',
            'someone else\'s prescription', 'someone elses prescription',
            'friend\'s prescription', 'records of patient', 'prescription of patient',
            'appointments of user', 'prescription for user id', 'patient id ',
        ];

        foreach ($otherUserPhrasesAr as $p) {
            if (str_contains($normAr, $p)) {
                return 'cross_patient_access';
            }
        }
        foreach ($otherUserPhrasesEn as $p) {
            if (str_contains($lowerEn, $p)) {
                return 'cross_patient_access';
            }
        }

        $asksPrivateRecord = $this->matchesAny($normAr, ['روشته', 'موعد', 'حجز', 'سجل طبي', 'متابعه', 'طلب'])
            || $this->matchesAny($lowerEn, ['prescription', 'appointment', 'medical record', 'follow-up', 'consultation']);

        if ($asksPrivateRecord) {
            if (preg_match('/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/', $raw, $emailMatch) === 1) {
                $mentionedEmail = strtolower(trim($emailMatch[0]));
                if ($user === null || strtolower((string) $user->email) !== $mentionedEmail) {
                    return 'cross_patient_access';
                }
            }

            if (preg_match('/(?:\+?20|0)?1[0125]\d{8}/', $raw, $phoneMatch) === 1) {
                $mentionedPhone = PhoneNormalizer::normalize($phoneMatch[0]);
                $userPhone = $user?->phone ? PhoneNormalizer::normalize($user->phone) : null;
                if ($user === null || $mentionedPhone !== $userPhone) {
                    return 'cross_patient_access';
                }
            }
        }

        return null;
    }

    private function detectEmergency(string $normAr, string $lowerEn): ?string
    {
        $overdoseAr = ['جرعه زائده', 'جرعه زايده', 'بلعت شريط', 'بلع علبه دواء', 'تسمم دوائي', 'تسمم بالدواء', 'انتحار', 'اؤذي نفسي'];
        $overdoseEn = ['overdose', 'took too many pills', 'swallowed a whole bottle', 'drug poisoning', 'suicidal', 'kill myself', 'self harm'];

        if ($this->matchesAny($normAr, $overdoseAr) || $this->matchesAny($lowerEn, $overdoseEn)) {
            return 'overdose_or_poisoning';
        }

        $anaphylaxisAr = ['تورم اللسان', 'تورم الحلق', 'اختناق بعد الدواء', 'حساسيه مفرطه شديده', 'مش قادر اتنفس بعد الدواء'];
        $anaphylaxisEn = ['anaphylaxis', 'severe allergic reaction', 'throat swelling', 'tongue swelling', 'cant breathe after taking', 'difficulty breathing and hives'];

        if ($this->matchesAny($normAr, $anaphylaxisAr) || $this->matchesAny($lowerEn, $anaphylaxisEn)) {
            return 'severe_allergic_reaction';
        }

        $cardioNeuroAr = [
            'الم شديد في الصدر', 'وجع شديد في الصدر', 'ضيق تنفس شديد جدا', 'مش قادر اخد نفسي خالص',
            'فقدان الوعي', 'اغماء مفاجئ', 'شلل مفاجئ', 'ثقل اللسان مفاجئ', 'اعوجاج الفم', 'نزيف حاد لا يتوقف',
        ];
        $cardioNeuroEn = [
            'severe chest pain', 'crushing chest pain', 'chest pain radiating', 'cannot breathe',
            'can\'t breathe', 'severe shortness of breath', 'loss of consciousness', 'fainted',
            'sudden facial droop', 'slurred speech', 'stroke symptoms', 'uncontrolled bleeding',
        ];

        if ($this->matchesAny($normAr, $cardioNeuroAr) || $this->matchesAny($lowerEn, $cardioNeuroEn)) {
            return 'acute_medical_emergency';
        }

        return null;
    }

    /**
     * @return list<string>
     */
    private function detectInternalScopes(string $normAr, string $lowerEn): array
    {
        $scopes = [];

        $rxAr = [
            'روشتتي', 'روشتاتي', 'وصفتي', 'وصفاتي', 'في روشتتي', 'في وصفتي', 'اخر روشته',
            'ادويتي الموصوفه', 'ادويتي المسجله', 'الدواء الموصوف لي', 'الادويه الموصوفه لي',
            'وصفه الطبيب لي', 'روشته الدكتور لي', 'علاجي الموصوف',
        ];
        $rxEn = [
            'my prescription', 'my prescriptions', 'in my prescription', 'latest prescription',
            'last prescription', 'my recorded medication', 'my recorded medications',
            'prescribed to me', 'have i been prescribed', 'have i previously been prescribed',
            'currently listed in my prescription', 'my current medication', 'my medications list',
        ];
        if ($this->matchesAny($normAr, $rxAr) || $this->matchesAny($lowerEn, $rxEn)) {
            $scopes[] = 'prescriptions';
        }

        $apptAr = [
            'موعدي', 'مواعيدي', 'حجزي', 'حجوزاتي', 'موعد الكشف القادم', 'متى موعدي',
            'حجز العياده الخاص بي', 'ميعادي مع الدكتور', 'مواعيدي القادمه', 'مواعيدي السابقه',
        ];
        $apptEn = [
            'my appointment', 'my appointments', 'my next appointment', 'upcoming appointment',
            'when is my appointment', 'my booking', 'my bookings', 'my scheduled visit',
        ];
        if ($this->matchesAny($normAr, $apptAr) || $this->matchesAny($lowerEn, $apptEn)) {
            $scopes[] = 'appointments';
        }

        $followAr = [
            'متابعاتي', 'متابعتي', 'سجلي الطبي', 'ملفي الطبي', 'تاريخي المرضي',
            'استشارتي السابقه', 'استشاراتي السابقه', 'زياراتي السابقه', 'تشخيصي المسجل',
            'ملاحظات الطبيب لي', 'محادثتي مع الطبيب',
        ];
        $followEn = [
            'my follow-up', 'my follow up', 'my follow-ups', 'my followups',
            'previous consultation', 'previous consultations', 'my consultation',
            'my medical history', 'my medical record', 'my medical records',
            'my recorded diagnosis', 'doctor notes for me',
        ];
        if ($this->matchesAny($normAr, $followAr) || $this->matchesAny($lowerEn, $followEn)) {
            $scopes[] = 'follow_ups';
            $scopes[] = 'consultations';
        }

        $orderAr = [
            'طلبيتي', 'طلباتي', 'اوردراتي', 'حاله طلبي', 'الادويه التي طلبتها', 'مشترياتي من الادويه',
        ];
        $orderEn = [
            'my order', 'my orders', 'my medicine order', 'medicines i ordered', 'status of my order',
        ];
        if ($this->matchesAny($normAr, $orderAr) || $this->matchesAny($lowerEn, $orderEn)) {
            $scopes[] = 'orders';
        }

        $profileAr = ['ملفي الشخصي', 'بيانات حسابي', 'معلومات حسابي الشخصيه', 'بياناتي المسجله'];
        $profileEn = ['my profile', 'my account information', 'my personal records', 'my health records'];
        if ($this->matchesAny($normAr, $profileAr) || $this->matchesAny($lowerEn, $profileEn)) {
            $scopes[] = 'profile';
            if ($scopes === ['profile']) {
                $scopes = ['profile', 'prescriptions', 'appointments', 'follow_ups'];
            }
        }

        return array_values(array_unique($scopes));
    }

    private function detectGeneralMedicalIntent(string $normAr, string $lowerEn): bool
    {
        $generalSignalsAr = [
            'ما استخدامات', 'لايه بيستخدم', 'فيما يستخدم', 'فيم يستخدم', 'لماذا يستخدم',
            'اشرح لي الدواء', 'اشرح الدواء', 'شرح الدواء', 'اشرح لي الادويه', 'معلومات عامه عن',
            'الاثار الجانبيه', 'الاعراض الجانبيه', 'اضرار', 'فوائد', 'احتياطات', 'تحذيرات',
            'موانع الاستعمال', 'موانع استخدام', 'التداخلات الدوائيه', 'تفاعلات', 'الجرعه المعتاده',
            'الفرق بين', 'كيف يعمل', 'طريقه عمل', 'نصائح طبيه', 'ماذا ينبغي ان اناقش',
        ];

        $generalSignalsEn = [
            'what is it used for', 'what is it generally used for', 'generally used for',
            'used for', 'side effects', 'adverse effects', 'precautions', 'warnings',
            'contraindications', 'drug interactions', 'interactions', 'explain the medication',
            'explain this medication', 'explain the medicine', 'how does it work',
            'mechanism of action', 'difference between', 'benefits of', 'what should i know about',
            'discuss with my doctor',
        ];

        return $this->matchesAny($normAr, $generalSignalsAr) || $this->matchesAny($lowerEn, $generalSignalsEn);
    }

    /**
     * @param array<int, array{sender: string, text: string, retrieval_mode?: string|null}> $history
     * @param list<string> $internalScopes
     */
    private function resolveFollowUpContext(
        string $normAr,
        string $lowerEn,
        array $history,
        array &$internalScopes,
        bool &$hasGeneralMedicalIntent
    ): ?string {
        if ($history === []) {
            return null;
        }

        $referentialPronounsAr = [
            'هذا الدواء', 'هذه الادويه', 'اعراضه الجانبيه', 'اثاره الجانبيه', 'موانع استعماله',
            'احتياطاته', 'ما استخداماته', 'فيما يستخدم', 'جرعته', 'اشرحه', 'اشرحها', 'ومتى الموعد', 'وماذا عنها',
        ];
        $referentialPronounsEn = [
            'this medication', 'these medications', 'this medicine', 'its side effects',
            'its precautions', 'what is it used for', 'explain it', 'explain them',
            'what about the first one', 'are there interactions between them', 'and after that',
        ];

        $isFollowUp = mb_strlen($normAr . $lowerEn, 'UTF-8') <= 75
            && ($this->matchesAny($normAr, $referentialPronounsAr) || $this->matchesAny($lowerEn, $referentialPronounsEn));

        if (!$isFollowUp) {
            return null;
        }

        $lastUserText = null;
        $lastBotMode = null;

        for ($i = count($history) - 1; $i >= 0; $i--) {
            $item = $history[$i];
            if ($lastBotMode === null && ($item['sender'] ?? '') === 'bot' && !empty($item['retrieval_mode'])) {
                $lastBotMode = $item['retrieval_mode'];
            }
            if ($lastUserText === null && ($item['sender'] ?? '') === 'user' && !empty($item['text'])) {
                $lastUserText = $item['text'];
            }
            if ($lastUserText !== null && $lastBotMode !== null) {
                break;
            }
        }

        if (in_array($lastBotMode, ['internal', 'combined'], true) && $internalScopes === []) {
            $internalScopes[] = 'prescriptions';
            $hasGeneralMedicalIntent = true;
        }

        return $lastUserText;
    }

    /**
     * @param array<int, array{sender: string, text: string}> $history
     */
    private function isAmbiguousWithoutContext(string $trimmed, string $normAr, string $lowerEn, array $history): bool
    {
        if ($history !== []) {
            return false;
        }

        $ambiguousExactAr = ['دواء', 'علاج', 'سؤال', 'مساعده', 'عندي مشكله', 'هو ايه', 'ممكن سؤال'];
        $ambiguousExactEn = ['medicine', 'medication', 'help', 'question', 'doctor', 'what is it', 'explain this'];

        return in_array($normAr, $ambiguousExactAr, true) || in_array(trim($lowerEn, '?!. '), $ambiguousExactEn, true);
    }

    /**
     * @param list<string> $internalScopes
     */
    private function resolveTopicCategory(array $internalScopes, string $normAr, string $lowerEn): string
    {
        if (in_array('prescriptions', $internalScopes, true)) {
            return 'prescriptions';
        }
        if (in_array('appointments', $internalScopes, true)) {
            return 'appointments';
        }
        if (in_array('follow_ups', $internalScopes, true)) {
            return 'follow_ups';
        }
        if (in_array('orders', $internalScopes, true)) {
            return 'orders';
        }
        if ($this->matchesAny($normAr, ['جرعه', 'دواء', 'اعراض جانبيه', 'تداخلات', 'مضاد', 'مسكن', 'فيتامين'])
            || $this->matchesAny($lowerEn, ['dose', 'dosage', 'side effect', 'interaction', 'antibiotic', 'painkiller', 'vitamin', 'used for', 'precaution'])) {
            return 'medications';
        }
        if ($this->matchesAny($normAr, ['الم', 'صداع', 'برد', 'حراره', 'كحه', 'معده', 'حموضه'])
            || $this->matchesAny($lowerEn, ['pain', 'headache', 'fever', 'cough', 'flu', 'stomach', 'symptom'])) {
            return 'symptoms';
        }

        return 'general_health';
    }

    public function normalizeArabic(string $text): string
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
        foreach ($phrases as $phrase) {
            if ($phrase !== '' && mb_strpos($haystack, $phrase, 0, 'UTF-8') !== false) {
                return true;
            }
        }
        return false;
    }
}
