<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\LoyaltyService;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(
        protected PaystackService $paystack,
        protected LoyaltyService $loyalty
    ) {
    }

    /**
     * Initialize a Paystack payment.
     *
     * The application accepts the amount in USD.
     * Paystack receives the converted NGN amount in kobo.
     *
     * The USD -> NGN rate is obtained from Monierate's
     * Nigerian parallel-market rate at initialization time.
     */
    public function initialize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $user = $request->user();

        $customer = DB::table('customers')
            ->where('user_id', $user->id)
            ->first();

        try {
            /*
             * The application amount is in USD.
             */
            $amountUsd = (float) $validated['amount'];

            if ($amountUsd <= 0) {
                throw new RuntimeException(
                    'Payment amount must be greater than zero.'
                );
            }

            /*
             * Get the LIVE Nigerian parallel-market USD/NGN rate.
             *
             * PaystackService obtains this from Monierate.
             */
            $paystack = $this->paystack->initializeTransaction(
                $validated['email'],
                $amountUsd,
                $validated['title'],
                $validated['description'] ?? null
            );

            /*
             * PaystackService has already captured:
             *
             * - amountUsd
             * - amountNgn
             * - amountKobo
             * - ngnPerUsd
             *
             * These values represent the exact exchange-rate snapshot
             * used for this transaction.
             */
            $ngnPerUsd = (float) ($paystack['ngnPerUsd'] ?? 0);
            $amountInNaira = (float) ($paystack['amountNgn'] ?? 0);
            $amountInKobo = (int) ($paystack['amountKobo'] ?? 0);

            if ($ngnPerUsd <= 0) {
                throw new RuntimeException(
                    'Invalid USD to NGN exchange rate.'
                );
            }

            if ($amountInKobo <= 0) {
                throw new RuntimeException(
                    'Payment amount must be greater than zero.'
                );
            }

            /*
             * Create our local payment record.
             *
             * The USD amount, NGN amount, Kobo amount, and exchange rate
             * are permanently captured so future exchange-rate changes
             * cannot affect this payment.
             */
            $payment = Payment::create([
                /*
                 * We use Paystack's reference as the local reference.
                 */
                'reference' =>
                    $paystack['reference']
                    ?? 'PAY-' . strtoupper(Str::random(16)),

                'customer_id' => $customer?->id,

                /*
                 * Original application amount in USD.
                 */
                'amount' => $amountUsd,

                /*
                 * Immutable payment snapshot.
                 */
                'amount_usd' => $amountUsd,
                'amount_kobo' => $amountInKobo,
                'ngn_per_usd' => $ngnPerUsd,

                /*
                 * Gateway transaction is denominated in NGN.
                 */
                'currency' => 'NGN',

                'email' => $validated['email'],
                'title' => $validated['title'],
                'description' =>
                    $validated['description'] ?? null,

                'status' => 'pending',
                'gateway' => 'paystack',

                /*
                 * Store the Paystack checkout information immediately.
                 */
                'authorization_url' =>
                    $paystack['authorizationUrl'] ?? null,

                'access_code' =>
                    $paystack['accessCode'] ?? null,
            ]);

            /*
             * Return the payment details to the frontend.
             *
             * Including the conversion information makes the amount
             * transparent to the frontend/customer.
             */
            return response()->json([
                'reference' => $payment->reference,

                'authorizationUrl' =>
                    $payment->authorization_url,

                'accessCode' =>
                    $payment->access_code,

                'amountUsd' =>
                    (float) $payment->amount_usd,

                'amountNgn' =>
                    $amountInNaira,

                'amountKobo' =>
                    $amountInKobo,

                'ngnPerUsd' =>
                    $ngnPerUsd,

                'currency' =>
                    $payment->currency,

                'status' =>
                    $payment->status,
            ], 201);

        } catch (Throwable $e) {
            Log::error(
                'Paystack transaction initialization failed.',
                [
                    'user_id' => $user->id,
                    'payment_id' => $payment->id ?? null,
                    'error' => $e->getMessage(),
                ]
            );

            if (isset($payment)) {
                $payment->update([
                    'status' => 'failed',
                ]);
            }

            return response()->json([
                'error' => 'Unable to initialize payment.',
            ], 502);
        }
    }

    /**
     * Verify a Paystack payment manually.
     */
    public function verify(string $reference): JsonResponse
    {
        $payment = Payment::where(
            'reference',
            $reference
        )->first();

        if (! $payment) {
            return response()->json([
                'error' => 'Payment not found.',
            ], 404);
        }

        $user = request()->user();

        /*
         * Customers can only verify their own payments.
         */
        if (
            $user->role === 'customer'
            && $payment->customer_id !== null
            && $payment->customer?->user_id !== $user->id
        ) {
            return response()->json([
                'error' =>
                    'You are not authorized to verify this payment.',
            ], 403);
        }

        /*
         * A completed payment does not need to be verified again.
         */
        if ($payment->status === 'paid') {
            return response()->json([
                'reference' => $payment->reference,
                'status' => $payment->status,
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency,
                'gateway' => $payment->gateway,
            ]);
        }

        try {
            $transaction = $this->paystack
                ->verifyTransaction($payment->reference);

            /*
             * Validate the transaction returned by Paystack
             * before changing our local payment status.
             *
             * The comparison uses amount_kobo captured when
             * this payment was initialized.
             */
            if (! $this->paystackTransactionMatchesPayment(
                $transaction,
                $payment
            )) {
                Log::warning(
                    'Paystack verification amount or currency mismatch.',
                    [
                        'payment_id' => $payment->id,
                        'reference' => $payment->reference,
                    ]
                );

                return response()->json([
                    'error' =>
                        'Payment verification data does not match the expected transaction.',
                ], 422);
            }

            $paystackStatus = $transaction['status'] ?? null;

            $status = match ($paystackStatus) {
                'success' => 'paid',
                'failed' => 'failed',
                default => 'pending',
            };

            if ($status === 'paid') {
                $this->loyalty->applyPaidPayment($payment);
            } else {
                $payment->update([
                    'status' => $status,
                ]);
            }

            $payment = $payment->fresh();

            return response()->json([
                'reference' => $payment->reference,
                'status' => $payment->status,
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency,
                'gateway' => $payment->gateway,
            ]);

        } catch (Throwable $e) {
            Log::error(
                'Paystack transaction verification failed.',
                [
                    'user_id' => $user->id,
                    'payment_id' => $payment->id,
                    'reference' => $reference,
                    'error' => $e->getMessage(),
                ]
            );

            return response()->json([
                'error' => 'Unable to verify payment.',
            ], 502);
        }
    }

    /**
     * Handle Paystack webhook events.
     *
     * This endpoint is intentionally unauthenticated because
     * Paystack calls it directly.
     */
    public function webhook(Request $request): JsonResponse
    {
        $secretKey = config('services.paystack.secret_key');

        if (! $secretKey) {
            Log::error(
                'Paystack webhook rejected because the secret key is not configured.'
            );

            return response()->json([
                'error' => 'Webhook configuration error.',
            ], 500);
        }

        /*
         * Paystack signs the exact raw request body
         * using HMAC SHA-512.
         */
        $signature = $request->header(
            'x-paystack-signature'
        );

        if (! $signature) {
            Log::warning(
                'Paystack webhook received without signature.'
            );

            return response()->json([
                'error' => 'Invalid webhook signature.',
            ], 401);
        }

        $payload = $request->getContent();

        $expectedSignature = hash_hmac(
            'sha512',
            $payload,
            $secretKey
        );

        if (! hash_equals(
            $expectedSignature,
            trim($signature)
        )) {
            Log::warning(
                'Paystack webhook received with invalid signature.'
            );

            return response()->json([
                'error' => 'Invalid webhook signature.',
            ], 401);
        }

        /*
         * Decode only after the signature has been verified.
         */
        $event = $request->json()->all();

        $eventName = $event['event'] ?? null;
        $data = $event['data'] ?? null;

        if (! is_array($data)) {
            Log::warning(
                'Paystack webhook received without valid event data.'
            );

            return response()->json([
                'error' => 'Invalid webhook payload.',
            ], 400);
        }

        /*
         * Process only the payment events we support.
         */
        if (! in_array(
            $eventName,
            [
                'charge.success',
                'charge.failed',
            ],
            true
        )) {
            return response()->json([
                'message' => 'Webhook received.',
            ]);
        }

        $reference = $data['reference'] ?? null;

        if (! $reference) {
            Log::warning(
                'Paystack webhook received without transaction reference.',
                [
                    'event' => $eventName,
                ]
            );

            return response()->json([
                'error' => 'Missing transaction reference.',
            ], 400);
        }

        $payment = Payment::where(
            'reference',
            $reference
        )->first();

        /*
         * Never create a local payment from an unknown
         * Paystack transaction.
         */
        if (! $payment) {
            Log::warning(
                'Paystack webhook received for unknown payment.',
                [
                    'event' => $eventName,
                    'reference' => $reference,
                ]
            );

            return response()->json([
                'message' => 'Webhook received.',
            ]);
        }

        /*
         * A paid payment is final.
         * Do not downgrade it because of a later event.
         */
        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Payment already completed.',
            ]);
        }

        /*
         * Verify amount/currency on successful charge events.
         */
        if (
            $eventName === 'charge.success'
            && ! $this->paystackTransactionMatchesPayment(
                $data,
                $payment
            )
        ) {
            Log::warning(
                'Paystack webhook amount or currency mismatch.',
                [
                    'payment_id' => $payment->id,
                    'reference' => $reference,
                ]
            );

            return response()->json([
                'error' => 'Payment data mismatch.',
            ], 422);
        }

        $status = match ($eventName) {
            'charge.success' => 'paid',
            'charge.failed' => 'failed',
            default => 'pending',
        };

        if ($status === 'paid') {
            $this->loyalty->applyPaidPayment($payment);
        } else {
            $payment->update([
                'status' => $status,
            ]);
        }

        Log::info(
            'Paystack webhook processed successfully.',
            [
                'event' => $eventName,
                'reference' => $reference,
                'payment_id' => $payment->id,
                'status' => $status,
            ]
        );

        return response()->json([
            'message' => 'Webhook processed successfully.',
        ]);
    }

    /**
     * Verify that Paystack's transaction amount and currency
     * match the local payment record.
     *
     * The application stores the original payment amount in USD,
     * while Paystack receives NGN converted to Kobo.
     *
     * The expected Kobo amount comes from the immutable payment
     * snapshot captured during initialization.
     */
    protected function paystackTransactionMatchesPayment(
        array $transaction,
        Payment $payment
    ): bool {
        $transactionCurrency = strtoupper(
            (string) ($transaction['currency'] ?? '')
        );

        if ($transactionCurrency !== 'NGN') {
            return false;
        }

        $expectedKobo = (int) $payment->amount_kobo;

        if ($expectedKobo <= 0) {
            return false;
        }

        $actualKobo = (int) (
            $transaction['amount'] ?? 0
        );

        return $actualKobo === $expectedKobo;
    }
}