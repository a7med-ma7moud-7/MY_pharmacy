<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\AiChat;
use App\Models\AiChatMessage;
use App\Models\AiConfiguration;
use App\Models\AiGuestSession;
use App\Models\AiMessageReference;
use App\Models\AiUserFeedback;
use App\Models\User;
use App\Services\AIChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AIChatApiController extends Controller
{
    public function __construct(
        private readonly AIChatService $aiChatService
    ) {}

    /**
     * قائمة الأسئلة المقترحة التفاعلية (عربي + إنجليزي) حسب نوع المستخدم (زائر أو مسجل)
     */
    public function suggestedQuestions(Request $request): JsonResponse
    {
        $user = Auth::user();
        $lang = strtolower((string) $request->query('lang', 'ar')) === 'en' ? 'en' : 'ar';

        $generalAr = [
            ['category' => 'general', 'title' => 'الجرعات والاستخدام', 'prompt' => 'ما هي الجرعة الآمنة للباراسيتامول للبالغين يومياً وما احتياطاته؟'],
            ['category' => 'general', 'title' => 'المضادات والفيروسات', 'prompt' => 'ما الفرق بين المضادات الحيوية ومضادات الفيروسات ومتى تُستخدم؟'],
            ['category' => 'general', 'title' => 'الأعراض الجانبية', 'prompt' => 'ما هي الأعراض الجانبية الشائعة لدواء إيبوبروفين وموانع استعماله؟'],
            ['category' => 'general', 'title' => 'حفظ الأدوية', 'prompt' => 'ما هي الطريقة الصحيحة لحفظ أقلام الإنسولين في المنزل؟'],
        ];

        $authExtraAr = [
            ['category' => 'internal', 'title' => 'روشتاتي ومواعيدي', 'prompt' => 'ما هي الأدوية المسجلة في روشتتي الحالية ومتى موعدي القادم؟'],
            ['category' => 'combined', 'title' => 'شرح أدوية روشتتي', 'prompt' => 'اشرح لي الأدوية المذكورة في آخر روشتة لي وما أهم الاحتياطات عند تناولها؟'],
        ];

        $generalEn = [
            ['category' => 'general', 'title' => 'Uses & Precautions', 'prompt' => 'What is Paracetamol used for and what are its daily dose precautions?'],
            ['category' => 'general', 'title' => 'Side Effects', 'prompt' => 'What are the common side effects and contraindications of Ibuprofen?'],
            ['category' => 'general', 'title' => 'Antibiotics vs Antivirals', 'prompt' => 'What is the difference between antibiotics and antivirals?'],
            ['category' => 'general', 'title' => 'Safe Medication Use', 'prompt' => 'What precautions should I know before taking a new medication?'],
        ];

        $authExtraEn = [
            ['category' => 'internal', 'title' => 'My Prescriptions & Visits', 'prompt' => 'What medications are currently listed in my prescriptions and when is my next appointment?'],
            ['category' => 'combined', 'title' => 'Explain My Prescription', 'prompt' => 'Explain the medication mentioned in my latest prescription and its precautions.'],
        ];

        $items = $lang === 'en'
            ? ($user ? array_merge(array_slice($generalEn, 0, 2), $authExtraEn) : $generalEn)
            : ($user ? array_merge(array_slice($generalAr, 0, 2), $authExtraAr) : $generalAr);

        return $this->successResponse([
            'language' => $lang,
            'is_authenticated' => $user !== null,
            'suggestions' => $items,
        ]);
    }

    /**
     * استرجاع سجل محادثات المستخدم المسجل حصراً (مع عزل تام بين المستخدمين)
     */
    public function index(): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();
        if (!$user) {
            return $this->errorResponse('يجب تسجيل الدخول لعرض سجل المحادثات المحفوظة.', 401);
        }

        $chats = AiChat::query()
            ->where('user_id', $user->id)
            ->active()
            ->withCount('messages')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (AiChat $chat) => [
                'id' => $chat->id,
                'title' => $chat->title,
                'language' => $chat->language ?? 'ar',
                'last_message_preview' => $chat->last_message_preview,
                'messages_count' => $chat->messages_count,
                'last_message_at' => $chat->last_message_at?->toISOString(),
                'created_at' => $chat->created_at?->toISOString(),
            ]);

        return $this->successResponse([
            'chats' => $chats,
        ]);
    }

    /**
     * إنشاء محادثة جديدة فارغة للمستخدم المسجل
     */
    public function create(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();
        if (!$user) {
            return $this->errorResponse('يجب تسجيل الدخول لإنشاء محادثة محفوظة.', 401);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:120',
            'language' => 'nullable|in:ar,en',
        ]);

        $lang = $validated['language'] ?? 'ar';
        $chat = AiChat::create([
            'user_id' => $user->id,
            'title' => trim((string) ($validated['title'] ?? ($lang === 'en' ? 'New Consultation' : 'محادثة جديدة'))),
            'language' => $lang,
            'status' => 'active',
            'last_message_at' => now(),
        ]);

        return $this->successResponse([
            'chat' => [
                'id' => $chat->id,
                'title' => $chat->title,
                'language' => $chat->language,
                'messages_count' => 0,
                'last_message_at' => $chat->last_message_at?->toISOString(),
                'created_at' => $chat->created_at?->toISOString(),
            ],
        ], 201);
    }

    /**
     * استعراض محادثة محفوظة بكامل رسائلها ومراجعها الطبية مع التحقق الصارم من الملكية
     */
    public function show(int $id): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();
        if (!$user) {
            return $this->errorResponse('يجب تسجيل الدخول لعرض المحادثة.', 401);
        }

        $chat = AiChat::query()
            ->active()
            ->with(['messages.references', 'messages.feedback' => fn ($q) => $q->where('user_id', $user->id)])
            ->find($id);

        if (!$chat) {
            return $this->errorResponse('المحادثة المطلوبة غير موجودة أو تم حذفها.', 404);
        }

        if ((int) $chat->user_id !== (int) $user->id) {
            return $this->errorResponse('غير مصرح لك بالوصول إلى محادثات مستخدم آخر.', 403);
        }

        return $this->successResponse([
            'chat' => [
                'id' => $chat->id,
                'title' => $chat->title,
                'language' => $chat->language ?? 'ar',
                'last_message_preview' => $chat->last_message_preview,
                'last_message_at' => $chat->last_message_at?->toISOString(),
                'created_at' => $chat->created_at?->toISOString(),
                'messages' => $chat->messages->map(function (AiChatMessage $msg) {
                    $refs = $msg->references->map(fn (AiMessageReference $r) => [
                        'id' => $r->id,
                        'source_name' => $r->source_name,
                        'title' => $r->title,
                        'source_url' => $r->source_url,
                        'source_type' => $r->source_type,
                        'published_or_updated_at' => $r->published_or_updated_at,
                    ])->values()->all();

                    $myFeedback = $msg->feedback->first();

                    return [
                        'id' => $msg->id,
                        'sender' => $msg->sender,
                        'text' => $msg->message,
                        'retrieval_mode' => $msg->retrieval_mode ?? ($msg->meta['retrieval_mode'] ?? null),
                        'language' => $msg->language ?? 'ar',
                        'references' => $refs !== [] ? $refs : ($msg->meta['references'] ?? []),
                        'suggestions' => $msg->meta['suggestions'] ?? null,
                        'expert_assistance' => $msg->meta['expert_assistance'] ?? null,
                        'is_emergency' => (bool) ($msg->meta['is_emergency'] ?? false),
                        'user_feedback' => $myFeedback?->feedback_type,
                        'created_at' => $msg->created_at?->toISOString(),
                    ];
                }),
            ],
        ]);
    }

    /**
     * حذف آمن للمحادثة الخاصة بالمستخدم المسجل دون المساس بأي سجلات طبية أصلية (BR-12, BR-13, Scenario 10)
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();
        if (!$user) {
            return $this->errorResponse('يجب تسجيل الدخول لحذف المحادثات.', 401);
        }

        $chat = AiChat::query()->active()->find($id);
        if (!$chat) {
            return $this->errorResponse('المحادثة غير موجودة أو تم حذفها مسبقاً.', 404);
        }

        if ((int) $chat->user_id !== (int) $user->id) {
            return $this->errorResponse('غير مصرح لك بحذف محادثة مستخدم آخر.', 403);
        }

        DB::transaction(function () use ($chat, $user, $request) {
            // حذف رسائل المحادثة ومراجعها المرتبطة مع الاحتفاظ بسجل تدقيق الحذف الآمن دون المساس بأي روشتات أو مواعيد طبية
            $messageIds = $chat->messages()->pluck('id')->all();
            if ($messageIds !== []) {
                AiMessageReference::query()->whereIn('ai_chat_message_id', $messageIds)->delete();
                AiChatMessage::query()->whereIn('id', $messageIds)->delete();
            }

            $chat->update([
                'title' => '[Deleted Conversation]',
                'last_message_preview' => null,
                'status' => 'deleted',
                'deleted_at' => now(),
            ]);

            if (Schema::hasTable('medical_audit_logs')) {
                DB::table('medical_audit_logs')->insert([
                    'actor_user_id' => $user->id,
                    'actor_role' => $user->role ?? 'user',
                    'action' => 'ai_conversation_deleted',
                    'target_type' => 'ai_chat',
                    'target_id' => $chat->id,
                    'metadata' => json_encode([
                        'retention_days' => AiConfiguration::getInt('retention_days', 90),
                        'original_medical_records_preserved' => true,
                    ]),
                    'ip_address' => $request->ip(),
                    'created_at' => now(),
                ]);
            }
        });

        return $this->successResponse([
            'message' => 'تم حذف المحادثة بنجاح مع الحفاظ الكامل على سجلاتك الطبية الأصلية.',
            'deleted_chat_id' => $id,
        ]);
    }

    /**
     * إرسال سؤال للصيدلي الذكي (يدعم وضع الزائر المؤقت + وضع المستخدم المسجل المستمر)
     */
    public function ask(Request $request): JsonResponse
    {
        $maxLen = max(100, min(AiConfiguration::getInt('max_question_length', 1000), 4000));

        $validated = $request->validate([
            'question' => "required|string|max:{$maxLen}",
            'chat_id' => 'nullable|integer',
            'guest_session_token' => 'nullable|string|max:80',
        ]);

        $question = trim((string) $validated['question']);
        if ($question === '') {
            return $this->errorResponse('يرجى كتابة سؤالك قبل الإرسال.', 422);
        }

        /** @var User|null $user */
        $user = Auth::user();

        // ---------------- مسار الزائر (Guest Mode — BR-01..BR-04, Scenario 1, 2, 9) ----------------
        if (!$user) {
            if (!empty($validated['chat_id'])) {
                return $this->errorResponse('يجب تسجيل الدخول للوصول إلى المحادثات المحفوظة.', 401);
            }

            $this->purgeExpiredGuestSessions();
            $ttlMinutes = max(5, min(AiConfiguration::getInt('guest_session_ttl_minutes', 30), 240));
            $guestSession = null;
            $providedGuestToken = !empty($validated['guest_session_token'])
                ? trim((string) $validated['guest_session_token'])
                : null;

            if ($providedGuestToken !== null) {
                $guestSession = AiGuestSession::query()
                    ->where('session_token', $providedGuestToken)
                    ->first();

                if (!$guestSession || $guestSession->isExpired()) {
                    return $this->errorResponse(
                        'انتهت صلاحية جلسة الزائر المؤقتة. يرجى بدء محادثة جديدة.',
                        401,
                        ['code' => 'GUEST_SESSION_EXPIRED']
                    );
                }
            } else {
                $guestSession = AiGuestSession::create([
                    'session_token' => Str::random(48),
                    'language' => 'ar',
                    'context_messages' => [],
                    'status' => 'active',
                    'expires_at' => now()->addMinutes($ttlMinutes),
                ]);
            }

            $guestHistory = is_array($guestSession->context_messages) ? $guestSession->context_messages : [];
            $result = $this->aiChatService->askWithContext($question, null, $guestHistory, null);

            if ($result['unauthorized_blocked']) {
                return $this->errorResponse(
                    $result['answer'],
                    403,
                    [
                        'code' => 'UNAUTHORIZED_RECORD_ACCESS',
                        'answer' => $result['answer'],
                        'retrieval_mode' => 'restricted',
                    ]
                );
            }

            // تحديث السياق المؤقت لجلسة الزائر (دون حفظها إطلاقاً في جدول ai_chats الدائم)
            $guestHistory[] = ['sender' => 'user', 'text' => mb_substr($question, 0, 500, 'UTF-8')];
            $guestHistory[] = [
                'sender' => 'bot',
                'text' => mb_substr($result['answer'], 0, 800, 'UTF-8'),
                'retrieval_mode' => $result['retrieval_mode'],
            ];
            $guestSession->update([
                'language' => $result['language'],
                'context_messages' => array_slice($guestHistory, -8),
                'expires_at' => now()->addMinutes($ttlMinutes),
            ]);

            return $this->successResponse([
                'answer' => $result['answer'],
                'language' => $result['language'],
                'classification' => $result['classification'],
                'retrieval_mode' => $result['retrieval_mode'],
                'references' => $result['references'],
                'suggestions' => $result['suggestions'],
                'expert_assistance' => $result['expert_assistance'],
                'guest_restricted' => $result['guest_restricted'],
                'is_emergency' => $result['is_emergency'],
                'guest_session_token' => $guestSession->session_token,
                'guest_session_expires_at' => $guestSession->expires_at?->toISOString(),
                'chat_id' => null,
                'bot_message_id' => null,
                'saved' => false,
            ]);
        }

        // ---------------- مسار المستخدم المسجل (Authenticated Mode — BR-05, BR-11) ----------------
        // ملاحظة صارمة (BR-04): يتم تجاهل أي guest_session_token تماماً ولا تُنقل محادثات الزائر أبداً لحساب المستخدم!
        $existingChat = null;
        $conversationHistory = [];

        if (!empty($validated['chat_id'])) {
            $existingChat = AiChat::query()->active()->find((int) $validated['chat_id']);
            if (!$existingChat) {
                return $this->errorResponse('المحادثة المطلوبة غير موجودة أو تم حذفها.', 404);
            }
            if ((int) $existingChat->user_id !== (int) $user->id) {
                return $this->errorResponse('غير مصرح لك بالمتابعة في محادثة مستخدم آخر.', 403);
            }

            $conversationHistory = $existingChat->messages()
                ->reorder('id', 'desc')
                ->limit(8)
                ->get()
                ->reverse()
                ->map(fn (AiChatMessage $m) => [
                    'sender' => $m->sender,
                    'text' => $m->message,
                    'retrieval_mode' => $m->retrieval_mode,
                ])
                ->values()
                ->all();
        }

        $result = $this->aiChatService->askWithContext(
            $question,
            $user,
            $conversationHistory,
            $existingChat?->id
        );

        if ($result['unauthorized_blocked']) {
            return $this->errorResponse(
                $result['answer'],
                403,
                [
                    'code' => 'UNAUTHORIZED_RECORD_ACCESS',
                    'answer' => $result['answer'],
                    'retrieval_mode' => 'restricted',
                ]
            );
        }

        $savedBundle = DB::transaction(function () use ($user, $existingChat, $question, $result) {
            $now = now();
            $preview = mb_substr(preg_replace('/\s+/u', ' ', strip_tags($result['answer'])) ?? '', 0, 140, 'UTF-8');

            if (!$existingChat) {
                $existingChat = AiChat::create([
                    'user_id' => $user->id,
                    'title' => mb_substr($question, 0, 80, 'UTF-8'),
                    'language' => $result['language'],
                    'last_message_preview' => $preview,
                    'last_message_at' => $now,
                    'status' => 'active',
                ]);
            } else {
                $updates = [
                    'last_message_preview' => $preview,
                    'last_message_at' => $now,
                    'language' => $result['language'],
                ];
                if (in_array($existingChat->title, ['محادثة جديدة', 'New Consultation'], true)) {
                    $updates['title'] = mb_substr($question, 0, 80, 'UTF-8');
                }
                $existingChat->update($updates);
            }

            $existingChat->messages()->create([
                'sender' => 'user',
                'message' => $question,
                'language' => $result['language'],
                'status' => 'completed',
            ]);

            $meta = [
                'retrieval_mode' => $result['retrieval_mode'],
                'classification' => $result['classification'],
                'expert_assistance' => $result['expert_assistance'],
                'is_emergency' => $result['is_emergency'],
            ];
            if (!empty($result['suggestions']['medicines']) || !empty($result['suggestions']['doctors'])) {
                $meta['suggestions'] = $result['suggestions'];
            }
            if (!empty($result['references'])) {
                $meta['references'] = $result['references'];
            }

            /** @var AiChatMessage $botMessage */
            $botMessage = $existingChat->messages()->create([
                'sender' => 'bot',
                'message' => $result['answer'],
                'retrieval_mode' => $result['retrieval_mode'],
                'language' => $result['language'],
                'status' => 'completed',
                'response_time_ms' => $result['response_time_ms'],
                'meta' => $meta,
            ]);

            foreach ($result['references'] as $ref) {
                AiMessageReference::create([
                    'ai_chat_message_id' => $botMessage->id,
                    'source_name' => (string) $ref['source_name'],
                    'title' => $ref['title'] ?? null,
                    'source_url' => $ref['source_url'] ?? null,
                    'source_type' => (string) ($ref['source_type'] ?? 'medical_organization'),
                    'published_or_updated_at' => $ref['published_or_updated_at'] ?? null,
                ]);
            }

            return ['chat' => $existingChat, 'bot_message' => $botMessage];
        });

        /** @var AiChat $chat */
        $chat = $savedBundle['chat'];
        /** @var AiChatMessage $botMsg */
        $botMsg = $savedBundle['bot_message'];

        return $this->successResponse([
            'answer' => $result['answer'],
            'language' => $result['language'],
            'classification' => $result['classification'],
            'retrieval_mode' => $result['retrieval_mode'],
            'references' => $result['references'],
            'suggestions' => $result['suggestions'],
            'expert_assistance' => $result['expert_assistance'],
            'guest_restricted' => false,
            'is_emergency' => $result['is_emergency'],
            'chat_id' => $chat->id,
            'bot_message_id' => $botMsg->id,
            'saved' => true,
            'chat' => [
                'id' => $chat->id,
                'title' => $chat->title,
                'language' => $chat->language,
                'last_message_preview' => $chat->last_message_preview,
                'last_message_at' => $chat->last_message_at?->toISOString(),
                'created_at' => $chat->created_at?->toISOString(),
            ],
        ]);
    }

    /**
     * إنهاء وإتلاف جلسة الزائر المؤقتة فوراً عند انتهاء الجلسة (BR-03, Scenario 9)
     */
    public function endGuestSession(Request $request): JsonResponse
    {
        $token = trim((string) ($request->input('guest_session_token') ?? $request->header('X-Guest-Session-Token', '')));
        if ($token !== '') {
            AiGuestSession::query()
                ->where('session_token', $token)
                ->update([
                    'status' => 'expired',
                    'context_messages' => null,
                    'expires_at' => now()->subSecond(),
                ]);
        }

        return $this->successResponse([
            'expired' => true,
            'message' => 'تم إنهاء جلسة الزائر المؤقتة بنجاح.',
        ]);
    }

    /**
     * إرسال تقييم المستخدم (إيجابي / سلبي + تعليق اختياري) على إجابة المساعد الذكي
     */
    public function submitFeedback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'feedback_type' => 'required|in:positive,negative',
            'ai_chat_message_id' => 'nullable|integer',
            'category' => 'nullable|string|max:60',
            'comment' => 'nullable|string|max:1000',
            'retrieval_mode' => 'nullable|string|max:30',
            'language' => 'nullable|in:ar,en',
        ]);

        /** @var User|null $user */
        $user = Auth::user();
        $chatId = null;
        $messageId = !empty($validated['ai_chat_message_id']) ? (int) $validated['ai_chat_message_id'] : null;
        $retrievalMode = $validated['retrieval_mode'] ?? null;

        if ($messageId !== null) {
            $message = AiChatMessage::query()->with('chat')->find($messageId);
            if (!$message || !$message->chat) {
                return $this->errorResponse('الرسالة المحددة غير موجودة.', 404);
            }
            if (!$user || (int) $message->chat->user_id !== (int) $user->id) {
                return $this->errorResponse('غير مصرح بتقييم رسالة لا تخص حسابك.', 403);
            }
            $chatId = $message->ai_chat_id;
            $retrievalMode = $retrievalMode ?? $message->retrieval_mode;
        }

        $feedback = ($user && $messageId !== null)
            ? AiUserFeedback::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'ai_chat_message_id' => $messageId,
                ],
                [
                    'ai_chat_id' => $chatId,
                    'feedback_type' => $validated['feedback_type'],
                    'category' => $validated['category'] ?? null,
                    'comment' => isset($validated['comment']) ? trim($validated['comment']) : null,
                    'retrieval_mode' => $retrievalMode,
                    'language' => $validated['language'] ?? 'ar',
                    'admin_status' => 'new',
                ]
            )
            : AiUserFeedback::create([
                'user_id' => $user?->id,
                'ai_chat_id' => $chatId,
                'ai_chat_message_id' => $messageId,
                'feedback_type' => $validated['feedback_type'],
                'category' => $validated['category'] ?? null,
                'comment' => isset($validated['comment']) ? trim($validated['comment']) : null,
                'retrieval_mode' => $retrievalMode,
                'language' => $validated['language'] ?? 'ar',
                'admin_status' => 'new',
            ]);

        return $this->successResponse([
            'message' => 'شكراً لملاحظاتك! تساعدنا تقييماتك على تطوير دقة الصيدلي الذكي.',
            'feedback' => [
                'id' => $feedback->id,
                'feedback_type' => $feedback->feedback_type,
                'ai_chat_message_id' => $feedback->ai_chat_message_id,
            ],
        ], 201);
    }

    private function purgeExpiredGuestSessions(): void
    {
        try {
            AiGuestSession::query()
                ->where('expires_at', '<', now())
                ->where('status', 'active')
                ->update([
                    'status' => 'expired',
                    'context_messages' => null,
                ]);
        } catch (\Throwable) {
            // Safe no-op
        }
    }
}
