<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class AIChatService
{
    private const SYSTEM_PROMPT = 'أنت المساعد الطبي الذكي لموقع صيدلية MY_pharmacy. أجب باللغة العربية باحترافية واختصار وقدم نصائح صحية مفيدة، واذكر دائماً أن هذه النصائح لا تغني عن استشارة الطبيب.';

    private const FALLBACK_ANSWER = 'أهلاً بك في صيدلية MY_pharmacy! فريقنا الطبي والدوائي في خدمتك. يمكنك حجز استشارة أو التواصل معنا مباشرة لتقديم المشورة الطبية الأنسب لحالتك.';

    private const OPENROUTER_MODELS = [
        'google/gemma-3-12b-it:free',
        'google/gemma-3-27b-it:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'openai/gpt-oss-20b:free',
        'meta-llama/llama-3.3-70b-instruct:free',
    ];

    /**
     * إرسال سؤال المريض إلى نماذج الذكاء الاصطناعي المتاحة وإرجاع الإجابة
     */
    public function ask(string $question): string
    {
        $client = new Client(['timeout' => 30, 'connect_timeout' => 10]);

        $openrouterKey = config('openrouter.api_key');
        if ($this->isValidApiKey($openrouterKey)) {
            $answer = $this->tryOpenRouter($client, $openrouterKey, $question);
            if ($answer) {
                return $answer;
            }
        }

        $geminiKeys = array_filter(
            [config('gemini.api_key'), config('gemini.fallback_key')],
            fn ($key) => $this->isValidApiKey($key)
        );

        foreach ($geminiKeys as $key) {
            $answer = $this->tryGemini($client, $key, $question);
            if ($answer) {
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
                $answer = $data['choices'][0]['message']['content'] ?? null;

                if (!empty($answer)) {
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
                        'contents' => [[
                            'role' => 'user',
                            'parts' => [['text' => self::SYSTEM_PROMPT . ' ' . $question]],
                        ]],
                    ],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);
            $answer = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

            return !empty($answer) ? $answer : null;
        } catch (\Throwable $e) {
            Log::error('AIChatService Gemini error: ' . $e->getMessage());
            return null;
        }
    }
}

