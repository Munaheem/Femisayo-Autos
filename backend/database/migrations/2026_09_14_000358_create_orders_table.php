<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->string('customer_name');
            $table->string('customer_email');

            $table->text('shipping_address');

            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('shipping', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            $table->string('coupon_applied')->nullable();

            $table->string('payment_method');
            $table->enum('payment_status', [
                'pending',
                'deposit_paid',
                'paid',
                'refunded',
            ])->default('pending');

            $table->enum('fulfillment_status', [
                'processing',
                'confirmed',
                'shipped',
                'delivered',
                'cancelled',
            ])->default('processing');

            $table->string('status')->nullable();

            $table->string('estimated_delivery')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('carrier')->nullable();

            $table->timestamps();

            $table->index(['customer_id', 'created_at']);
            $table->index(['payment_status']);
            $table->index(['fulfillment_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
