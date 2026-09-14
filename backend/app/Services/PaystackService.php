<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class PaystackService
{
    protected string $baseUrl = 'https://api.paystack.co';

    public function initializeTransaction(
        string $email,
        float $amount,
        string $title,
        ?string $description = null
    ): array {
        $secretKey = config('services.paystack.secret_key');

        if (! $secretKey) {
            throw new RuntimeException(
                'Paystack secret key is not configured.'
            );
        }

        // Paystack expects NGN amounts in kobo.
        $amountInKobo = (int) round($amount * 100);

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->post(
                $this->baseUrl . '/transaction/initialize',
                [
                    'email' => $email,
                    'amount' => $amountInKobo,
                    'currency' => 'NGN',
                    'metadata' => json_encode([
                        'title' => $title,
                        'description' => $description,
                    ]),
                ]
            );

        if ($response->failed()) {
            throw new RuntimeException(
                $response->json('message')
                    ?? 'Unable to initialize Paystack transaction.'
            );
        }

        $data = $response->json('data');

        if (! $response->json('status') || ! is_array($data)) {
            throw new RuntimeException(
                $response->json('message')
                    ?? 'Paystack transaction initialization failed.'
            );
        }

        return [
            'reference' => $data['reference'] ?? null,
            'authorizationUrl' =>
                $data['authorization_url'] ?? null,
            'accessCode' => $data['access_code'] ?? null,
        ];

        
    }
    public function verifyTransaction(string $reference): array
        {
            $secretKey = config('services.paystack.secret_key');

            if (! $secretKey) {
                throw new RuntimeException(
                    'Paystack secret key is not configured.'
                );
            }

            $response = Http::withToken($secretKey)
                ->acceptJson()
                ->get(
                    $this->baseUrl . '/transaction/verify/' . urlencode($reference)
                );

            if ($response->failed()) {
                throw new RuntimeException(
                    $response->json('message')
                        ?? 'Unable to verify Paystack transaction.'
                );
            }

            $data = $response->json('data');

            if (! $response->json('status') || ! is_array($data)) {
                throw new RuntimeException(
                    $response->json('message')
                        ?? 'Paystack transaction verification failed.'
                );
            }

            return $data;
    }
}