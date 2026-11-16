<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiRequestLog extends Model
{
    public $timestamps = false;

    protected $table = 'ai_request_logs';

    protected $fillable = [
        'user_id',
        'is_guest',
        'ai_chat_id',
        'language',
        'classification_category',
        'topic_category',
        'retrieval_mode',
        'provider_used',
        'status',
        'response_time_ms',
        'references_count',
        'error_type',
        'error_message',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'is_guest' => 'boolean',
            'response_time_ms' => 'integer',
            'references_count' => 'integer',
            'created_at' => 'datetime',
        ];
    }
}
