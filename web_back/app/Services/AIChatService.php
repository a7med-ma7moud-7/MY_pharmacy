<?php

declare(strict_types=1);

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AIChatService
{
    private const SYSTEM_PROMPT = 'أنت المساعد الطبي والصيدلي الذكي لمنصة صيدليتي (MY_pharmacy). أجب باللغة العربية باحترافية ووضوح واختصار في نقاط منظمة عند الحاجة، وقدم إرشادات دوائية وصحية دقيقة، مع التذكير اللطيف بأن هذه المعلومات الإرشادية لا تغني عن الفحص الطبي المباشر.';

    private const FALLBACK_ANSWER = 'أهلاً بك في صيدلية MY_pharmacy! فريقنا الطبي والدوائي في خدمتك. يمكنك حجز استشارة أو التواصل معنا مباشرة لتقديم المشورة الطبية الأنسب لحالتك.';

    private const CACHE_TTL_SECONDS = 900; // 15 minutes

    private const OPENROUTER_MODELS = [
        'google/gemma-3-12b-it:free',
        'google/gemma-3-27b-it:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'meta-llama/llama-3.3-70b-instruct:free',
    ];

    /**
     * إرسال سؤال المريض إلى نماذج الذكاء الاصطناعي المتاحة مع تخزين مؤقت ذكي للإجابات المتكررة
     */
    public function ask(string $question): string
    {
        $normalizedQuestion = trim(preg_replace('/\s+/u', ' ', $question) ?? $question);
        if ($normalizedQuestion === '') {
            return self::FALLBACK_ANSWER;
        }

        $cacheKey = 'ai_chat:v1:' . sha1(mb_strtolower($normalizedQuestion, 'UTF-8'));
        $cachedAnswer = Cache::get($cacheKey);
        if (is_string($cachedAnswer) && $cachedAnswer !== '') {
            return $cachedAnswer;
        }

        $client = new Client([
            'timeout' => 10,
            'connect_timeout' => 4,
        ]);

        $openrouterKey = config('openrouter.api_key');
        if ($this->isValidApiKey($openrouterKey)) {
            $answer = $this->tryOpenRouter($client, (string) $openrouterKey, $normalizedQuestion);
            if ($answer !== null) {
                Cache::put($cacheKey, $answer, self::CACHE_TTL_SECONDS);
                return $answer;
            }
        }

        $geminiKeys = array_filter(
            [config('gemini.api_key'), config('gemini.fallback_key')],
            fn ($key) => $this->isValidApiKey(is_string($key) ? $key : null)
        );

        foreach ($geminiKeys as $key) {
            $answer = $this->tryGemini($client, (string) $key, $normalizedQuestion);
            if ($answer !== null) {
                Cache::put($cacheKey, $answer, self::CACHE_TTL_SECONDS);
                return $answer;
            }
        }

        return self::FALLBACK_ANSWER;
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

    private function tryOpenRouter(Client $client, string $apiKey, string $question): ?string
    {
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
                            ['role' => 'system', 'content' => self::SYSTEM_PROMPT],
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
            }
        }

        return null;
    }

    private function tryGemini(Client $client, string $apiKey, string $question): ?string
    {
        try {
            $response = $client->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=' . $apiKey,
                [
                    'headers' => ['Content-Type' => 'application/json'],
                    'json' => [
                        'systemInstruction' => [
                            'parts' => [['text' => self::SYSTEM_PROMPT]],
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

            return $answer !== '' ? $answer : null;
        } catch (\Throwable $e) {
            Log::error('AIChatService Gemini error: ' . $e->getMessage());
            return null;
        }
    }
}
