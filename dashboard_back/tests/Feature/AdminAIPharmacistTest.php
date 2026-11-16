<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AiChat;
use App\Models\AiChatMessage;
use App\Models\AiRequestLog;
use App\Models\AiUserFeedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\DashboardBackTestCase as TestCase;

class AdminAIPharmacistTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): array
    {
        $admin = User::create([
            'name' => 'Chief Admin',
            'email' => 'chief_admin@example.com',
            'password' => Hash::make('AdminPass123!'),
            'role' => 'admin',
            'account_status' => 'active',
        ]);

        return [$admin, $admin->generateAdminToken()];
    }

    public function test_scenario_14_admin_analytics_configuration_sources_and_feedback(): void
    {
        [$admin, $token] = $this->createAdmin();

        $patient = User::create([
            'name' => 'Private Patient',
            'email' => 'private_patient@example.com',
            'password' => Hash::make('UserPass123!'),
            'role' => 'user',
            'account_status' => 'active',
        ]);

        $chat = AiChat::create([
            'user_id' => $patient->id,
            'title' => 'Sensitive Prescription Question',
            'language' => 'ar',
            'status' => 'active',
            'last_message_at' => now(),
        ]);

        $msg = AiChatMessage::create([
            'ai_chat_id' => $chat->id,
            'sender' => 'bot',
            'message' => 'Confidential personal response',
            'retrieval_mode' => 'combined',
            'language' => 'ar',
            'response_time_ms' => 42,
        ]);

        AiRequestLog::create([
            'user_id' => $patient->id,
            'is_guest' => false,
            'ai_chat_id' => $chat->id,
            'language' => 'ar',
            'classification_category' => 'combined',
            'topic_category' => 'prescriptions',
            'retrieval_mode' => 'combined',
            'provider_used' => 'hybrid_engine',
            'status' => 'success',
            'response_time_ms' => 42,
            'references_count' => 1,
            'created_at' => now(),
        ]);

        $fb = AiUserFeedback::create([
            'user_id' => $patient->id,
            'ai_chat_id' => $chat->id,
            'ai_chat_message_id' => $msg->id,
            'feedback_type' => 'positive',
            'comment' => 'Great answer',
            'retrieval_mode' => 'combined',
            'language' => 'ar',
            'admin_status' => 'new',
        ]);

        // 1. Analytics endpoint returns real operational metrics
        $analyticsRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/ai/analytics');

        $analyticsRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_conversations' => 1,
                    'active_conversations' => 1,
                    'total_questions' => 1,
                    'retrieval_modes' => [
                        'combined' => 1,
                    ],
                ],
            ]);

        // 2. Configuration endpoint works & never exposes raw API keys
        $cfgRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/admin/ai/configuration', [
                'guest_session_ttl_minutes' => 45,
                'strict_safety_mode' => true,
            ]);

        $cfgRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'settings' => [
                        'guest_session_ttl_minutes' => 45,
                    ],
                ],
            ]);
        $this->assertStringNotContainsString('AIzaSy', $cfgRes->getContent());

        // 3. Knowledge sources list & internal guideline sync
        $sourcesRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/ai/knowledge-sources');
        $sourcesRes->assertStatus(200);
        $guidelineSourceId = collect($sourcesRes->json('data'))
            ->firstWhere('slug', 'saydalety-clinical-guidelines')['id'];

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/admin/ai/knowledge-sources/{$guidelineSourceId}/sync")
            ->assertStatus(200)
            ->assertJsonPath('data.sync_status', 'synced');

        // 4. Feedback management marks feedback resolved without exposing message body
        $fbList = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/ai/feedback');
        $fbList->assertStatus(200);
        $this->assertStringNotContainsString('Confidential personal response', $fbList->getContent());

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/admin/ai/feedback/{$fb->id}", ['admin_status' => 'resolved'])
            ->assertStatus(200);
    }

    public function test_scenario_15_admin_privacy_blocks_private_patient_conversations(): void
    {
        [$admin, $token] = $this->createAdmin();

        $patient = User::create([
            'name' => 'Secret Patient Name',
            'email' => 'secret_patient@example.com',
            'password' => Hash::make('UserPass123!'),
            'role' => 'user',
            'account_status' => 'active',
        ]);

        $chat = AiChat::create([
            'user_id' => $patient->id,
            'title' => 'My Private HIV/Prescription Question',
            'language' => 'en',
            'status' => 'active',
            'last_message_at' => now(),
        ]);

        AiChatMessage::create([
            'ai_chat_id' => $chat->id,
            'sender' => 'user',
            'message' => 'Private medical details that admin must not read',
        ]);

        // List endpoint masks user identity and omits private conversation title/messages
        $indexRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/ai-chats');

        $indexRes->assertStatus(200)
            ->assertJson(['privacy_policy' => 'PRIVATE_PATIENT_CONVERSATIONS_PROTECTED']);

        $rawJson = $indexRes->getContent();
        $this->assertStringNotContainsString('My Private HIV/Prescription Question', $rawJson);
        $this->assertStringNotContainsString('secret_patient@example.com', $rawJson);

        // Direct show endpoint denies unrestricted private transcript access (403) & logs audit event
        $showRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/v1/admin/ai-chats/{$chat->id}");

        $showRes->assertStatus(403)
            ->assertJson(['code' => 'ADMIN_PRIVACY_RESTRICTED']);

        $this->assertDatabaseHas('medical_audit_logs', [
            'actor_user_id' => $admin->id,
            'action' => 'admin_private_ai_chat_blocked',
            'target_id' => $chat->id,
        ]);
    }
}
