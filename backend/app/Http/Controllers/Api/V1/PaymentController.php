<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Payment;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(
        protected PaystackService $paystack
    ) {}

    public function initialize(Request $request)
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
}