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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->string('reference')->unique();

            $table->foreignId('customer_id')
                ->nullable()
                ->constrained('customers')
                ->nullOnDelete();

            $table->decimal('amount', 15, 2);

            $table->string('currency', 3)->default('NGN');

            $table->string('email');

            $table->string('title');

            $table->text('description')->nullable();

            $table->string('status')->default('pending');

            $table->string('authorization_url')->nullable();

            $table->string('access_code')->nullable();

            $table->string('gateway')->default('paystack');

            $table->timestamps();

            $table->index('customer_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};