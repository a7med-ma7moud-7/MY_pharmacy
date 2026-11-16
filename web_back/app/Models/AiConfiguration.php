<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class AiConfiguration extends Model
{
    public const CACHE_KEY = 'ai_pharmacist:configurations:v1';

    protected $table = 'ai_configurations';

    protected $fillable = [
        'config_key',
        'config_value',
        'value_type',
        'group_name',
        'updated_by',
    ];

    /**
     * @return array<string, string>
     */
    public static function getMap(): array
    {
        try {
            if (!Schema::hasTable('ai_configurations')) {
                return self::defaults();
            }

            // Use short TTL (10s) so updates across web_back and dashboard_back reflect near-instantly
            return Cache::remember(self::CACHE_KEY, 10, function () {
                $rows = self::query()->pluck('config_value', 'config_key')->all();
                return array_merge(self::defaults(), array_map(fn ($v) => (string) ($v ?? ''), $rows));
            });
        } catch (\Throwable) {
            return self::defaults();
        }
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    public static function getBool(string $key, bool $default = true): bool
    {
        $map = self::getMap();
        if (!array_key_exists($key, $map)) {
            return $default;
        }
        return in_array(strtolower(trim($map[$key])), ['1', 'true', 'yes', 'on'], true);
    }

    public static function getInt(string $key, int $default): int
    {
        $map = self::getMap();
        if (!array_key_exists($key, $map) || !is_numeric($map[$key])) {
            return $default;
        }
        return (int) $map[$key];
    }

    public static function getString(string $key, string $default = ''): string
    {
        $map = self::getMap();
        return isset($map[$key]) && $map[$key] !== '' ? (string) $map[$key] : $default;
    }

    /**
     * @return array<string, string>
     */
    public static function defaults(): array
    {
        return [
            'ai_enabled' => 'true',
            'active_provider' => 'auto',
            'general_knowledge_enabled' => 'true',
            'internal_data_enabled' => 'true',
            'combined_retrieval_enabled' => 'true',
            'external_medical_sources_enabled' => 'true',
            'supported_languages' => 'ar,en',
            'strict_safety_mode' => 'true',
            'max_question_length' => '1000',
            'max_response_tokens' => '900',
            'guest_session_ttl_minutes' => '30',
            'retention_days' => '90',
        ];
    }
}
