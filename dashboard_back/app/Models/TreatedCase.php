<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\ResolvesImageUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TreatedCase extends Model
{
    use HasFactory, ResolvesImageUrl;

    protected $fillable = [
        'doctor_id',
        'title',
        'specialty',
        'description',
        'initial_condition',
        'treatment_summary',
        'outcome',
        'image',
        'attachment_path',
        'patient_consent_confirmed',
        'status',
        'moderation_note',
        'published_at',
    ];

    protected $casts = [
        'patient_consent_confirmed' => 'boolean',
        'published_at' => 'date:Y-m-d',
    ];

    protected $appends = [
        'image_url',
        'attachment_url',
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image)) {
            return null;
        }
        return self::resolveStorageImageUrl($this->image);
    }

    public function getAttachmentUrlAttribute(): ?string
    {
        if (empty($this->attachment_path)) {
            return null;
        }
        return self::resolveStorageImageUrl($this->attachment_path);
    }
}
