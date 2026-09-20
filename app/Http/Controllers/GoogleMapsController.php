<?php

namespace App\Http\Controllers;

use App\Services\Gemini\GeminiService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleMapsController extends Controller
{
    public function searchAddress(Request $request)
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:3', 'max:255'],
        ]);

        $query = $validated['q'];

        try {
            $items = $this->searchAddressInGoogleStack($query);

            if ($items->isEmpty()) {
                $geminiAddress = $this->normalizeAddressWithGemini($query);
                $geminiQuery = $geminiAddress['query'] ?? $query;
                $geminiLat = $geminiAddress['lat'] ?? null;
                $geminiLon = $geminiAddress['lon'] ?? null;

                if (!empty($geminiQuery) && $geminiQuery !== $query) {
                    $items = $this->searchAddressInGoogleStack($geminiQuery);
                }

                if ($items->isEmpty() && is_numeric($geminiLat) && is_numeric($geminiLon)) {
                    $metadata = $this->buildLocationMetadata($geminiQuery, 'gemini');
                    $items = collect([[
                        'place_id' => 'gemini_' . md5($geminiQuery),
                        'display_name' => $geminiQuery,
                        'lat' => (string) $geminiLat,
                        'lon' => (string) $geminiLon,
                        'formatted_address' => $metadata['formatted_address'],
                        'address' => $metadata['address'],
                        'neighborhood' => $metadata['neighborhood'],
                        'city' => $metadata['city'],
                        'state' => $metadata['state'],
                        'country' => $metadata['country'],
                        'source' => $metadata['source'],
                    ]]);
                }
            }

            $items = collect($items)
                ->filter(function (array $item) {
                    return $this->hasValidCoordinates($item);
                })
                ->values();

            $items = $this->enrichItemsWithCoordinatesMetadata($items);

            if ($items->isEmpty()) {
                return response()->json($this->notFoundAddressResults($query));
            }

            return response()->json($items->values());
        } catch (ConnectionException $e) {
            Log::warning('Google map web connection error on searchAddress', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            return response()->json($this->notFoundAddressResults($query));
        } catch (\Throwable $e) {
            Log::error('Unexpected error on searchAddress', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            return response()->json($this->notFoundAddressResults($query));
        }
    }

    public function reverseAddress(Request $request)
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric'],
            'lon' => ['required', 'numeric'],
        ]);

        $query = $validated['lat'] . ',' . $validated['lon'];

        try {
            $items = $this->searchAddressInGoogleStack($query);
            if ($items->isNotEmpty()) {
                $first = $items->first();
                $first = $this->enrichItemWithAddressMetadata($first);

                return response()->json([
                    'place_id' => $first['place_id'] ?? null,
                    'display_name' => $first['display_name'] ?? ('Lat: ' . $validated['lat'] . ', Lng: ' . $validated['lon']),
                    'lat' => $first['lat'] ?? (string) $validated['lat'],
                    'lon' => $first['lon'] ?? (string) $validated['lon'],
                    'formatted_address' => $first['formatted_address'] ?? ($first['display_name'] ?? null),
                    'address' => $first['address'] ?? null,
                    'neighborhood' => $first['neighborhood'] ?? null,
                    'city' => $first['city'] ?? null,
                    'state' => $first['state'] ?? null,
                    'country' => $first['country'] ?? null,
                    'source' => $first['source'] ?? 'google_maps_web',
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Reverse address fallback on Google map web', [
                'lat' => $validated['lat'],
                'lon' => $validated['lon'],
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'display_name' => 'Lat: ' . $validated['lat'] . ', Lng: ' . $validated['lon'],
            'lat' => (string) $validated['lat'],
            'lon' => (string) $validated['lon'],
            'formatted_address' => 'Lat: ' . $validated['lat'] . ', Lng: ' . $validated['lon'],
            'address' => null,
            'neighborhood' => null,
            'city' => null,
            'state' => null,
            'country' => null,
            'source' => 'reverse_fallback',
        ]);
    }

    private function searchAddressInGoogleStack(string $query)
    {
        $queryVariants = $this->buildQueryVariants($query);
        $items = collect();

        foreach ($queryVariants as $variant) {
            $results = $this->searchWithGoogleMapsWeb($variant);
            if (!empty($results)) {
                $items = $items->concat($results);
            }
        }

        return $this->dedupeAndLimit($items, 5);
    }

    private function searchWithGoogleMapsWeb(string $query): array
    {
        $aggregatedItems = collect();

        $directResponse = Http::timeout(12)
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
                'q' => $query,
                'oq' => $query,
                'tch' => '1',
                'ech' => '4',
            ]);

        $directItems = $this->extractAddressItemsFromGoogleResponse($directResponse, $query);
        if (!empty($directItems)) {
            $aggregatedItems = $aggregatedItems->concat($directItems);
        }

        $tbmMapUrl = $this->extractGoogleSearchMapUrlFromMapsPage($query);
        if (!empty($tbmMapUrl)) {
            try {
                $mapsFlowResponse = Http::timeout(12)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept' => 'application/json,text/plain,*/*',
                        'Accept-Language' => 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    ])
                    ->get($tbmMapUrl);

                $mapsFlowItems = $this->extractAddressItemsFromGoogleResponse($mapsFlowResponse, $query);
                if (!empty($mapsFlowItems)) {
                    $aggregatedItems = $aggregatedItems->concat($mapsFlowItems);
                }
            } catch (\Throwable $e) {
                Log::warning('Google maps page flow failed', [
                    'query' => $query,
                    'url' => $tbmMapUrl,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $this->dedupeAndLimit($aggregatedItems, 8)->all();
    }

    private function extractAddressItemsFromGoogleResponse($response, string $query): array
    {
        if (empty($response) || $response->failed()) {
            return [];
        }

        $rawBody = (string) $response->body();
        $payloadText = $this->extractGooglePayloadText($rawBody);

        if (empty($payloadText)) {
            return [];
        }

        $itemsFromList = $this->extractResultsFromPayload($payloadText);
        if (!empty($itemsFromList)) {
            return $itemsFromList;
        }

        $latLon = $this->extractLatLonFromPayload($payloadText);
        $displayName = $this->extractDisplayNameFromPayload($payloadText, $query);
        $placeId = $this->extractPlaceIdFromPayload($payloadText, $displayName);
        $displayName = $this->sanitizeDisplayName($displayName);

        if (empty($displayName)) {
            return [];
        }

        return [[
            'place_id' => $placeId,
            'display_name' => $displayName,
            'lat' => $latLon['lat'] ?? '',
            'lon' => $latLon['lon'] ?? '',
        ] + $this->buildLocationMetadata($displayName, 'google_maps_web')];
    }

    private function extractGoogleSearchMapUrlFromMapsPage(string $query): ?string
    {
        $mapsSearchUrl = 'https://www.google.com/maps/search/' . rawurlencode($query);

        try {
            $response = Http::timeout(12)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept-Language' => 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                ])
                ->get($mapsSearchUrl);

            if ($response->failed()) {
                return null;
            }

            $html = (string) $response->body();

            if (!preg_match('/href="(\/search\?tbm=map[^"]+)"/i', $html, $matches)) {
                return null;
            }

            $decodedPath = html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');

            return 'https://www.google.com' . $decodedPath;
        } catch (\Throwable $e) {
            Log::warning('Google maps search page parsing failed', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function extractResultsFromPayload(string $payloadText): array
    {
        $decodedPayload = $this->decodeUnicodeLiterals($payloadText);
        $normalizedPayload = stripcslashes($decodedPayload);
        $normalizedPayload = str_replace(["\r", "\n", "\t"], [' ', ' ', ' '], $normalizedPayload);

        $patterns = [
            '/\[null\s*,\s*null\s*,\s*(?<lat>-?[0-9]+\.[0-9]+)\s*,\s*(?<lon>-?[0-9]+\.[0-9]+)\s*\]\s*,\s*"(?<place_id>(?:0x)?[0-9a-z:]+)"\s*,\s*"(?<name>[^"]+)"/iu',
            '/"(?<place_id>0x[0-9a-f]+:0x[0-9a-f]+)"\s*,\s*"(?<name>[^"]+)"[\s\S]{0,260}?\[null\s*,\s*null\s*,\s*(?<lat>-?[0-9]+\.[0-9]+)\s*,\s*(?<lon>-?[0-9]+\.[0-9]+)\]/iu',
            '/"(?<place_id>ChIJ[0-9A-Za-z_-]+)"[\s\S]{0,220}?\[null\s*,\s*null\s*,\s*(?<lat>-?[0-9]+\.[0-9]+)\s*,\s*(?<lon>-?[0-9]+\.[0-9]+)\]\s*,\s*"(?<name>[^"]+)"/u',
        ];

        $matches = collect();
        foreach ($patterns as $pattern) {
            $currentMatches = [];
            preg_match_all($pattern, $normalizedPayload, $currentMatches, PREG_SET_ORDER);

            if (!empty($currentMatches)) {
                $matches = $matches->concat($currentMatches);
            }
        }

        if ($matches->isEmpty()) {
            return [];
        }

        return $matches
            ->map(function (array $match) {
                $displayName = $this->sanitizeDisplayName((string) ($match['name'] ?? ''));
                $metadata = $this->buildLocationMetadata($displayName, 'google_maps_web');

                return [
                    'place_id' => (string) ($match['place_id'] ?? ''),
                    'display_name' => $displayName,
                    'lat' => (string) ($match['lat'] ?? ''),
                    'lon' => (string) ($match['lon'] ?? ''),
                    'formatted_address' => $metadata['formatted_address'],
                    'address' => $metadata['address'],
                    'neighborhood' => $metadata['neighborhood'],
                    'city' => $metadata['city'],
                    'state' => $metadata['state'],
                    'country' => $metadata['country'],
                    'source' => $metadata['source'],
                ];
            })
            ->filter(function (array $item) {
                return !empty($item['display_name'])
                    && !empty($item['place_id'])
                    && !$this->looksLikeUrlOrInternalPath($item['display_name'])
                    && $this->hasValidCoordinates($item);
            })
            ->unique(function (array $item) {
                return ($item['place_id'] ?? '') . '|' . ($item['display_name'] ?? '');
            })
            ->values()
            ->all();
    }

    private function extractGooglePayloadText(string $rawBody): string
    {
        $trimmedBody = ltrim($rawBody);

        if (str_starts_with($trimmedBody, ")]}'")) {
            $trimmedBody = preg_replace('/^\)\]\}\'\s*/', '', $trimmedBody) ?? $trimmedBody;
        }

        $decoded = json_decode($trimmedBody, true);

        if (is_array($decoded) && isset($decoded['d']) && is_string($decoded['d'])) {
            return $decoded['d'];
        }

        return $trimmedBody;
    }

    private function extractLatLonFromPayload(string $payloadText): array
    {
        if (preg_match('/\[null\s*,\s*null\s*,\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\]/', $payloadText, $matches)) {
            return [
                'lat' => (string) $matches[1],
                'lon' => (string) $matches[2],
            ];
        }

        if (preg_match('/\[\[\s*-?\d+(?:\.\d+)?\s*,\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*\]\s*,\s*\[0\s*,\s*0\s*,\s*0\]\s*,\s*\[\d+\s*,\s*\d+\]\s*,\s*\d+(?:\.\d+)?\s*\]/', $payloadText, $matches)) {
            return [
                'lat' => (string) $matches[2],
                'lon' => (string) $matches[1],
            ];
        }

        if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $payloadText, $matches)) {
            return [
                'lat' => (string) $matches[1],
                'lon' => (string) $matches[2],
            ];
        }

        return [
            'lat' => '',
            'lon' => '',
        ];
    }

    private function extractDisplayNameFromPayload(string $payloadText, string $fallback): string
    {
        $decodedPayload = $this->decodeUnicodeLiterals($payloadText);

        $patterns = [
            '/"(R\.[^"\n]*?&[^"\n]*?)"/u',
            '/"([^"\n]*?&[^"\n]*?)"/u',
            '/"([^"\n]*? - [^"\n]*?,[^"\n]*?Brasil)"/u',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $decodedPayload, $matches)) {
                $candidate = $this->sanitizeDisplayName($matches[1]);

                if ($this->looksLikeUrlOrInternalPath($candidate)) {
                    continue;
                }

                if (!empty($candidate)) {
                    return $candidate;
                }
            }
        }

        return $this->sanitizeDisplayName($this->buildIntersectionDisplayName($fallback));
    }

    private function extractPlaceIdFromPayload(string $payloadText, string $displayName): string
    {
        if (preg_match('/"(0x[0-9a-f]+:0x[0-9a-f]+)"/i', $payloadText, $matches)) {
            return $matches[1];
        }

        return 'google_web_' . md5($displayName);
    }

    private function decodeUnicodeLiterals(string $text): string
    {
        $converted = preg_replace_callback('/\\\\u([0-9a-fA-F]{4})/', function (array $matches) {
            $binary = pack('H*', $matches[1]);
            return mb_convert_encoding($binary, 'UTF-8', 'UCS-2BE');
        }, $text);

        return str_replace('\\/', '/', $converted);
    }

    private function looksLikeUrlOrInternalPath(string $value): bool
    {
        $value = mb_strtolower($value);

        return str_contains($value, 'http://')
            || str_contains($value, 'https://')
            || str_contains($value, '/search?')
            || str_contains($value, '\\=')
            || str_contains($value, 'maps.google.com');
    }

    private function buildIntersectionDisplayName(string $query): string
    {
        $normalized = trim(preg_replace('/\s+/', ' ', $query));
        $intersection = preg_replace('/\bcom\b/i', ' & ', $normalized);
        $intersection = preg_replace('/\be\b/i', ' & ', $intersection, 1);
        $intersection = trim(preg_replace('/\s*&\s*/', ' & ', $intersection));

        return mb_strtoupper(mb_substr($intersection, 0, 1)) . mb_substr($intersection, 1);
    }

    private function sanitizeDisplayName(string $value): string
    {
        $decodedEntities = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $withoutTags = strip_tags($decodedEntities);
        $withoutLiterals = str_replace(['\\n', '\\r', '\\t'], ' ', $withoutTags);
        $normalized = preg_replace('/\s+/', ' ', $withoutLiterals);

        return trim($normalized ?? '');
    }

    private function buildQueryVariants(string $query): array
    {
        $normalized = trim(preg_replace('/\s+/', ' ', $query));
        $variants = [$normalized];

        if (preg_match('/\bcom\b/i', $normalized)) {
            $variants[] = preg_replace('/\bcom\b/i', ' e ', $normalized);
            $variants[] = preg_replace('/\bcom\b/i', ' cruzamento com ', $normalized);
            $variants[] = 'cruzamento entre ' . preg_replace('/\bcom\b/i', ' e ', $normalized);
            $variants[] = preg_replace('/\bcom\b/i', ' esquina com ', $normalized);
        }

        return array_values(array_unique(array_filter($variants)));
    }

    private function dedupeAndLimit($items, int $limit)
    {
        return collect($items)
            ->filter(function (array $item) {
                return !empty($item['display_name']) && !empty($item['place_id']);
            })
            ->unique(function (array $item) {
                return ($item['place_id'] ?? '') . '|' . ($item['display_name'] ?? '');
            })
            ->take($limit)
            ->values();
    }

    private function buildLocationMetadata(string $displayName, string $source = 'google_maps_web'): array
    {
        $normalized = $this->sanitizeDisplayName($displayName);
        $parts = array_values(array_filter(array_map('trim', explode(',', $normalized))));

        $addressPart = $parts[0] ?? $normalized;
        $cityPart = $parts[count($parts) - 2] ?? null;
        $countryPart = $parts[count($parts) - 1] ?? null;

        $state = null;
        if (!empty($cityPart) && preg_match('/\b([A-Z]{2})\b/', mb_strtoupper($cityPart), $stateMatch)) {
            $state = $stateMatch[1];
            $cityPart = trim(preg_replace('/\s*-?\s*' . preg_quote($state, '/') . '\b/i', '', $cityPart));
        }

        $neighborhood = null;
        if (str_contains($addressPart, ' - ')) {
            $addressBits = array_values(array_filter(array_map('trim', explode(' - ', $addressPart))));
            $addressPart = $addressBits[0] ?? $addressPart;
            $neighborhood = $addressBits[1] ?? null;
        }

        return [
            'formatted_address' => $normalized,
            'address' => $addressPart ?: null,
            'neighborhood' => $neighborhood,
            'city' => !empty($cityPart) ? $cityPart : null,
            'state' => $state,
            'country' => !empty($countryPart) ? $countryPart : null,
            'source' => $source,
        ];
    }

    private function hasValidCoordinates(array $item): bool
    {
        return isset($item['lat'], $item['lon'])
            && $item['lat'] !== ''
            && $item['lon'] !== ''
            && is_numeric($item['lat'])
            && is_numeric($item['lon']);
    }

    private function enrichItemsWithCoordinatesMetadata($items)
    {
        $coordinateCache = [];
        $textAddressCache = [];

        return collect($items)
            ->map(function (array $item) use (&$coordinateCache, &$textAddressCache) {
                if (!$this->hasValidCoordinates($item)) {
                    return $this->enrichItemWithAddressMetadata($item, $textAddressCache);
                }

                $needsMetadata = empty($item['address'])
                    || empty($item['city'])
                    || empty($item['state'])
                    || empty($item['country']);

                if (!$needsMetadata) {
                    return $this->enrichItemWithAddressMetadata($item, $textAddressCache);
                }

                $lat = (float) $item['lat'];
                $lon = (float) $item['lon'];
                $cacheKey = number_format($lat, 6, '.', '') . '|' . number_format($lon, 6, '.', '');

                if (!array_key_exists($cacheKey, $coordinateCache)) {
                    $coordinateCache[$cacheKey] = $this->resolveLocationByCoordinates($lat, $lon);
                }

                $resolved = $coordinateCache[$cacheKey] ?? null;
                if (empty($resolved)) {
                    return $item;
                }

                $merged = array_merge($item, array_filter([
                    'formatted_address' => $resolved['formatted_address'] ?? null,
                    'address' => $resolved['address'] ?? null,
                    'neighborhood' => $resolved['neighborhood'] ?? null,
                    'city' => $resolved['city'] ?? null,
                    'state' => $resolved['state'] ?? null,
                    'country' => $resolved['country'] ?? null,
                ], function ($value) {
                    return $value !== null && $value !== '';
                }));

                if (!empty($resolved['source'])) {
                    $merged['source'] = ($item['source'] ?? 'google_maps_web') . '+' . $resolved['source'];
                }

                return $this->enrichItemWithAddressMetadata($merged, $textAddressCache);
            })
            ->values();
    }

    private function enrichItemWithAddressMetadata(array $item, array &$textAddressCache = []): array
    {
        $needsMetadata = empty($item['address'])
            || empty($item['city'])
            || empty($item['state'])
            || empty($item['country']);

        if (!$needsMetadata) {
            return $item;
        }

        $searchText = trim((string) ($item['formatted_address'] ?? $item['display_name'] ?? ''));
        if ($searchText === '') {
            return $item;
        }

        if (!array_key_exists($searchText, $textAddressCache)) {
            $textAddressCache[$searchText] = $this->geocodeWithGoogleByAddress($searchText);
        }

        $resolved = $textAddressCache[$searchText] ?? null;
        if (empty($resolved)) {
            return $item;
        }

        $merged = array_merge($item, array_filter([
            'formatted_address' => $resolved['formatted_address'] ?? null,
            'address' => $resolved['address'] ?? null,
            'neighborhood' => $resolved['neighborhood'] ?? null,
            'city' => $resolved['city'] ?? null,
            'state' => $resolved['state'] ?? null,
            'country' => $resolved['country'] ?? null,
        ], function ($value) {
            return $value !== null && $value !== '';
        }));

        if (!empty($resolved['source'])) {
            $merged['source'] = ($item['source'] ?? 'google_maps_web') . '+' . $resolved['source'];
        }

        return $merged;
    }

    private function resolveLocationByCoordinates(float $lat, float $lon): ?array
    {
        $googleResult = $this->reverseGeocodeWithGoogle($lat, $lon);
        if (!empty($googleResult)) {
            return $googleResult;
        }

        $osmResult = $this->reverseGeocodeWithNominatim($lat, $lon);
        if (!empty($osmResult)) {
            return $osmResult;
        }

        return null;
    }

    private function reverseGeocodeWithGoogle(float $lat, float $lon): ?array
    {
        $apiKey = config('services.google_maps.key');

        if (empty($apiKey)) {
            return null;
        }

        try {
            $response = Http::timeout(8)
                ->get('https://maps.googleapis.com/maps/api/geocode/json', [
                    'latlng' => $lat . ',' . $lon,
                    'language' => 'pt-BR',
                    'key' => $apiKey,
                ]);

            if ($response->failed()) {
                return null;
            }

            $payload = $response->json();

            if (($payload['status'] ?? null) !== 'OK') {
                return null;
            }

            $first = $payload['results'][0] ?? null;
            if (!is_array($first)) {
                return null;
            }

            $components = collect($first['address_components'] ?? []);

            $findComponent = function (array $types) use ($components) {
                $component = $components->first(function ($component) use ($types) {
                    $componentTypes = $component['types'] ?? [];

                    foreach ($types as $type) {
                        if (in_array($type, $componentTypes, true)) {
                            return true;
                        }
                    }

                    return false;
                });

                return is_array($component) ? ($component['long_name'] ?? null) : null;
            };

            $route = $findComponent(['route']);
            $streetNumber = $findComponent(['street_number']);

            return [
                'formatted_address' => $this->sanitizeDisplayName((string) ($first['formatted_address'] ?? '')),
                'address' => trim(implode(', ', array_filter([$route, $streetNumber]))),
                'neighborhood' => $findComponent(['sublocality', 'sublocality_level_1', 'neighborhood']),
                'city' => $findComponent(['locality', 'administrative_area_level_2']),
                'state' => $findComponent(['administrative_area_level_1']),
                'country' => $findComponent(['country']),
                'source' => 'google_reverse',
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function geocodeWithGoogleByAddress(string $query): ?array
    {
        $apiKey = config('services.google_maps.key');

        if (empty($apiKey) || $query === '') {
            return null;
        }

        try {
            $response = Http::timeout(8)
                ->get('https://maps.googleapis.com/maps/api/geocode/json', [
                    'address' => $query,
                    'language' => 'pt-BR',
                    'region' => 'br',
                    'key' => $apiKey,
                ]);

            if ($response->failed()) {
                return null;
            }

            $payload = $response->json();

            if (($payload['status'] ?? null) !== 'OK') {
                return null;
            }

            $first = $payload['results'][0] ?? null;
            if (!is_array($first)) {
                return null;
            }

            return $this->extractGoogleAddressComponents($first, 'google_geocode_address');
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function extractGoogleAddressComponents(array $result, string $source): array
    {
        $components = collect($result['address_components'] ?? []);

        $findComponent = function (array $types, bool $shortName = false) use ($components) {
            $component = $components->first(function ($component) use ($types) {
                $componentTypes = $component['types'] ?? [];

                foreach ($types as $type) {
                    if (in_array($type, $componentTypes, true)) {
                        return true;
                    }
                }

                return false;
            });

            if (!is_array($component)) {
                return null;
            }

            return $shortName
                ? ($component['short_name'] ?? null)
                : ($component['long_name'] ?? null);
        };

        $route = $findComponent(['route']);
        $streetNumber = $findComponent(['street_number']);
        $city = $findComponent(['locality', 'administrative_area_level_2', 'postal_town']);
        $stateShort = $findComponent(['administrative_area_level_1'], true);
        $stateLong = $findComponent(['administrative_area_level_1']);

        return [
            'formatted_address' => $this->sanitizeDisplayName((string) ($result['formatted_address'] ?? '')),
            'address' => trim(implode(', ', array_filter([$route, $streetNumber]))),
            'neighborhood' => $findComponent(['sublocality', 'sublocality_level_1', 'neighborhood']),
            'city' => $city,
            'state' => $stateShort ?: $stateLong,
            'country' => $findComponent(['country']),
            'source' => $source,
        ];
    }

    private function reverseGeocodeWithNominatim(float $lat, float $lon): ?array
    {
        try {
            $response = Http::timeout(8)
                ->withHeaders([
                    'User-Agent' => 'FlashCertificados/1.0 (reverse-geocoding)',
                    'Accept-Language' => 'pt-BR,pt;q=0.9,en;q=0.8',
                ])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'format' => 'jsonv2',
                    'lat' => $lat,
                    'lon' => $lon,
                    'zoom' => 18,
                    'addressdetails' => 1,
                ]);

            if ($response->failed()) {
                return null;
            }

            $payload = $response->json();
            if (!is_array($payload)) {
                return null;
            }

            $address = $payload['address'] ?? [];
            $city = $address['city']
                ?? $address['town']
                ?? $address['village']
                ?? $address['municipality']
                ?? $address['county']
                ?? null;

            $street = $address['road'] ?? $address['pedestrian'] ?? $address['residential'] ?? null;
            $houseNumber = $address['house_number'] ?? null;

            return [
                'formatted_address' => $this->sanitizeDisplayName((string) ($payload['display_name'] ?? '')),
                'address' => trim(implode(', ', array_filter([$street, $houseNumber]))),
                'neighborhood' => $address['suburb'] ?? $address['neighbourhood'] ?? null,
                'city' => $city,
                'state' => $address['state'] ?? null,
                'country' => $address['country'] ?? null,
                'source' => 'nominatim_reverse',
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function normalizeAddressWithGemini(string $query): array
    {
        $geminiKey = config('services.gemini.key');
        $geminiBaseUrl = config('services.gemini.base_url');

        if (empty($geminiKey) || empty($geminiBaseUrl)) {
            return [
                'query' => $query,
                'lat' => null,
                'lon' => null,
            ];
        }

        try {
            $gemini = new GeminiService();
            $prompt = "Converta a busca em linguagem natural para uma consulta curta e objetiva para Google Maps no Brasil.\n"
                . "Regras:\n"
                . "1) Retorne JSON puro, sem markdown, sem explicações.\n"
                . "2) Para cruzamentos, use padrão: 'Rua A e Rua B, Cidade UF, Brasil'.\n"
                . "3) Não invente número de endereço.\n"
                . "4) Se conseguir inferir latitude e longitude, preencha; se não, use null.\n"
                . "Formato esperado: {\"query\":\"...\",\"lat\":null|numero,\"lon\":null|numero}.\n"
                . "Busca original: {$query}";

            $normalized = trim($gemini->interpret($prompt, $query));

            if (empty($normalized)) {
                return [
                    'query' => $query,
                    'lat' => null,
                    'lon' => null,
                ];
            }

            $jsonText = $this->extractFirstJsonObject($normalized);
            if (empty($jsonText)) {
                $fallback = trim(preg_replace('/[`"\n\r]+/', ' ', $normalized));
                $fallback = trim(preg_replace('/\s+/', ' ', $fallback));

                return [
                    'query' => $fallback ?: $query,
                    'lat' => null,
                    'lon' => null,
                ];
            }

            $decoded = json_decode($jsonText, true);
            if (!is_array($decoded)) {
                return [
                    'query' => $query,
                    'lat' => null,
                    'lon' => null,
                ];
            }

            $normalizedQuery = trim((string)($decoded['query'] ?? ''));

            return [
                'query' => $normalizedQuery ?: $query,
                'lat' => isset($decoded['lat']) && is_numeric($decoded['lat']) ? (float)$decoded['lat'] : null,
                'lon' => isset($decoded['lon']) && is_numeric($decoded['lon']) ? (float)$decoded['lon'] : null,
            ];
        } catch (\Throwable $e) {
            Log::warning('Gemini normalization failed', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            return [
                'query' => $query,
                'lat' => null,
                'lon' => null,
            ];
        }
    }

    private function extractFirstJsonObject(string $text): ?string
    {
        $trimmed = trim($text);

        if (str_starts_with($trimmed, '```')) {
            $trimmed = preg_replace('/^```(?:json)?\s*/i', '', $trimmed);
            $trimmed = preg_replace('/\s*```$/', '', $trimmed);
            $trimmed = trim($trimmed);
        }

        $start = strpos($trimmed, '{');
        $end = strrpos($trimmed, '}');

        if ($start === false || $end === false || $end <= $start) {
            return null;
        }

        return substr($trimmed, $start, $end - $start + 1);
    }

    private function notFoundAddressResults(string $query)
    {
        $metadata = $this->buildLocationMetadata('Endereço não encontrado para a consulta informada.', 'not_found');

        return [[
            'place_id' => 'not_found_' . md5($query),
            'display_name' => 'Endereço não encontrado para a consulta informada.',
            'lat' => '',
            'lon' => '',
            'formatted_address' => $metadata['formatted_address'],
            'address' => null,
            'neighborhood' => null,
            'city' => null,
            'state' => null,
            'country' => null,
            'source' => $metadata['source'],
        ]];
    }
}
