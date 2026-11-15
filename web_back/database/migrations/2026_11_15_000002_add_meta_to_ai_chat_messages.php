<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ai_chat_messages') && !Schema::hasColumn('ai_chat_messages', 'meta')) {
            Schema::table('ai_chat_messages', function (Blueprint $table) {
                $table->json('meta')->nullable()->after('message');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ai_chat_messages') && Schema::hasColumn('ai_chat_messages', 'meta')) {
            Schema::table('ai_chat_messages', function (Blueprint $table) {
                $table->dropColumn('meta');
            });
        }
    }
};
