<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BuildTemplate
{
    public static function build($document, $template): string
    {
        $backDocumentWithoutMask = null;

        if (!$template) {
            return '';
        }

        $document->load(['certificate_template']);
        
        $orientation = $template?->orientation ?? 'portrait';
        $width = $orientation === 'landscape' ? '1123px' : '794px';
        $height = $orientation === 'landscape' ? '794px' : '1123px';

        $fromtDocumentWithoutMask = ApplyMaskDocument::apply($document, $template, 'front');
        $fromtDocumentWithoutMask = self::normalizeTemplateStyles($fromtDocumentWithoutMask, $orientation);

        if ($template->back_document) {
            $backDocumentWithoutMask = ApplyMaskDocument::apply($document, $template, 'back');
            $backDocumentWithoutMask = self::normalizeTemplateStyles($backDocumentWithoutMask, $orientation);
        }

        $headerSize = $orientation === 'landscape'  ? 100 : 75;

        $view = 'document-template.template-custom';
        $storedIsTopOnly = (bool) ($template?->frame?->is_top_only ?? false);

        $frameResult    = self::getImageAuthenticatedWithDimensions($template?->frame?->frame);
        $backFrameResult = self::getImageAuthenticatedWithDimensions($template?->frame?->back_frame);

        $frame     = $frameResult['dataUrl'];
        $backFrame = $backFrameResult['dataUrl'];

        // Detect top-only from actual image height (< 300 px); fall back to stored flag
        $isTopOnlyFrame     = $frameResult['height'] > 0
            ? $frameResult['height'] < 300
            : $storedIsTopOnly;

        $isTopOnlyBackFrame = $backFrameResult['height'] > 0
            ? $backFrameResult['height'] < 300
            : $storedIsTopOnly;

        $pages = [
            [
                'template' => $fromtDocumentWithoutMask,
                'is_back_page' => false,
            ],
        ];

        if ($template->back_document) {
            $pages[] = [
                'template' => $backDocumentWithoutMask,
                'is_back_page' => true,
            ];
        }

        $isNewVersion = (bool) optional($document->course)->new_version;

        // Renderiza o HTML como string
        $documentBuilded =  view($view, [
            'pages'              => $pages,
            'orientation'        => $orientation,
            'frame'              => $frame,
            'backFrame'          => $backFrame,
            'isTopOnlyFrame'     => $isTopOnlyFrame,
            'isTopOnlyBackFrame' => $isTopOnlyBackFrame,
            'width'              => $width,
            'height'             => $height,
            'logo'               => $document?->entity?->config?->logo ?? '',
            'headerSize'         => $headerSize,
            'newVersion'         => $isNewVersion,
        ])->render();

        // Fallback/Correction: Replace any blob: or existing frame images with the authenticated S3 base64 frames directly
        $count = 0;
        $documentBuilded = preg_replace_callback('/<img\s+([^>]*alt=["\']Moldura do Banco["\'][^>]*)>/i', function($matches) use (&$count, $frame, $backFrame) {
            $count++;
            $attrs = $matches[1];
            $replacementFrame = ($count === 2 && !empty($backFrame)) ? $backFrame : $frame;
            if (!empty($replacementFrame)) {
                if (preg_match('/src=["\']([^"\']*)["\']/i', $attrs)) {
                    $attrs = preg_replace('/src=["\']([^"\']*)["\']/i', 'src="' . $replacementFrame . '"', $attrs);
                } else {
                    $attrs .= ' src="' . $replacementFrame . '"';
                }
            }
            return '<img ' . $attrs . '>';
        }, $documentBuilded);

        return self::convertS3UrlsToBase64($documentBuilded);
    }

    public static function convertS3UrlsToBase64(string $html): string
    {
        if (trim($html) === '') {
            return $html;
        }

        // 1. Replace src="http..." or src="path..."
        $html = preg_replace_callback('/(src\s*=\s*["\'])([^"\']+)(["\'])/i', function($matches) {
            $url = $matches[2];
            if (!Str::startsWith($url, 'data:')) {
                $base64 = self::getImageAuthenticated($url);
                if (!empty($base64)) {
                    return $matches[1] . $base64 . $matches[3];
                }
            }
            return $matches[0];
        }, $html);

        // 2. Replace url('http...') or url('path...')
        $html = preg_replace_callback('/(url\s*\(\s*["\']?)([^"\'\)]+)(["\']?\s*\))/i', function($matches) {
            $url = $matches[2];
            if (!Str::startsWith($url, 'data:')) {
                $base64 = self::getImageAuthenticated($url);
                if (!empty($base64)) {
                    return $matches[1] . $base64 . $matches[3];
                }
            }
            return $matches[0];
        }, $html);

        return $html;
    }

    public static function generateBorderImage(string $color): string {
        $width = 1000;
        $height = 150;
        $startY = $height * 0.7;
        $endY = $startY * 0.2;

        $svg = "<svg width=\"{$width}\" height=\"{$height}\" viewBox=\"0 0 {$width} {$height}\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 0 {$startY} C " . ($width * 0.3) . " " . ($height * 0.2) . ", " . ($width * 0.5) . " 0, " . ($width * 0.65) . " 0 C " . ($width * 0.775) . " 0, " . ($width) . " {$endY}, " . ($width) . " {$endY} V 0 H 0 Z\" fill=\"{$color}\" /></svg>";

        return "data:image/svg+xml;base64," . base64_encode($svg);
    }

    public static function getImageAuthenticated($url)
    {
        return self::getImageAuthenticatedWithDimensions($url)['dataUrl'];
    }

    public static function getImageAuthenticatedWithDimensions($url): array
    {
        $empty = ['dataUrl' => '', 'height' => 0];

        if (!$url) {
            return $empty;
        }

        try {
            $path = ltrim(parse_url($url, PHP_URL_PATH), '/');

            $bucketName = config('filesystems.disks.s3.bucket');
            if (Str::startsWith($path, $bucketName)) {
                $path = Str::replaceFirst($bucketName . '/', '', $path);
            }

            if (Storage::disk('s3')->exists($path)) {
                $fileContent = Storage::disk('s3')->get($path);
                $mimeType    = Storage::disk('s3')->mimeType($path);
                $base64      = base64_encode($fileContent);

                $imageSize = @getimagesizefromstring($fileContent);
                $height    = $imageSize ? (int) $imageSize[1] : 0;

                return [
                    'dataUrl' => "data:{$mimeType};base64,{$base64}",
                    'height'  => $height,
                ];
            }
        } catch (\Exception $e) {
            Log::error("Erro ao buscar imagem no S3: " . $e->getMessage());
        }

        return $empty;
    }

    public static function normalizeTemplateStyles(string $html, string $orientation): string
    {
        if (trim($html) === '') {
            return $html;
        }

        return preg_replace_callback(
            '/<div([^>]*id="page\d+-div"[^>]*)>/i',
            function (array $m) use ($orientation): string {
                $attrs = $m[1];
                if (preg_match('/\bstyle="([^"]*)"/i', $attrs, $styleMatch)) {
                    $style = $styleMatch[1];
                    $zoom = 1.0;
                    if (preg_match('/\bzoom:\s*([\d.]+)/i', $style, $zoomMatch)) {
                        $zoom = (float) $zoomMatch[1];
                    }
                    if ($zoom > 0 && $zoom < 1.0) {
                        $targetW = $orientation === 'landscape' ? 1123.0 : 794.0;
                        $targetH = $orientation === 'landscape' ? 794.0 : 1123.0;

                        if (preg_match('/\bwidth:\s*([\d.]+)px/i', $style, $wMatch)) {
                            $w = (float) $wMatch[1];
                            if (abs($w - $targetW) <= 5.0) {
                                $newW = round($targetW / $zoom, 1);
                                $style = preg_replace('/\bwidth:\s*[\d.]+px/i', "width:{$newW}px", $style);
                            }
                        }
                        if (preg_match('/\bheight:\s*([\d.]+)px/i', $style, $hMatch)) {
                            $h = (float) $hMatch[1];
                            if (abs($h - $targetH) <= 5.0) {
                                $newH = round($targetH / $zoom, 1);
                                $style = preg_replace('/\bheight:\s*[\d.]+px/i', "height:{$newH}px", $style);
                            }
                        }
                        $attrs = preg_replace('/\bstyle="[^"]*"/i', 'style="' . $style . '"', $attrs);
                    }
                }
                return '<div' . $attrs . '>';
            },
            $html
        ) ?? $html;
    }
}