<?php

namespace App\Http\Controllers;

use App\Services\AIChatService;
use Illuminate\Http\Request;

class AIChatController extends Controller
{
    public function __construct(
        private readonly AIChatService $aiChatService
    ) {}

    public function ask(Request $request)
    {
        $question = (string) $request->input('question', '');
        $answer = $this->aiChatService->ask($question);

        return response()->json(['answer' => $answer]);
    }
}
