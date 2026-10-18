<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class AIChatController extends Controller
{
    public function ask(Request $request)
    {
        $question = $request->input('question');
        $openrouterKey = config('openrouter.api_key');

        if ($openrouterKey) {
            // Primary: OpenRouter — try multiple free models in order
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
                            'messages' => [['role' => 'user', 'content' => $question]],
                        ],
                    ]);

                    $data   = json_decode($response->getBody()->getContents(), true);
                    $answer = $data['choices'][0]['message']['content'] ?? null;

                    if ($answer) {
                        return response()->json(['answer' => $answer]);
                    }

                } catch (\Exception $e) {
                    \Log::warning('AIChat OpenRouter model failed (' . $model . '): ' . $e->getMessage());
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
                                'parts' => [['text' => $question]],
                            ]],
                        ],
                    ]
                );

                $data   = json_decode($response->getBody()->getContents(), true);
                $answer = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No answer received.';

                return response()->json(['answer' => $answer]);

            } catch (\Exception $e) {
                \Log::error('AIChat Gemini key failed: ' . $e->getMessage());
            }
        }

        return response()->json(['answer' => 'All AI services are currently unavailable. Please try again later.']);
    }
}
