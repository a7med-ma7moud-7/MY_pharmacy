<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiUserFeedback extends Model
{
    protected $table = 'ai_user_feedback';

    protected $fillable = [
        'user_id',
        'ai_chat_id',
        'ai_chat_message_id',
        'feedback_type',
        'category',
        'comment',
        'retrieval_mode',
        'language',
        'admin_status',
        'admin_note',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(AiChat::class, 'ai_chat_id');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(AiChatMessage::class, 'ai_chat_message_id');
    }
}
