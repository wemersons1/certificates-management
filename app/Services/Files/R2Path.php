<?php

namespace App\Services\Files;

class R2Path
{
    public static function normalize(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        $path = parse_url($value, PHP_URL_PATH);
        $path = is_string($path) && $path !== '' ? $path : $value;
        $path = ltrim($path, '/');

        $bucket = trim((string) config('filesystems.disks.s3.bucket'), '/');
        if ($bucket !== '' && ($path === $bucket || str_starts_with($path, $bucket . '/'))) {
            $path = ltrim(substr($path, strlen($bucket)), '/');
        }

        $prefix = trim((string) config('filesystems.disks.s3.root'), '/');
        while ($prefix !== '' && ($path === $prefix || str_starts_with($path, $prefix . '/'))) {
            $path = ltrim(substr($path, strlen($prefix)), '/');
        }

        return $path;
    }
}
