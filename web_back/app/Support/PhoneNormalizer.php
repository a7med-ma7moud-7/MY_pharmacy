<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Doctor;
use App\Models\User;

final class PhoneNormalizer
{
    public static function normalize(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }

        $trimmed = trim($raw);
        if ($trimmed === '') {
            return null;
        }

        // Convert Arabic-Indic and Eastern Arabic-Indic numerals to ASCII digits
        $arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $asciiDigits  = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $converted = str_replace($arabicDigits, $asciiDigits, $trimmed);

        // Keep leading + if present, strip other non-digits
        $hasPlus = str_starts_with($converted, '+');
        $digits = preg_replace('/\D+/', '', $converted) ?? '';
        if ($digits === '') {
            return null;
        }

        // Normalize Egyptian phone variants (+201..., 00201..., 201..., 10xxxxxxxx) -> 01xxxxxxxxx
        if (str_starts_with($digits, '00201') && strlen($digits) === 14) {
            return '0' . substr($digits, 4);
        }
        if (str_starts_with($digits, '201') && strlen($digits) === 12) {
            return '0' . substr($digits, 2);
        }
        if (preg_match('/^1[0125]\d{8}$/', $digits)) {
            return '0' . $digits;
        }

        return $hasPlus ? ('+' . $digits) : $digits;
    }

    public static function isValid(?string $raw): bool
    {
        $normalized = self::normalize($raw);
        if ($normalized === null) {
            return false;
        }

        // Valid Egyptian mobile (010/011/012/015 + 8 digits) or standard 9-15 digit phone
        if (preg_match('/^01[0125]\d{8}$/', $normalized)) {
            return true;
        }

        return (bool) preg_match('/^\+?\d{9,15}$/', $normalized);
    }

    /**
     * Return all equivalent representations for DB lookup (handles legacy integer doctor numbers without leading 0).
     *
     * @return list<string>
     */
    public static function variants(string $raw): array
    {
        $norm = self::normalize($raw);
        if ($norm === null) {
            return [];
        }

        $variants = [$norm];
        $noLeadingZero = ltrim($norm, '0+');
        if ($noLeadingZero !== '' && $noLeadingZero !== $norm) {
            $variants[] = $noLeadingZero;
        }
        if (str_starts_with($norm, '01') && strlen($norm) === 11) {
            $variants[] = '+2' . $norm;
            $variants[] = '2' . $norm;
        }

        return array_values(array_unique($variants));
    }

    public static function isTaken(
        string $raw,
        ?int $ignoreUserId = null,
        ?int $ignoreDoctorId = null
    ): bool {
        $variants = self::variants($raw);
        if ($variants === []) {
            return false;
        }

        $userExists = User::query()
            ->whereIn('phone', $variants)
            ->when($ignoreUserId !== null, fn ($q) => $q->where('id', '!=', $ignoreUserId))
            ->exists();

        if ($userExists) {
            return true;
        }

        return Doctor::query()
            ->whereIn('number', $variants)
            ->when($ignoreDoctorId !== null, fn ($q) => $q->where('id', '!=', $ignoreDoctorId))
            ->exists();
    }

    public static function syntheticEmailForPhone(string $normalizedPhone): string
    {
        $digits = preg_replace('/\D+/', '', $normalizedPhone) ?: uniqid();
        return "acct_{$digits}@phone.saydalety.local";
    }

    public static function isSyntheticEmail(?string $email): bool
    {
        return is_string($email) && str_ends_with(strtolower($email), '@phone.saydalety.local');
    }
}
