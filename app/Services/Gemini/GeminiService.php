<?php

namespace App\Services\Gemini;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected string $apiKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.key');
        $this->baseUrl = (string) config('services.gemini.base_url');
    }

    /**
     * Concatena $prompt e $text em um único conteúdo e envia para a API Gemini (v1).
     * Lança exceção em caso de falha para que o código chamador possa tratar.
     */
    public function interpret(string $prompt, string $text): string
    {
        if (empty($this->apiKey)) {
            throw new \RuntimeException('Gemini API key not configured.');
        }

        $textWithoutBase64 = $this->removeBase64DataUris($text);
        $fullContent = $prompt . "\n\n" . $textWithoutBase64;

        $response = Http::timeout(120)->post("{$this->baseUrl}?key={$this->apiKey}", [
            'contents' => [
                ['parts' => [['text' => $fullContent]]],
            ],
            'generationConfig' => [
                'maxOutputTokens' => 15000,
                'temperature'     => 0.0,
            ],
        ]);

        if (! $response->successful()) {
            $errorBody = $response->json('error.message') ?? $response->body();
            \Illuminate\Support\Facades\Log::error('[Gemini] API error ' . $response->status() . ': ' . $errorBody);
            throw new \RuntimeException("Gemini API error {$response->status()}: {$errorBody}");
        }

        $resultText = (string) data_get($response->json(), 'candidates.0.content.parts.0.text', '');

        if (trim($resultText) === '') {
            \Illuminate\Support\Facades\Log::error('[Gemini] Empty response. Full JSON: ' . json_encode($response->json()));
            throw new \RuntimeException('Gemini returned an empty response.');
        }

        return $resultText;
    }

    private function removeBase64DataUris(string $text): string
    {
        $result = preg_replace(
            '/data:[^;]+;base64,[^"\'\s>]+/i',
            'about:blank',
            $text
        );

        return is_string($result) ? $result : $text;
    }
}
