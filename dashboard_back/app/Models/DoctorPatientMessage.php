<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\ResolvesImageUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorPatientMessage extends Model
{
    use ResolvesImageUrl;

    protected $fillable = [
        'conversation_id',
        'sender_user_id',
        'sender_role',
        'body',
        'attachment_path',
        'attachment_name',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    protected $appends = [
        'attachment_url',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(DoctorPatientConversation::class, 'conversation_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function getAttachmentUrlAttribute(): ?string
    {
        if (empty($this->attachment_path)) {
            return null;
        }
        return self::resolveStorageImageUrl($this->attachment_path);
    }
}
