<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiChatMessage extends Model
{
    protected $fillable = [
        'ai_chat_id',
        'sender',
        'message',
        'retrieval_mode',
        'language',
        'status',
        'response_time_ms',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'response_time_ms' => 'integer',
        ];
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(AiChat::class, 'ai_chat_id');
    }

    public function references(): HasMany
    {
        return $this->hasMany(AiMessageReference::class, 'ai_chat_message_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(AiUserFeedback::class, 'ai_chat_message_id');
    }
}
