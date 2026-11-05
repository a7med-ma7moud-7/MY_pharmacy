<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

trait ResolvesImageUrl
{
    /**
     * In-memory cache of resolved URLs to prevent repetitive filesystem stat() calls.
     *
     * @var array<string, string>
     */
    private static array $resolvedUrlCache = [];

    /**
     * Resolve a stored image path into a full public URL with in-memory memoization.
     */
    public static function resolveStorageImageUrl(?string $image, string $fallback = 'asset/1.png'): string
    {
        if (empty($image)) {
            return asset($fallback);
        }

        if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://')) {
            return $image;
        }

        if (isset(self::$resolvedUrlCache[$image])) {
            return self::$resolvedUrlCache[$image];
        }

        if (file_exists(public_path('storage/' . $image))) {
            return self::$resolvedUrlCache[$image] = asset('storage/' . $image);
        }

        if (file_exists(public_path('asset/' . $image))) {
            return self::$resolvedUrlCache[$image] = asset('asset/' . $image);
        }

        return self::$resolvedUrlCache[$image] = asset('storage/' . $image);
    }

    /**
     * Accessor for $model->image_url.
     */
    public function getImageUrlAttribute(): string
    {
        return self::resolveStorageImageUrl($this->image ?? null);
    }

    /**
     * Store an uploaded image on the public disk and delete the previous file if present.
     */
    public function storeUploadedImage(Request $request, string $field, string $folder, ?string $oldPath = null): ?string
    {
        if (!$request->hasFile($field)) {
            return $oldPath;
        }

        $this->deleteStoredImage($oldPath);

        return $request->file($field)->store($folder, 'public');
    }

    /**
     * Delete a stored file from the public disk if it exists.
     */
    public function deleteStoredImage(?string $path): void
    {
        if (!empty($path) && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            unset(self::$resolvedUrlCache[$path]);
        }
    }
}
