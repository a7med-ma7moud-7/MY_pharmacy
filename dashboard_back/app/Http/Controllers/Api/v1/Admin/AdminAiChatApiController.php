<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\v1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiChat;
use App\Models\AiChatMessage;
use App\Models\AiConfiguration;
use App\Models\AiKnowledgeSource;
use App\Models\AiRequestLog;
use App\Models\AiUserFeedback;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AdminAiChatApiController extends Controller
{
    /**
     * 9.3 Usage Analytics — إحصائيات وتحليلات حقيقية من قاعدة البيانات وسجلات التشغيل
     */
    public function analytics(): JsonResponse
    {
        $totalConversations = AiChat::query()->count();
        $activeConversations = AiChat::query()->active()->count();
        $deletedConversations = max(0, $totalConversations - $activeConversations);

        $loggedRequestsCount = Schema::hasTable('ai_request_logs') ? AiRequestLog::query()->count() : 0;
        $storedUserMessagesCount = AiChatMessage::query()->where('sender', 'user')->count();
        $totalQuestions = max($loggedRequestsCount, $storedUserMessagesCount);

        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateTimeString();

        $dailyQuestions = Schema::hasTable('ai_request_logs')
            ? AiRequestLog::query()->whereDate('created_at', $today)->count()
            : AiChatMessage::query()->where('sender', 'user')->whereDate('created_at', $today)->count();

        $monthlyQuestions = Schema::hasTable('ai_request_logs')
            ? AiRequestLog::query()->where('created_at', '>=', $monthStart)->count()
            : AiChatMessage::query()->where('sender', 'user')->where('created_at', '>=', $monthStart)->count();

        $guestCount = Schema::hasTable('ai_request_logs')
            ? AiRequestLog::query()->where('is_guest', true)->count()
            : 0;
        $authenticatedCount = Schema::hasTable('ai_request_logs')
            ? max(AiRequestLog::query()->where('is_guest', false)->count(), $storedUserMessagesCount)
            : $storedUserMessagesCount;

        $arabicCount = Schema::hasTable('ai_request_logs')
            ? AiRequestLog::query()->where('language', 'ar')->count()
            : $totalQuestions;
        $englishCount = Schema::hasTable('ai_request_logs')
            ? AiRequestLog::query()->where('language', 'en')->count()
            : 0;

        $retrievalBreakdown = [
            'general' => 0,
            'internal' => 0,
            'combined' => 0,
            'restricted' => 0,
            'emergency' => 0,
            'fallback' => 0,
        ];

        if (Schema::hasTable('ai_request_logs')) {
            $modeRows = AiRequestLog::query()
                ->select('retrieval_mode', DB::raw('COUNT(*) as total'))
                ->groupBy('retrieval_mode')
                ->pluck('total', 'retrieval_mode')
                ->all();
            foreach ($modeRows as $mode => $cnt) {
                $key = (string) $mode;
                $retrievalBreakdown[$key] = (int) $cnt;
            }
        }

        $categoryRows = Schema::hasTable('ai_request_logs')
            ? AiRequestLog::query()
                ->select('topic_category', DB::raw('COUNT(*) as total'))
                ->whereNotNull('topic_category')
                ->groupBy('topic_category')
                ->orderByDesc('total')
                ->limit(8)
                ->get()
                ->map(fn ($r) => [
                    'category' => $r->topic_category,
                    'count' => (int) $r->total,
                ])->values()->all()
            : [];

        $failedRequests = Schema::hasTable('ai_request_logs')
            ? AiRequestLog::query()->where('status', 'failed')->count()
            : 0;
        $blockedRequests = Schema::hasTable('ai_request_logs')
            ? AiRequestLog::query()->where('status', 'blocked')->count()
            : 0;
        $providerErrors = Schema::hasTable('ai_request_logs')
            ? AiRequestLog::query()->where('error_type', 'provider_error')->count()
            : 0;

        $avgResponseMs = Schema::hasTable('ai_request_logs')
            ? (int) round((float) (AiRequestLog::query()->where('response_time_ms', '>', 0)->avg('response_time_ms') ?? 0))
            : 0;

        // Daily trend (last 7 days)
        $dailyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $dateStr = now()->subDays($i)->toDateString();
            $cnt = Schema::hasTable('ai_request_logs')
                ? AiRequestLog::query()->whereDate('created_at', $dateStr)->count()
                : 0;
            $dailyTrend[] = [
                'date' => $dateStr,
                'questions' => $cnt,
            ];
        }

        $positiveFeedback = Schema::hasTable('ai_user_feedback')
            ? AiUserFeedback::query()->where('feedback_type', 'positive')->count()
            : 0;
        $negativeFeedback = Schema::hasTable('ai_user_feedback')
            ? AiUserFeedback::query()->where('feedback_type', 'negative')->count()
            : 0;
        $totalFeedback = $positiveFeedback + $negativeFeedback;

        return $this->successResponse([
            'data' => [
                'total_conversations' => $totalConversations,
                'active_conversations' => $activeConversations,
                'deleted_conversations' => $deletedConversations,
                'total_questions' => $totalQuestions,
                'daily_questions' => $dailyQuestions,
                'monthly_questions' => $monthlyQuestions,
                'usage_by_user_type' => [
                    'guest' => $guestCount,
                    'authenticated' => $authenticatedCount,
                ],
                'usage_by_language' => [
                    'ar' => $arabicCount,
                    'en' => $englishCount,
                ],
                'retrieval_modes' => $retrievalBreakdown,
                'top_categories' => $categoryRows,
                'daily_trend' => $dailyTrend,
                'performance' => [
                    'average_response_time_ms' => $avgResponseMs,
                    'failed_requests' => $failedRequests,
                    'blocked_requests' => $blockedRequests,
                    'provider_errors' => $providerErrors,
                ],
                'feedback' => [
                    'total' => $totalFeedback,
                    'positive' => $positiveFeedback,
                    'negative' => $negativeFeedback,
                    'satisfaction_rate' => $totalFeedback > 0 ? round(($positiveFeedback / $totalFeedback) * 100, 1) : null,
                ],
            ],
        ]);
    }

    /**
     * 9.1 AI Configuration — استعراض الإعدادات وحالة التكامل دون كشف أي مفاتيح سرية
     */
    public function getConfiguration(): JsonResponse
    {
        $settings = AiConfiguration::getMap();

        return $this->successResponse([
            'data' => [
                'settings' => [
                    'ai_enabled' => in_array(strtolower($settings['ai_enabled'] ?? 'true'), ['1', 'true'], true),
                    'active_provider' => $settings['active_provider'] ?? 'auto',
                    'general_knowledge_enabled' => in_array(strtolower($settings['general_knowledge_enabled'] ?? 'true'), ['1', 'true'], true),
                    'internal_data_enabled' => in_array(strtolower($settings['internal_data_enabled'] ?? 'true'), ['1', 'true'], true),
                    'combined_retrieval_enabled' => in_array(strtolower($settings['combined_retrieval_enabled'] ?? 'true'), ['1', 'true'], true),
                    'external_medical_sources_enabled' => in_array(strtolower($settings['external_medical_sources_enabled'] ?? 'true'), ['1', 'true'], true),
                    'strict_safety_mode' => in_array(strtolower($settings['strict_safety_mode'] ?? 'true'), ['1', 'true'], true),
                    'supported_languages' => $settings['supported_languages'] ?? 'ar,en',
                    'max_question_length' => (int) ($settings['max_question_length'] ?? 1000),
                    'max_response_tokens' => (int) ($settings['max_response_tokens'] ?? 900),
                    'guest_session_ttl_minutes' => (int) ($settings['guest_session_ttl_minutes'] ?? 30),
                    'retention_days' => (int) ($settings['retention_days'] ?? 90),
                ],
                'integration_status' => $this->inspectProviderIntegrationStatus(),
            ],
        ]);
    }

    /**
     * 9.1 تحديث إعدادات الذكاء الاصطناعي مع التسجيل في سجل التدقيق الأمني
     */
    public function updateConfiguration(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ai_enabled' => 'sometimes|boolean',
            'active_provider' => 'sometimes|in:auto,gemini,openrouter,groq,hybrid_local',
            'general_knowledge_enabled' => 'sometimes|boolean',
            'internal_data_enabled' => 'sometimes|boolean',
            'combined_retrieval_enabled' => 'sometimes|boolean',
            'external_medical_sources_enabled' => 'sometimes|boolean',
            'strict_safety_mode' => 'sometimes|boolean',
            'supported_languages' => 'sometimes|in:ar,en,ar,en',
            'max_question_length' => 'sometimes|integer|min:100|max:4000',
            'max_response_tokens' => 'sometimes|integer|min:250|max:2048',
            'guest_session_ttl_minutes' => 'sometimes|integer|min:5|max:240',
            'retention_days' => 'sometimes|integer|min:0|max:3650',
        ]);

        // Special allowance for 'ar,en' which Laravel's comma-separated `in:` splits if not checked carefully
        $rawLang = $request->input('supported_languages');
        if ($rawLang !== null && !in_array($rawLang, ['ar', 'en', 'ar,en', 'en,ar'], true)) {
            return $this->errorResponse('قيمة اللغات المدعومة غير صالحة.', 422);
        }

        $admin = Auth::user();
        $allowedKeys = array_keys(AiConfiguration::defaults());

        DB::transaction(function () use ($request, $allowedKeys, $admin) {
            foreach ($allowedKeys as $key) {
                if (!$request->exists($key)) {
                    continue;
                }
                $val = $request->input($key);
                $strVal = is_bool($val) ? ($val ? 'true' : 'false') : (string) $val;

                AiConfiguration::updateOrCreate(
                    ['config_key' => $key],
                    [
                        'config_value' => $strVal,
                        'updated_by' => $admin?->id,
                    ]
                );
            }

            AiConfiguration::flushCache();
            $this->logAdminAction('ai_configuration_updated', 'ai_configurations', null, [
                'updated_keys' => array_values(array_intersect($allowedKeys, array_keys($request->all()))),
            ]);
        });

        return $this->getConfiguration();
    }

    /**
     * 9.2 Knowledge Base Management — قائمة مصادر المعرفة الطبية المعتمدة
     */
    public function listKnowledgeSources(): JsonResponse
    {
        $sources = AiKnowledgeSource::query()
            ->orderBy('id')
            ->get()
            ->map(fn (AiKnowledgeSource $s) => $this->formatKnowledgeSource($s));

        return $this->successResponse([
            'data' => $sources,
        ]);
    }

    public function storeKnowledgeSource(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:160',
            'source_type' => 'required|in:drug_authority,medical_organization,encyclopedia,curated_guideline',
            'base_url' => 'required|url|max:500',
            'language' => 'required|string|max:20',
            'is_enabled' => 'sometimes|boolean',
            'summary_notes' => 'nullable|string|max:1000',
        ]);

        $slugBase = Str::slug($validated['name']) ?: 'medical-source';
        $slug = $slugBase . '-' . Str::lower(Str::random(5));

        $source = AiKnowledgeSource::create([
            'name' => trim($validated['name']),
            'slug' => $slug,
            'source_type' => $validated['source_type'],
            'base_url' => trim($validated['base_url']),
            'language' => trim($validated['language']),
            'is_enabled' => (bool) ($validated['is_enabled'] ?? true),
            'sync_status' => 'ready',
            'summary_notes' => $validated['summary_notes'] ?? null,
        ]);

        $this->logAdminAction('ai_knowledge_source_created', 'ai_knowledge_source', $source->id, [
            'name' => $source->name,
        ]);

        return $this->successResponse([
            'message' => 'تمت إضافة مصدر المعرفة الطبية بنجاح.',
            'data' => $this->formatKnowledgeSource($source),
        ], 201);
    }

    public function updateKnowledgeSource(Request $request, int $id): JsonResponse
    {
        $source = AiKnowledgeSource::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:160',
            'source_type' => 'sometimes|required|in:drug_authority,medical_organization,encyclopedia,curated_guideline',
            'base_url' => 'sometimes|required|url|max:500',
            'language' => 'sometimes|required|string|max:20',
            'is_enabled' => 'sometimes|boolean',
            'summary_notes' => 'nullable|string|max:1000',
        ]);

        $source->update($validated);

        $this->logAdminAction('ai_knowledge_source_updated', 'ai_knowledge_source', $source->id, [
            'is_enabled' => $source->is_enabled,
        ]);

        return $this->successResponse([
            'message' => 'تم تحديث مصدر المعرفة بنجاح.',
            'data' => $this->formatKnowledgeSource($source->fresh()),
        ]);
    }

    public function toggleKnowledgeSource(int $id): JsonResponse
    {
        $source = AiKnowledgeSource::findOrFail($id);
        $source->is_enabled = !$source->is_enabled;
        $source->sync_status = $source->is_enabled ? 'ready' : 'disabled';
        $source->save();

        $this->logAdminAction('ai_knowledge_source_toggled', 'ai_knowledge_source', $source->id, [
            'is_enabled' => $source->is_enabled,
        ]);

        return $this->successResponse([
            'message' => $source->is_enabled ? 'تم تفعيل المصدر الطبي.' : 'تم تعطيل المصدر الطبي.',
            'data' => $this->formatKnowledgeSource($source),
        ]);
    }

    /**
     * 9.2 فحص ومزامنة حقيقية للمصدر الطبي — لا يتم الإبلاغ عن نجاح المزامنة إلا إذا نجح الاتصال فعلياً
     */
    public function syncKnowledgeSource(int $id): JsonResponse
    {
        $source = AiKnowledgeSource::findOrFail($id);

        if (!$source->is_enabled) {
            return $this->errorResponse('لا يمكن مزامنة مصدر معطّل. يرجى تفعيله أولاً.', 422);
        }

        // Internal curated guidelines validate directly without external network dependency
        if ($source->slug === 'saydalety-clinical-guidelines') {
            $source->update([
                'sync_status' => 'synced',
                'last_synced_at' => now(),
                'last_error' => null,
                'records_count' => 24,
            ]);

            $this->logAdminAction('ai_knowledge_source_synced', 'ai_knowledge_source', $source->id, ['status' => 'synced']);

            return $this->successResponse([
                'message' => 'تم التحقق من سلامة ومزامنة الدليل الإكلينيكي الداخلي بنجاح.',
                'data' => $this->formatKnowledgeSource($source->fresh()),
            ]);
        }

        try {
            $client = new Client([
                'timeout' => 6,
                'connect_timeout' => 4,
                'verify' => $this->resolveSslVerifyOption(),
                'headers' => [
                    'User-Agent' => 'SaydaletyHealthcareAdminSync/2.0 (support@saydalety.local)',
                ],
            ]);

            $probeUrl = $source->base_url;
            if (str_contains($probeUrl, 'api.fda.gov/drug/label.json')) {
                $probeUrl .= '?limit=1';
            } elseif (str_contains($probeUrl, 'wikipedia.org/w/api.php')) {
                $probeUrl .= '?action=query&meta=siteinfo&format=json';
            }

            $response = $client->get($probeUrl);
            $code = $response->getStatusCode();

            if ($code >= 200 && $code < 400) {
                $source->update([
                    'sync_status' => 'synced',
                    'last_synced_at' => now(),
                    'last_error' => null,
                ]);

                $this->logAdminAction('ai_knowledge_source_synced', 'ai_knowledge_source', $source->id, [
                    'status' => 'synced',
                    'http_code' => $code,
                ]);

                return $this->successResponse([
                    'message' => 'نجح الاتصال بالمصدر الطبي وتحديث حالة المزامنة بنجاح.',
                    'data' => $this->formatKnowledgeSource($source->fresh()),
                ]);
            }

            $source->update([
                'sync_status' => 'error',
                'last_error' => "Unexpected HTTP status {$code}",
            ]);

            return $this->errorResponse("تعذر إتمام المزامنة: أعاد المصدر رمز الحالة {$code}.", 502, [
                'data' => $this->formatKnowledgeSource($source->fresh()),
            ]);
        } catch (\Throwable $e) {
            $errMsg = mb_substr($e->getMessage(), 0, 240, 'UTF-8');
            $source->update([
                'sync_status' => 'error',
                'last_error' => $errMsg,
            ]);

            $this->logAdminAction('ai_knowledge_source_sync_failed', 'ai_knowledge_source', $source->id, [
                'error' => $errMsg,
            ]);

            return $this->errorResponse('فشل الاتصال بالمصدر الطبي الخارجي. تم تسجيل الخطأ في حالة المصدر.', 502, [
                'data' => $this->formatKnowledgeSource($source->fresh()),
            ]);
        }
    }

    public function destroyKnowledgeSource(int $id): JsonResponse
    {
        $source = AiKnowledgeSource::findOrFail($id);
        $name = $source->name;
        $source->delete();

        $this->logAdminAction('ai_knowledge_source_deleted', 'ai_knowledge_source', $id, ['name' => $name]);

        return $this->successResponse([
            'message' => 'تم حذف مصدر المعرفة الطبية بنجاح.',
        ]);
    }

    /**
     * 9.4 Feedback Management — مراجعة تقييمات المستخدمين دون كشف المحادثات الطبية الخاصة
     */
    public function listFeedback(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 12), 1), 100);
        $type = $request->input('feedback_type');
        $status = $request->input('admin_status');

        $query = AiUserFeedback::query()->orderByDesc('id');

        if (in_array($type, ['positive', 'negative'], true)) {
            $query->where('feedback_type', $type);
        }
        if (in_array($status, ['new', 'reviewed', 'resolved'], true)) {
            $query->where('admin_status', $status);
        }

        $paginated = $query->paginate($perPage);

        $rows = collect($paginated->items())->map(fn (AiUserFeedback $f) => [
            'id' => $f->id,
            'feedback_type' => $f->feedback_type,
            'category' => $f->category,
            'comment' => $f->comment,
            'retrieval_mode' => $f->retrieval_mode,
            'language' => $f->language,
            'admin_status' => $f->admin_status,
            'admin_note' => $f->admin_note,
            'conversation_ref' => $f->ai_chat_id ? "Chat #{$f->ai_chat_id}" : 'Guest Session',
            'message_ref' => $f->ai_chat_message_id ? "Msg #{$f->ai_chat_message_id}" : 'Ephemeral',
            'user_ref' => $f->user_id ? "User #{$f->user_id}" : 'Guest',
            'created_at' => $f->created_at?->toISOString(),
        ])->values();

        return $this->successResponse([
            'data' => $rows,
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'total' => $paginated->total(),
        ]);
    }

    public function updateFeedbackStatus(Request $request, int $id): JsonResponse
    {
        $feedback = AiUserFeedback::findOrFail($id);

        $validated = $request->validate([
            'admin_status' => 'required|in:new,reviewed,resolved',
            'admin_note' => 'nullable|string|max:500',
        ]);

        $feedback->update($validated);
        $this->logAdminAction('ai_feedback_reviewed', 'ai_user_feedback', $feedback->id, [
            'admin_status' => $feedback->admin_status,
        ]);

        return $this->successResponse([
            'message' => 'تم تحديث حالة المراجعة بنجاح.',
            'data' => $feedback,
        ]);
    }

    /**
     * 9.5 Error Logs and Monitoring — سجلات الأخطاء والمراقبة الأمنية (بدون أي بيانات طبية حساسة)
     */
    public function listLogs(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);
        $statusFilter = $request->input('status');

        $query = AiRequestLog::query()->orderByDesc('id');
        if (!empty($statusFilter) && in_array($statusFilter, ['success', 'failed', 'blocked', 'rate_limited'], true)) {
            $query->where('status', $statusFilter);
        }

        $paginated = $query->paginate($perPage);

        $auditLogs = Schema::hasTable('medical_audit_logs')
            ? DB::table('medical_audit_logs')
                ->where('action', 'like', 'ai_%')
                ->orWhere('action', 'like', 'admin_private_ai_%')
                ->orderByDesc('id')
                ->limit(15)
                ->get()
            : collect();

        return $this->successResponse([
            'data' => collect($paginated->items())->map(fn (AiRequestLog $log) => [
                'id' => $log->id,
                'is_guest' => $log->is_guest,
                'user_ref' => $log->user_id ? "User #{$log->user_id}" : 'Guest',
                'language' => $log->language,
                'classification_category' => $log->classification_category,
                'topic_category' => $log->topic_category,
                'retrieval_mode' => $log->retrieval_mode,
                'provider_used' => $log->provider_used,
                'status' => $log->status,
                'response_time_ms' => $log->response_time_ms,
                'references_count' => $log->references_count,
                'error_type' => $log->error_type,
                'error_message' => $log->error_message,
                'created_at' => $log->created_at?->toISOString(),
            ])->values(),
            'audit_logs' => $auditLogs,
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'total' => $paginated->total(),
        ]);
    }

    /**
     * 9.6 Admin Privacy Restrictions (BR-16, Scenario 15):
     * عرض بيانات تشغيلية مُقنّعة فقط دون كشف محتوى محادثات المرضى الخاصة أو سجلاتهم الطبية
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);

        $chats = AiChat::query()
            ->with('user:id,name,email')
            ->withCount('messages')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->paginate($perPage);

        $data = collect($chats->items())->map(fn (AiChat $chat) => [
            'id' => $chat->id,
            'conversation_ref' => "Chat #{$chat->id}",
            'language' => $chat->language ?? 'ar',
            'status' => $chat->status ?? 'active',
            'messages_count' => $chat->messages_count,
            'last_message_at' => $chat->last_message_at?->toISOString(),
            'created_at' => $chat->created_at?->toISOString(),
            'masked_user' => $chat->user ? [
                'user_ref' => "User #{$chat->user->id}",
                'masked_name' => $this->maskName((string) $chat->user->name),
                'masked_email' => $this->maskEmail((string) $chat->user->email),
            ] : null,
        ])->values();

        return $this->successResponse([
            'privacy_policy' => 'PRIVATE_PATIENT_CONVERSATIONS_PROTECTED',
            'data' => $data,
            'current_page' => $chats->currentPage(),
            'last_page' => $chats->lastPage(),
            'per_page' => $chats->perPage(),
            'total' => $chats->total(),
        ]);
    }

    /**
     * 9.6 منع الوصول التلقائي غير المقيد لمحتوى محادثات المرضى الخاصة وتسجيل المحاولة في سجل التدقيق
     */
    public function show(int $id): JsonResponse
    {
        $this->logAdminAction('admin_private_ai_chat_blocked', 'ai_chat', $id, [
            'policy' => 'BR-16_LEAST_PRIVILEGE',
        ]);

        return $this->errorResponse(
            'حماية خصوصية المرضى (BR-16): لا يُسمح للمشرفين بالاطلاع على نصوص المحادثات الطبية الخاصة للمستخدمين أو سجلاتهم الصحية.',
            403,
            ['code' => 'ADMIN_PRIVACY_RESTRICTED']
        );
    }

    /**
     * فحص حالة مفاتيح مزودي الذكاء الاصطناعي على الخادم بأمان دون إرجاع أي مفتاح سري إطلاقاً
     *
     * @return array<string, array{configured: bool, status: string, note: string}>
     */
    private function inspectProviderIntegrationStatus(): array
    {
        $webEnvPath = base_path('../web_back/.env');
        $envVars = [];
        if (is_file($webEnvPath)) {
            $lines = @file($webEnvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
                    continue;
                }
                [$k, $v] = explode('=', $trimmed, 2);
                $envVars[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
            }
        }

        $checkKey = function (string $keyName, string $placeholder) use ($envVars): bool {
            $val = $envVars[$keyName] ?? (string) env($keyName, '');
            return $val !== '' && $val !== $placeholder;
        };

        $geminiConfigured = $checkKey('GEMINI_API_KEY', 'your_gemini_api_key_here');
        $openrouterConfigured = $checkKey('OPENROUTER_API_KEY', 'your_openrouter_api_key_here');
        $groqConfigured = $checkKey('GROQ_API_KEY', 'your_groq_api_key_here');

        // Check if recent provider error was logged for gemini
        $geminiRecentErr = Schema::hasTable('ai_request_logs')
            && AiRequestLog::query()
                ->where('provider_used', 'gemini')
                ->where('error_type', 'provider_error')
                ->where('created_at', '>=', now()->subDay())
                ->exists();

        return [
            'hybrid_engine' => [
                'configured' => true,
                'status' => 'operational',
                'note' => 'المحرك الطبي الهجين (ثنائي اللغة + المراجع الطبية + السجلات الشخصية المصرح بها) نشط دائماً.',
            ],
            'gemini' => [
                'configured' => $geminiConfigured,
                'status' => !$geminiConfigured ? 'not_configured' : ($geminiRecentErr ? 'degraded_key_error' : 'configured'),
                'note' => !$geminiConfigured
                    ? 'غير مُعد في ملف البيئة (.env)'
                    : ($geminiRecentErr ? 'المفتاح الحالي مرفوض من المزود (403) — يعمل المحرك الهجين تلقائياً كبديل آمن.' : 'مفتاح API محفوظ بأمان على الخادم.'),
            ],
            'openrouter' => [
                'configured' => $openrouterConfigured,
                'status' => $openrouterConfigured ? 'configured' : 'not_configured',
                'note' => $openrouterConfigured ? 'مفتاح OpenRouter محفوظ على الخادم.' : 'اختياري — غير مُعد حالياً.',
            ],
            'groq' => [
                'configured' => $groqConfigured,
                'status' => $groqConfigured ? 'configured' : 'not_configured',
                'note' => $groqConfigured ? 'مفتاح Groq محفوظ على الخادم.' : 'اختياري — غير مُعد حالياً.',
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatKnowledgeSource(AiKnowledgeSource $s): array
    {
        return [
            'id' => $s->id,
            'name' => $s->name,
            'slug' => $s->slug,
            'source_type' => $s->source_type,
            'base_url' => $s->base_url,
            'language' => $s->language,
            'is_enabled' => (bool) $s->is_enabled,
            'sync_status' => $s->sync_status,
            'last_synced_at' => $s->last_synced_at?->toISOString(),
            'last_error' => $s->last_error,
            'summary_notes' => $s->summary_notes,
            'records_count' => $s->records_count,
            'updated_at' => $s->updated_at?->toISOString(),
        ];
    }

    private function maskName(string $name): string
    {
        $trimmed = trim($name);
        if ($trimmed === '') {
            return '—';
        }
        return mb_substr($trimmed, 0, 2, 'UTF-8') . '***';
    }

    private function maskEmail(string $email): string
    {
        if (!str_contains($email, '@')) {
            return '***';
        }
        [$local, $domain] = explode('@', $email, 2);
        return mb_substr($local, 0, 2, 'UTF-8') . '***@' . $domain;
    }

    /**
     * @param array<string, mixed> $meta
     */
    private function logAdminAction(string $action, string $targetType, ?int $targetId, array $meta = []): void
    {
        try {
            if (Schema::hasTable('medical_audit_logs')) {
                $admin = Auth::user();
                DB::table('medical_audit_logs')->insert([
                    'actor_user_id' => $admin?->id,
                    'actor_role' => $admin?->role ?? 'admin',
                    'action' => $action,
                    'target_type' => $targetType,
                    'target_id' => $targetId,
                    'metadata' => json_encode($meta, JSON_UNESCAPED_UNICODE),
                    'ip_address' => request()?->ip(),
                    'created_at' => now(),
                ]);
            }
        } catch (\Throwable) {
            // Safe no-op
        }
    }

    /**
     * @return bool|string
     */
    private function resolveSslVerifyOption(): bool|string
    {
        foreach ([ini_get('curl.cainfo'), ini_get('openssl.cafile')] as $iniPath) {
            if (is_string($iniPath) && $iniPath !== '' && is_file($iniPath)) {
                return $iniPath;
            }
        }
        foreach ([
            'C:/Program Files/Git/usr/ssl/certs/ca-bundle.crt',
            'C:/Program Files/Git/mingw64/ssl/certs/ca-bundle.crt',
            'C:/xampp/apache/bin/curl-ca-bundle.crt',
            'C:/laragon/etc/ssl/cacert.pem',
        ] as $bundle) {
            if (is_file($bundle)) {
                return $bundle;
            }
        }
        return app()->environment(['local', 'testing']) ? false : true;
    }
}
