<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    /**
     * Apply a successfully paid payment to the customer's
     * cumulative spending and loyalty balance.
     *
     * Returns true when this payment caused the loyalty
     * balance to be updated, false when it was already applied.
     */
    public function applyPaidPayment(Payment $payment): bool
    {
        return DB::transaction(function () use ($payment) {
            $lockedPayment = Payment::whereKey($payment->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedPayment) {
                return false;
            }

            /*
             * The payment has already been processed.
             * This prevents a Paystack webhook and a manual
             * verification from awarding the same payment twice.
             */
            if ($lockedPayment->status === 'paid') {
                return false;
            }

            $customer = Customer::whereKey($lockedPayment->customer_id)
                ->lockForUpdate()
                ->first();

            /*
             * A payment without an associated customer cannot
             * update customer loyalty.
             */
            if (! $customer) {
                $lockedPayment->update([
                    'status' => 'paid',
                ]);

                return false;
            }

            $amount = (float) $lockedPayment->amount;

            $newTotalSpent = (float) $customer->total_spent + $amount;

            $customer->update([
                'total_spent' => $newTotalSpent,
                'loyalty_points' => (int) floor($newTotalSpent / 5),
                'tier' => $newTotalSpent > 500
                    ? 'Platinum'
                    : 'Gold',
            ]);

            $lockedPayment->update([
                'status' => 'paid',
            ]);

            return true;
        });
    }
}