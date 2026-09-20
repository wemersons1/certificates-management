<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$resp = Illuminate\Support\Facades\Http::timeout(12)
    ->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept' => 'application/json,text/plain,*/*',
        'Accept-Language' => 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    ])
    ->get('https://www.google.com/search', [
        'tbm' => 'map',
        'authuser' => '0',
        'hl' => 'pt-BR',
        'gl' => 'br',
        'q' => 'supermercado',
        'oq' => 'supermercado',
        'tch' => '1',
        'ech' => '4',
    ]);

$raw = (string) $resp->body();
$json = json_decode($raw, true);
$payload = $json['d'] ?? $raw;
$payload = str_replace('\\/', '/', $payload);

preg_match_all('/-?[0-9]+\.[0-9]+/', $payload, $decimals);
preg_match_all('/\[\s*-?[0-9]{9,}\s*,\s*-?[0-9]{9,}\s*\]/', $payload, $bigPairs);
preg_match_all('/\[null\s*,\s*null\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\]/', $payload, $latLonBlocks);

$result = [
    'status' => $resp->status(),
    'len' => strlen($payload),
    'decimals' => count($decimals[0]),
    'big_pairs' => count($bigPairs[0]),
    'latlon_blocks' => count($latLonBlocks[0]),
    'sample_big_pairs' => array_slice($bigPairs[0], 0, 5),
    'sample_payload' => substr($payload, 0, 500),
];

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
