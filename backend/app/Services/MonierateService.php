<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class MonierateService
{
    private const API_URL = 'https://api.monierate.com/core/rates/latest.json';

    public function getUsdNgnParallelRate(): float
    {
        $apiKey = config('services.monierate.api_key');

        if (!$apiKey) {
            throw new RuntimeException('Monierate API key is not configured.');
        }

        $response = Http::withHeaders([
            'api_key' => $apiKey,
        ])->acceptJson()->get(self::API_URL, [
            'base' => 'USD',
            'market' => 'parallel',
        ]);

        if (!$response->successful()) {
            throw new RuntimeException(
                'Monierate API request failed with status ' . $response->status()
            );
        }

        $ngnRate = $response->json('data.rates.NGN');

        if (!is_numeric($ngnRate) || (float) $ngnRate <= 0) {
            throw new RuntimeException('Monierate returned an invalid USD/NGN rate.');
        }

        return (float) $ngnRate;
    }
}