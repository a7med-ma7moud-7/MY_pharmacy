<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Extend ai_chats for language, preview, and secure retention-aware deletion status
        if (Schema::hasTable('ai_chats')) {
            Schema::table('ai_chats', function (Blueprint $table) {
                if (!Schema::hasColumn('ai_chats', 'language')) {
                    $table->string('language', 10)->default('ar')->after('title');
                }
                if (!Schema::hasColumn('ai_chats', 'last_message_preview')) {
                    $table->string('last_message_preview', 255)->nullable()->after('language');
                }
                if (!Schema::hasColumn('ai_chats', 'status')) {
                    $table->string('status', 25)->default('active')->index()->after('last_message_at');
                }
                if (!Schema::hasColumn('ai_chats', 'deleted_at')) {
                    $table->timestamp('deleted_at')->nullable()->after('status');
                }
            });
        }

        // 2. Extend ai_chat_messages with retrieval_mode, language, status, and latency
        if (Schema::hasTable('ai_chat_messages')) {
            Schema::table('ai_chat_messages', function (Blueprint $table) {
                if (!Schema::hasColumn('ai_chat_messages', 'retrieval_mode')) {
                    $table->string('retrieval_mode', 30)->nullable()->index()->after('message');
                }
                if (!Schema::hasColumn('ai_chat_messages', 'language')) {
                    $table->string('language', 10)->default('ar')->after('retrieval_mode');
                }
                if (!Schema::hasColumn('ai_chat_messages', 'status')) {
                    $table->string('status', 25)->default('completed')->after('language');
                }
                if (!Schema::hasColumn('ai_chat_messages', 'response_time_ms')) {
                    $table->unsignedInteger('response_time_ms')->nullable()->after('status');
                }
            });
        }

        // 3. Ephemeral Guest AI Sessions (Strictly isolated from user accounts; expires when session ends)
        if (!Schema::hasTable('ai_guest_sessions')) {
            Schema::create('ai_guest_sessions', function (Blueprint $table) {
                $table->id();
                $table->string('session_token', 80)->unique();
                $table->string('language', 10)->default('ar');
                $table->json('context_messages')->nullable();
                $table->string('status', 25)->default('active')->index();
                $table->timestamp('expires_at')->index();
                $table->timestamps();
            });
        }

        // 4. AI Message Medical References
        if (!Schema::hasTable('ai_message_references')) {
            Schema::create('ai_message_references', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ai_chat_message_id')
                    ->constrained('ai_chat_messages')
                    ->cascadeOnDelete();
                $table->string('source_name', 180);
                $table->string('title', 255)->nullable();
                $table->string('source_url', 500)->nullable();
                $table->string('source_type', 60)->default('medical_organization');
                $table->string('published_or_updated_at', 60)->nullable();
                $table->timestamps();

                $table->index('ai_chat_message_id', 'idx_ai_msg_refs_msg');
            });
        }

        // 5. AI User Feedback (Privacy-safe feedback without exposing private clinical transcripts)
        if (!Schema::hasTable('ai_user_feedback')) {
            Schema::create('ai_user_feedback', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->unsignedBigInteger('ai_chat_id')->nullable()->index();
                $table->unsignedBigInteger('ai_chat_message_id')->nullable()->index();
                $table->string('feedback_type', 20)->index(); // 'positive' | 'negative'
                $table->string('category', 60)->nullable();
                $table->string('comment', 1000)->nullable();
                $table->string('retrieval_mode', 30)->nullable();
                $table->string('language', 10)->default('ar');
                $table->string('admin_status', 30)->default('new')->index(); // 'new' | 'reviewed' | 'resolved'
                $table->string('admin_note', 500)->nullable();
                $table->timestamps();
            });
        }

        // 6. AI Configuration Settings
        if (!Schema::hasTable('ai_configurations')) {
            Schema::create('ai_configurations', function (Blueprint $table) {
                $table->id();
                $table->string('config_key', 80)->unique();
                $table->text('config_value')->nullable();
                $table->string('value_type', 25)->default('string');
                $table->string('group_name', 40)->default('general');
                $table->unsignedBigInteger('updated_by')->nullable();
                $table->timestamps();
            });
        }

        // 7. Approved Medical Knowledge Sources
        if (!Schema::hasTable('ai_knowledge_sources')) {
            Schema::create('ai_knowledge_sources', function (Blueprint $table) {
                $table->id();
                $table->string('name', 160);
                $table->string('slug', 80)->unique();
                $table->string('source_type', 50)->default('medical_organization');
                $table->string('base_url', 500);
                $table->string('language', 20)->default('ar,en');
                $table->boolean('is_enabled')->default(true)->index();
                $table->string('sync_status', 30)->default('ready')->index();
                $table->timestamp('last_synced_at')->nullable();
                $table->string('last_error', 500)->nullable();
                $table->text('summary_notes')->nullable();
                $table->unsignedInteger('records_count')->default(0);
                $table->timestamps();
            });
        }

        // 8. AI Operational Telemetry & Error Monitoring Logs (Zero PII / Zero Medical Content)
        if (!Schema::hasTable('ai_request_logs')) {
            Schema::create('ai_request_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->boolean('is_guest')->default(true)->index();
                $table->unsignedBigInteger('ai_chat_id')->nullable()->index();
                $table->string('language', 10)->default('ar')->index();
                $table->string('classification_category', 35)->index();
                $table->string('topic_category', 50)->nullable()->index();
                $table->string('retrieval_mode', 35)->index();
                $table->string('provider_used', 40)->nullable();
                $table->string('status', 25)->default('success')->index();
                $table->unsignedInteger('response_time_ms')->default(0);
                $table->unsignedInteger('references_count')->default(0);
                $table->string('error_type', 60)->nullable()->index();
                $table->string('error_message', 500)->nullable();
                $table->timestamp('created_at')->useCurrent()->index();
            });
        }

        $this->seedDefaults();
    }

    private function seedDefaults(): void
    {
        $now = now();

        if (Schema::hasTable('ai_configurations') && DB::table('ai_configurations')->count() === 0) {
            $defaults = [
                ['config_key' => 'ai_enabled', 'config_value' => 'true', 'value_type' => 'boolean', 'group_name' => 'service'],
                ['config_key' => 'active_provider', 'config_value' => 'auto', 'value_type' => 'string', 'group_name' => 'service'],
                ['config_key' => 'general_knowledge_enabled', 'config_value' => 'true', 'value_type' => 'boolean', 'group_name' => 'retrieval'],
                ['config_key' => 'internal_data_enabled', 'config_value' => 'true', 'value_type' => 'boolean', 'group_name' => 'retrieval'],
                ['config_key' => 'combined_retrieval_enabled', 'config_value' => 'true', 'value_type' => 'boolean', 'group_name' => 'retrieval'],
                ['config_key' => 'external_medical_sources_enabled', 'config_value' => 'true', 'value_type' => 'boolean', 'group_name' => 'retrieval'],
                ['config_key' => 'supported_languages', 'config_value' => 'ar,en', 'value_type' => 'string', 'group_name' => 'behavior'],
                ['config_key' => 'strict_safety_mode', 'config_value' => 'true', 'value_type' => 'boolean', 'group_name' => 'safety'],
                ['config_key' => 'max_question_length', 'config_value' => '1000', 'value_type' => 'integer', 'group_name' => 'limits'],
                ['config_key' => 'max_response_tokens', 'config_value' => '900', 'value_type' => 'integer', 'group_name' => 'limits'],
                ['config_key' => 'guest_session_ttl_minutes', 'config_value' => '30', 'value_type' => 'integer', 'group_name' => 'privacy'],
                ['config_key' => 'retention_days', 'config_value' => '90', 'value_type' => 'integer', 'group_name' => 'privacy'],
            ];

            foreach ($defaults as $row) {
                DB::table('ai_configurations')->insert(array_merge($row, [
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            }
        }

        if (Schema::hasTable('ai_knowledge_sources') && DB::table('ai_knowledge_sources')->count() === 0) {
            $sources = [
                [
                    'name' => 'Saydalety Clinical & Drug Safety Guidelines',
                    'slug' => 'saydalety-clinical-guidelines',
                    'source_type' => 'curated_guideline',
                    'base_url' => 'https://medlineplus.gov/druginformation.html',
                    'language' => 'ar,en',
                    'is_enabled' => true,
                    'sync_status' => 'synced',
                    'last_synced_at' => $now,
                    'summary_notes' => 'مراجع صيدلانية وإكلينيكية معتمدة للجرعات الآمنة، موانع الاستعمال، التداخلات الدوائية، وإرشادات الطوارئ.',
                    'records_count' => 24,
                ],
                [
                    'name' => 'U.S. FDA OpenFDA Drug Label API',
                    'slug' => 'openfda-drug-labels',
                    'source_type' => 'drug_authority',
                    'base_url' => 'https://api.fda.gov/drug/label.json',
                    'language' => 'en',
                    'is_enabled' => true,
                    'sync_status' => 'ready',
                    'last_synced_at' => null,
                    'summary_notes' => 'Official FDA-approved drug labeling: indications, warnings, contraindications, and adverse reactions.',
                    'records_count' => 0,
                ],
                [
                    'name' => 'NIH MedlinePlus Drug & Health Information',
                    'slug' => 'nih-medlineplus',
                    'source_type' => 'medical_organization',
                    'base_url' => 'https://medlineplus.gov',
                    'language' => 'ar,en',
                    'is_enabled' => true,
                    'sync_status' => 'synced',
                    'last_synced_at' => $now,
                    'summary_notes' => 'U.S. National Library of Medicine (NIH) authoritative patient drug & condition references.',
                    'records_count' => 20,
                ],
                [
                    'name' => 'World Health Organization (WHO) Health Guidelines',
                    'slug' => 'who-guidelines',
                    'source_type' => 'medical_organization',
                    'base_url' => 'https://www.who.int',
                    'language' => 'ar,en',
                    'is_enabled' => true,
                    'sync_status' => 'synced',
                    'last_synced_at' => $now,
                    'summary_notes' => 'إرشادات منظمة الصحة العالمية للاستخدام الرشيد للمضادات الحيوية والأدوية الأساسية والأمراض المزمنة.',
                    'records_count' => 12,
                ],
                [
                    'name' => 'Medical & Pharmacology Encyclopedia (MediaWiki API)',
                    'slug' => 'wikimedia-medical',
                    'source_type' => 'encyclopedia',
                    'base_url' => 'https://ar.wikipedia.org/w/api.php',
                    'language' => 'ar,en',
                    'is_enabled' => true,
                    'sync_status' => 'ready',
                    'last_synced_at' => null,
                    'summary_notes' => 'استرجاع التعريفات الدوائية والعلمية الموثقة باللغة العربية والإنجليزية عند الاستفسار عن مصطلحات عامة.',
                    'records_count' => 0,
                ],
            ];

            foreach ($sources as $src) {
                DB::table('ai_knowledge_sources')->insert(array_merge($src, [
                    'created_at' => $now,
                    'updated_at' => $now,
                ]));
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_request_logs');
        Schema::dropIfExists('ai_knowledge_sources');
        Schema::dropIfExists('ai_configurations');
        Schema::dropIfExists('ai_user_feedback');
        Schema::dropIfExists('ai_message_references');
        Schema::dropIfExists('ai_guest_sessions');
    }
};
