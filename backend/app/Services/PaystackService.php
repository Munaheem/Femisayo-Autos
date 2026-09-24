<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class PaystackService
{
    protected string $baseUrl = 'https://api.paystack.co';

    public function __construct(
        protected MonierateService $monierate
    ) {
    }

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

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException(
                'A valid customer email is required.'
            );
        }

        if ($amountUsd <= 0) {
            throw new RuntimeException(
                'Payment amount must be greater than zero.'
            );
        }

        /*
         * Get the current Nigerian parallel-market
         * USD → NGN exchange rate from Monierate.
         */
        $ngnPerUsd = $this->monierate->getUsdNgnParallelRate();

        if ($ngnPerUsd <= 0) {
            throw new RuntimeException(
                'Invalid USD to NGN exchange rate.'
            );
        }

        /*
         * Convert USD to NGN.
         */
        $amountInNaira = round(
            $amountUsd * $ngnPerUsd,
            2
        );

        /*
         * Paystack expects NGN amounts in kobo.
         *
         * Using the rounded NGN amount before converting to kobo
         * keeps the value deterministic.
         */
        $amountInKobo = (int) round(
            $amountInNaira * 100
        );

        if ($amountInKobo <= 0) {
            throw new RuntimeException(
                'Payment amount must be greater than zero.'
            );
        }

        /*
         * IMPORTANT:
         *
         * Do not automatically retry transaction initialization.
         * If Paystack accepts the transaction but the response is
         * lost, retrying can potentially create a second transaction.
         */
        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->asJson()
            ->connectTimeout(10)
            ->timeout(30)
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
            $response->json('status') !== true
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
            'amountUsd' => $amountUsd,
            'amountNgn' => $amountInNaira,
            'amountKobo' => $amountInKobo,
            'ngnPerUsd' => $ngnPerUsd,
        ];
    }

   
    public function verifyTransaction(
        string $reference
    ): array {
        $secretKey = config('services.paystack.secret_key');

        if (! $secretKey) {
            throw new RuntimeException(
                'Paystack secret key is not configured.'
            );
        }

        $reference = trim($reference);

        if ($reference === '') {
            throw new RuntimeException(
                'Paystack transaction reference is required.'
            );
        }

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->connectTimeout(10)
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
            $response->json('status') !== true
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