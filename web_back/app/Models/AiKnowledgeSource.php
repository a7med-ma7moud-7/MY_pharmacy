<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class AiKnowledgeSource extends Model
{
    protected $table = 'ai_knowledge_sources';

    protected $fillable = [
        'name',
        'slug',
        'source_type',
        'base_url',
        'language',
        'is_enabled',
        'sync_status',
        'last_synced_at',
        'last_error',
        'summary_notes',
        'records_count',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'last_synced_at' => 'datetime',
            'records_count' => 'integer',
        ];
    }

    public function scopeEnabled(Builder $query): Builder
    {
        return $query->where('is_enabled', true);
    }
}
