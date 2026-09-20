<?php

namespace App\Services\Claude;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClaudeService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = (string) config('services.claude.key');
        $this->baseUrl = (string) config('services.claude.base_url', 'https://api.anthropic.com/v1/messages');
        $this->model = (string) config('services.claude.model', 'claude-sonnet-4-20250514');
    }

    public function interpret(string $prompt, string $text): string
    {
        if (empty($this->apiKey)) {
            return $text;
        }

        $textForClaude = $this->removeBase64DataUris($text);
        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->post($this->baseUrl, [
            'model' => $this->model,
            'max_tokens' => 4096,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => $prompt . "\n\nTexto de entrada:\n" . $textForClaude,
                        ],
                    ],
                ],
            ],
        ]);

        if ($response->successful()) {
            return (string) data_get($response->json(), 'content.0.text', $text);
        }

        Log::warning('ClaudeService: falha na chamada da API.', [
            'status' => $response?->status(),
            'response' => $response?->json(),
            'model' => $this->model,
        ]);

        return $text;
    }

    private function removeBase64DataUris(string $text): string
    {
        $withoutBase64DataUris = preg_replace(
            '/data:[^;"\'\s>]+;base64,[A-Za-z0-9+\/=\r\n]+/i',
            'about:blank',
            $text
        );

        if (! is_string($withoutBase64DataUris)) {
            return $text;
        }

        return $withoutBase64DataUris;
    }
}
