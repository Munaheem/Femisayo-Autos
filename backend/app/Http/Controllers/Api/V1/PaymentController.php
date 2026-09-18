<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Payment;
use App\Services\LoyaltyService;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(
        protected PaystackService $paystack,
        protected LoyaltyService $loyalty
    ) {}

    /**
     * Initialize a Paystack payment.
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

        $customer = Customer::where(
            'user_id',
            $user->id
        )->first();

        try {
            $payment = Payment::create([
                'reference' => 'PAY-' . strtoupper(
                    Str::random(16)
                ),
                'customer_id' => $customer?->id,
                'amount' => $validated['amount'],
                'currency' => 'NGN',
                'email' => $validated['email'],
                'title' => $validated['title'],
                'description' =>
                    $validated['description'] ?? null,
                'status' => 'pending',
                'gateway' => 'paystack',
            ]);

            $paystack = $this->paystack->initializeTransaction(
                $validated['email'],
                (float) $validated['amount'],
                $validated['title'],
                $validated['description'] ?? null
            );

            $payment->update([
                'reference' =>
                    $paystack['reference']
                    ?? $payment->reference,
                'authorization_url' =>
                    $paystack['authorizationUrl'] ?? null,
                'access_code' =>
                    $paystack['accessCode'] ?? null,
            ]);

            return response()->json([
                'reference' => $payment->reference,
                'authorizationUrl' =>
                    $payment->authorization_url,
                'accessCode' =>
                    $payment->access_code,
            ], 201);

        } catch (Throwable $e) {
            Log::error(
                'Paystack transaction initialization failed.',
                [
                    'user_id' => $user->id,
                    'email' => $validated['email'],
                    'amount' => $validated['amount'],
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

        try {
            $transaction = $this->paystack
                ->verifyTransaction($payment->reference);

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

            return response()->json([
                'reference' => $payment->fresh()->reference,
                'status' => $payment->fresh()->status,
                'amount' => (float) $payment->fresh()->amount,
                'currency' => $payment->fresh()->currency,
                'gateway' => $payment->fresh()->gateway,
            ]);

        } catch (Throwable $e) {
            Log::error(
                'Paystack transaction verification failed.',
                [
                    'user_id' => $user->id,
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
         * Paystack signs the raw request body using HMAC SHA-512.
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

        /*
         * Use the exact raw request body.
         * Do not decode and re-encode the JSON before
         * calculating the signature.
         */
        $payload = $request->getContent();

        $expectedSignature = hash_hmac(
            'sha512',
            $payload,
            $secretKey
        );

        /*
         * Compare the supplied Paystack signature against
         * our calculated HMAC signature.
         */
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
         * Decode the verified webhook payload only after
         * the signature has been successfully validated.
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
         * We currently process successful and failed
         * charge events.
         */
        if (! in_array(
            $eventName,
            [
                'charge.success',
                'charge.failed',
            ],
            true
        )) {
            /*
             * Paystack may send other legitimate events.
             * Acknowledge them without modifying payments.
             */
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
         * A valid Paystack event for an unknown transaction
         * should not create a payment automatically.
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
         * Do not allow a previously successful payment to
         * be downgraded by a later failed event.
         */
        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Payment already completed.',
            ]);
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
}