<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMessageReference extends Model
{
    protected $table = 'ai_message_references';

    protected $fillable = [
        'ai_chat_message_id',
        'source_name',
        'title',
        'source_url',
        'source_type',
        'published_or_updated_at',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(AiChatMessage::class, 'ai_chat_message_id');
    }
}
