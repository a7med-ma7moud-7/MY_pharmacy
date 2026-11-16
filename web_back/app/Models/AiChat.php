<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiChat extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'language',
        'last_message_preview',
        'last_message_at',
        'status',
        'deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->where('status', 'active')->orWhereNull('status');
        })->whereNull('deleted_at');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AiChatMessage::class)->orderBy('id');
    }
}
