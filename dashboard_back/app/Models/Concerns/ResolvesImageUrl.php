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
     * Resolve a stored image path into a full public URL with cross-app storage awareness.
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

        // Check sibling app public storage (dashboard_back <-> web_back)
        $workspaceRoot = dirname(base_path());
        $currentDirName = basename(base_path());
        $siblingApp = $currentDirName === 'web_back' ? 'dashboard_back' : 'web_back';
        $siblingUrl = $currentDirName === 'web_back' ? 'http://127.0.0.1:8080' : 'http://127.0.0.1:8000';
        $siblingFile = $workspaceRoot . DIRECTORY_SEPARATOR . $siblingApp . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $image);

        if (is_file($siblingFile)) {
            return self::$resolvedUrlCache[$image] = $siblingUrl . '/storage/' . ltrim($image, '/');
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

        $stored = $request->file($field)->store($folder, 'public');

        if ($stored) {
            $this->mirrorFileToSiblingStorage($stored);
        }

        return $stored;
    }

    /**
     * Mirror uploaded public file to sibling backend storage when running in real environment (skipping fake test disks).
     */
    protected function mirrorFileToSiblingStorage(string $relativePath): void
    {
        try {
            $sourceFile = storage_path('app/public/' . $relativePath);
            if (!is_file($sourceFile)) {
                return;
            }

            $workspaceRoot = dirname(base_path());
            $currentDirName = basename(base_path());
            $siblingApp = $currentDirName === 'web_back' ? 'dashboard_back' : 'web_back';
            $targetBase = $workspaceRoot . DIRECTORY_SEPARATOR . $siblingApp . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'public';

            if (!is_dir($targetBase)) {
                return;
            }

            $targetFile = $targetBase . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
            $targetDir = dirname($targetFile);
            if (!is_dir($targetDir)) {
                @mkdir($targetDir, 0775, true);
            }
            @copy($sourceFile, $targetFile);
        } catch (\Throwable) {
            // Non-blocking best-effort mirror
        }
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
