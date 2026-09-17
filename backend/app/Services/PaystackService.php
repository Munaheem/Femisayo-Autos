<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class PaystackService
{
    protected string $baseUrl = 'https://api.paystack.co';

    /**
     * Initialize a Paystack transaction.
     *
     * The application accepts the amount in USD.
     * Paystack receives the converted NGN amount in kobo.
     */
    public function initializeTransaction(
        string $email,
        float $amountUsd,
        string $title,
        ?string $description = null
    ): array {
        $secretKey = config('services.paystack.secret_key');

        if (! $secretKey) {
            throw new RuntimeException(
                'Paystack secret key is not configured.'
            );
        }

        $ngnPerUsd = (float) config(
            'services.paystack.ngn_per_usd',
            1500
        );

        if ($ngnPerUsd <= 0) {
            throw new RuntimeException(
                'Invalid USD to NGN exchange rate.'
            );
        }

        /*
         * Convert the application amount from USD to NGN.
         */
        $amountInNaira = $amountUsd * $ngnPerUsd;

        /*
         * Paystack expects NGN amounts in kobo.
         */
        $amountInKobo = (int) round(
            $amountInNaira * 100
        );

        if ($amountInKobo <= 0) {
            throw new RuntimeException(
                'Payment amount must be greater than zero.'
            );
        }

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->asJson()
            ->timeout(30)
            ->retry(2, 1000)
            ->post(
                $this->baseUrl . '/transaction/initialize',
                [
                    'email' => $email,
                    'amount' => $amountInKobo,
                    'currency' => 'NGN',

                    'metadata' => [
                        'title' => $title,
                        'description' => $description,
                        'amountUsd' => $amountUsd,
                        'ngnPerUsd' => $ngnPerUsd,
                        'amountNgn' => $amountInNaira,
                    ],
                ]
            );

        if ($response->failed()) {
            throw new RuntimeException(
                $response->json('message')
                    ?? 'Unable to initialize Paystack transaction.'
            );
        }

        $data = $response->json('data');

        if (
            ! $response->json('status')
            || ! is_array($data)
        ) {
            throw new RuntimeException(
                $response->json('message')
                    ?? 'Paystack transaction initialization failed.'
            );
        }

        if (
            empty($data['reference'])
            || empty($data['authorization_url'])
        ) {
            throw new RuntimeException(
                'Paystack returned an incomplete transaction response.'
            );
        }

        return [
            'reference' => $data['reference'],
            'authorizationUrl' => $data['authorization_url'],
            'accessCode' => $data['access_code'] ?? null,
        ];
    }

    /**
     * Verify a Paystack transaction.
     */
    public function verifyTransaction(
        string $reference
    ): array {
        $secretKey = config('services.paystack.secret_key');

        if (! $secretKey) {
            throw new RuntimeException(
                'Paystack secret key is not configured.'
            );
        }

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->timeout(30)
            ->retry(2, 1000)
            ->get(
                $this->baseUrl
                . '/transaction/verify/'
                . urlencode($reference)
            );

        if ($response->failed()) {
            throw new RuntimeException(
                $response->json('message')
                    ?? 'Unable to verify Paystack transaction.'
            );
        }

        $data = $response->json('data');

        if (
            ! $response->json('status')
            || ! is_array($data)
        ) {
            throw new RuntimeException(
                $response->json('message')
                    ?? 'Paystack transaction verification failed.'
            );
        }

        return $data;
    }
}