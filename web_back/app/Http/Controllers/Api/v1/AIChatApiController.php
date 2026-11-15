<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\AiChat;
use App\Services\AIChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AIChatApiController extends Controller
{
    public function __construct(
        private readonly AIChatService $aiChatService
    ) {}

    /**
     * استرجاع محادثات الصيدلي الذكي الخاصة بالمستخدم المسجل فقط
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->errorResponse('يجب تسجيل الدخول لعرض سجل المحادثات.', 401);
        }

        $chats = AiChat::query()
            ->where('user_id', $user->id)
            ->withCount('messages')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (AiChat $chat) => [
                'id' => $chat->id,
                'title' => $chat->title,
                'messages_count' => $chat->messages_count,
                'last_message_at' => $chat->last_message_at?->toISOString(),
                'created_at' => $chat->created_at?->toISOString(),
            ]);

        return $this->successResponse([
            'chats' => $chats,
        ]);
    }

    /**
     * عرض محادثة محددة تخص المستخدم المسجل فقط
     */
    public function show(int $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return $this->errorResponse('يجب تسجيل الدخول لعرض المحادثة.', 401);
        }

        $chat = AiChat::query()
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->with('messages')
            ->firstOrFail();

        return $this->successResponse([
            'chat' => [
                'id' => $chat->id,
                'title' => $chat->title,
                'last_message_at' => $chat->last_message_at?->toISOString(),
                'created_at' => $chat->created_at?->toISOString(),
                'messages' => $chat->messages->map(fn ($msg) => [
                    'id' => $msg->id,
                    'sender' => $msg->sender,
                    'text' => $msg->message,
                    'suggestions' => $msg->meta['suggestions'] ?? null,
                    'created_at' => $msg->created_at?->toISOString(),
                ]),
            ],
        ]);
    }

    /**
     * استلام سؤال المريض والرد عليه عبر نماذج الذكاء الاصطناعي
     * يتم الحفظ فقط للمستخدم المسجل في النظام، ولا يتم حفظ محادثات وضع الضيف (Guest Mode)
     */
    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string|max:1000',
            'chat_id' => 'nullable|integer',
        ]);

        $user = Auth::user();
        $existingChat = null;

        if ($user && !empty($validated['chat_id'])) {
            $existingChat = AiChat::query()
                ->where('id', $validated['chat_id'])
                ->where('user_id', $user->id)
                ->firstOrFail();
        }

        $question = trim($validated['question']);
        $result = $this->aiChatService->askWithContext($question);
        $answer = $result['answer'];
        $suggestions = $result['suggestions'];

        if (!$user) {
            return $this->successResponse([
                'answer' => $answer,
                'suggestions' => $suggestions,
                'chat_id' => null,
                'saved' => false,
            ]);
        }

        $chat = DB::transaction(function () use ($user, $existingChat, $question, $answer, $suggestions) {
            $now = now();

            if (!$existingChat) {
                $existingChat = AiChat::create([
                    'user_id' => $user->id,
                    'title' => mb_substr($question, 0, 80),
                    'last_message_at' => $now,
                ]);
            } else {
                $existingChat->update(['last_message_at' => $now]);
            }

            $existingChat->messages()->createMany([
                ['sender' => 'user', 'message' => $question],
                [
                    'sender' => 'bot',
                    'message' => $answer,
                    'meta' => (!empty($suggestions['medicines']) || !empty($suggestions['doctors']))
                        ? ['suggestions' => $suggestions]
                        : null,
                ],
            ]);

            return $existingChat;
        });

        return $this->successResponse([
            'answer' => $answer,
            'suggestions' => $suggestions,
            'chat_id' => $chat->id,
            'saved' => true,
            'chat' => [
                'id' => $chat->id,
                'title' => $chat->title,
                'last_message_at' => $chat->last_message_at?->toISOString(),
                'created_at' => $chat->created_at?->toISOString(),
            ],
        ]);
    }
}
