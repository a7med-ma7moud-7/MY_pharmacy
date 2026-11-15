<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ai_chats')) {
            Schema::create('ai_chats', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('title', 255);
                $table->timestamp('last_message_at')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'last_message_at'], 'idx_ai_chats_user_last_msg');
            });
        }

        if (!Schema::hasTable('ai_chat_messages')) {
            Schema::create('ai_chat_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ai_chat_id')->constrained('ai_chats')->cascadeOnDelete();
                $table->string('sender', 20); // 'user' | 'bot'
                $table->text('message');
                $table->timestamps();

                $table->index(['ai_chat_id', 'created_at'], 'idx_ai_chat_messages_chat_created');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_chat_messages');
        Schema::dropIfExists('ai_chats');
    }
};
