<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicalAuditLog extends Model
{
    public $timestamps = false;

    protected $table = 'medical_audit_logs';

    protected $fillable = [
        'actor_user_id',
        'actor_role',
        'action',
        'target_type',
        'target_id',
        'doctor_id',
        'metadata',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public static function record(
        string $action,
        ?string $targetType = null,
        int|string|null $targetId = null,
        int|string|null $doctorId = null,
        array $metadata = [],
        ?Request $request = null,
        ?User $actor = null
    ): void {
        try {
            $resolvedActor = $actor ?? Auth::user();
            $req = $request ?? request();

            self::create([
                'actor_user_id' => $resolvedActor?->id,
                'actor_role' => $resolvedActor?->role ?? 'guest',
                'action' => $action,
                'target_type' => $targetType,
                'target_id' => $targetId !== null ? (int) $targetId : null,
                'doctor_id' => $doctorId !== null ? (int) $doctorId : null,
                'metadata' => $metadata !== [] ? $metadata : null,
                'ip_address' => $req?->ip(),
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // Never interrupt clinical flow if audit write fails
        }
    }
}
