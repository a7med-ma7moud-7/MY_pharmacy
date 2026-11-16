<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiGuestSession extends Model
{
    protected $table = 'ai_guest_sessions';

    protected $fillable = [
        'session_token',
        'language',
        'context_messages',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'context_messages' => 'array',
            'expires_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->status !== 'active'
            || ($this->expires_at !== null && $this->expires_at->isPast());
    }
}
