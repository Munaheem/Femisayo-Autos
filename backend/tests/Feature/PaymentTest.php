<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\User;
use App\Services\PaystackService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Mockery;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * An existing payment must continue to verify against the
     * exchange rate captured when the payment was created,
     * even if the global exchange rate changes later.
     */
    public function test_payment_verification_uses_the_original_kobo_snapshot(): void
    {
        /*
         * The payment was originally created at:
         *
         * $100 USD × ₦1,500 = ₦150,000
         * ₦150,000 × 100 = 15,000,000 kobo
         */
        $originalRate = 1500;

        $amountUsd = 100;

        $amountKobo = 15_000_000;

        /*
         * Change the application's current exchange rate.
         *
         * If the controller incorrectly recalculates using the
         * current rate, it would expect 16,000,000 kobo instead.
         */
        config([
            'services.paystack.ngn_per_usd' => $originalRate,
        ]);

        /** @var User $user */
        $user = User::factory()->create([
            'role' => 'customer',
        ]);

        $customerId = DB::table('customers')->insertGetId([
            'user_id' => $user->id,
            'name' => 'Payment Test Customer',
            'email' => $user->email,
            'phone' => '08000000000',
        ]);

        $payment = Payment::create([
            'reference' => 'PAY-REGRESSION-TEST',
            'customer_id' => $customerId,
            'amount' => $amountUsd,
            'amount_usd' => $amountUsd,
            'amount_kobo' => $amountKobo,
            'ngn_per_usd' => $originalRate,
            'currency' => 'NGN',
            'email' => $user->email,
            'title' => 'Regression Test Payment',
            'description' => 'Exchange-rate snapshot test',
            'status' => 'pending',
            'gateway' => 'paystack',
        ]);

        /*
         * Simulate the exchange rate changing after the payment
         * was initialized.
         */
        config([
            'services.paystack.ngn_per_usd' => 1600,
        ]);

        /*
         * Paystack still reports the original amount:
         *
         * 15,000,000 kobo.
         */
        $paystack = Mockery::mock(PaystackService::class);

        $paystack
            ->shouldReceive('verifyTransaction')
            ->once()
            ->with($payment->reference)
            ->andReturn([
                'status' => 'success',
                'reference' => $payment->reference,
                'amount' => $amountKobo,
                'currency' => 'NGN',
            ]);

        $this->app->instance(
            PaystackService::class,
            $paystack
        );

        /*
         * Authenticate as the customer who owns the payment.
         */
        $response = $this
            ->actingAs($user)
            ->getJson(
                '/api/v1/payments/verify/'
                . $payment->reference
            );

        $response
            ->assertSuccessful()
            ->assertJson([
                'reference' => $payment->reference,
                'status' => 'paid',
                'amount' => $amountUsd,
                'currency' => 'NGN',
                'gateway' => 'paystack',
            ]);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'paid',
            'amount_kobo' => $amountKobo,
            'ngn_per_usd' => $originalRate,
        ]);
    }
}