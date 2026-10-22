<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use GuzzleHttp\Client;
use Illuminate\Http\Request;

class AIChatApiController extends Controller
{
    /**
     * استلام سؤال المريض والرد عليه عبر نماذج الذكاء الاصطناعي
     */
    public function ask(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        $question = $request->input('question');
        $openrouterKey = config('openrouter.api_key');

        if ($openrouterKey) {
            $models = [
                'google/gemma-3-12b-it:free',
                'google/gemma-3-27b-it:free',
                'meta-llama/llama-3.2-3b-instruct:free',
                'openai/gpt-oss-20b:free',
                'meta-llama/llama-3.3-70b-instruct:free',
            ];

            foreach ($models as $model) {
                try {
                    $client = new Client(['timeout' => 30, 'connect_timeout' => 10]);

                    $response = $client->post('https://openrouter.ai/api/v1/chat/completions', [
                        'headers' => [
                            'Authorization' => 'Bearer ' . $openrouterKey,
                            'Content-Type'  => 'application/json',
                        ],
                        'json' => [
                            'model'    => $model,
                            'messages' => [
                                [
                                    'role' => 'system',
                                    'content' => 'أنت المساعد الطبي الذكي لموقع صيدلية MY_pharmacy. أجب باللغة العربية باحترافية واختصار وقدم نصائح صحية مفيدة، واذكر دائماً أن هذه النصائح لا تغني عن استشارة الطبيب.'
                                ],
                                ['role' => 'user', 'content' => $question]
                            ],
                        ],
                    ]);

                    $data   = json_decode($response->getBody()->getContents(), true);
                    $answer = $data['choices'][0]['message']['content'] ?? null;

                    if ($answer) {
                        return response()->json([
                            'success' => true,
                            'answer' => $answer,
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::warning('AIChatApiController OpenRouter error (' . $model . '): ' . $e->getMessage());
                }
            }
        }

        // Fallback: Gemini
        $geminiKeys = array_filter([config('gemini.api_key'), config('gemini.fallback_key')]);

        foreach ($geminiKeys as $key) {
            try {
                $client = new Client(['timeout' => 30, 'connect_timeout' => 10]);

                $response = $client->post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=' . $key,
                    [
                        'headers' => ['Content-Type' => 'application/json'],
                        'json'    => [
                            'contents' => [[
                                'role'  => 'user',
                                'parts' => [['text' => 'أنت المساعد الطبي لصيدلية MY_pharmacy. أجب باللغة العربية: ' . $question]],
                            ]],
                        ],
                    ]
                );

                $data   = json_decode($response->getBody()->getContents(), true);
                $answer = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if ($answer) {
                    return response()->json([
                        'success' => true,
                        'answer' => $answer,
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('AIChatApiController Gemini key failed: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'answer' => 'أهلاً بك في صيدلية MY_pharmacy! فريقنا الطبي والدوائي في خدمتك. يمكنك حجز استشارة أو التواصل معنا مباشرة لتقديم المشورة الطبية الأنسب لحالتك.',
        ]);
    }
}
