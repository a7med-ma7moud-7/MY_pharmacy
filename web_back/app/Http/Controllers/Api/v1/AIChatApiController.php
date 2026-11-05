<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\AIChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIChatApiController extends Controller
{
    public function __construct(
        private readonly AIChatService $aiChatService
    ) {}

    /**
     * استلام سؤال المريض والرد عليه عبر نماذج الذكاء الاصطناعي
     */
    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        $answer = $this->aiChatService->ask($validated['question']);

        return $this->successResponse([
            'answer' => $answer,
        ]);
    }
}
