<?php

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiChat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAiChatApiController extends Controller
{
    /**
     * عرض كافة محادثات الصيدلي الذكي للمستخدمين (للقراءة فقط)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);
        $search = trim((string) $request->input('search', ''));

        $query = AiChat::query()
            ->with('user:id,name,email')
            ->withCount('messages')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $chats = $query->paginate($perPage);

        $data = collect($chats->items())->map(fn (AiChat $chat) => [
            'id' => $chat->id,
            'title' => $chat->title,
            'messages_count' => $chat->messages_count,
            'last_message_at' => $chat->last_message_at?->toISOString(),
            'created_at' => $chat->created_at?->toISOString(),
            'user' => $chat->user ? [
                'id' => $chat->user->id,
                'name' => $chat->user->name,
                'email' => $chat->user->email,
            ] : null,
        ])->values();

        return $this->successResponse([
            'data' => $data,
            'current_page' => $chats->currentPage(),
            'last_page' => $chats->lastPage(),
            'per_page' => $chats->perPage(),
            'total' => $chats->total(),
        ]);
    }

    /**
     * عرض تفاصيل محادثة محددة بكامل رسائلها (للقراءة فقط)
     */
    public function show(int $id): JsonResponse
    {
        $chat = AiChat::query()
            ->with(['user:id,name,email,role', 'messages'])
            ->findOrFail($id);

        return $this->successResponse([
            'data' => [
                'id' => $chat->id,
                'title' => $chat->title,
                'last_message_at' => $chat->last_message_at?->toISOString(),
                'created_at' => $chat->created_at?->toISOString(),
                'user' => $chat->user ? [
                    'id' => $chat->user->id,
                    'name' => $chat->user->name,
                    'email' => $chat->user->email,
                    'role' => $chat->user->role,
                ] : null,
                'messages' => $chat->messages->map(fn ($msg) => [
                    'id' => $msg->id,
                    'sender' => $msg->sender,
                    'message' => $msg->message,
                    'created_at' => $msg->created_at?->toISOString(),
                ]),
            ],
        ]);
    }
}
