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
        Schema::create('appointments', function (Blueprint $table) {
            $table->string('id')->primary();

            // Customer who owns the appointment
            $table->foreignId('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();

            // Vehicle being serviced
            $table->foreignId('vehicle_id')
                ->constrained('customer_vehicles')
                ->cascadeOnDelete();

            // Selected service
            $table->string('service_id');

            // Assigned technician
            $table->string('technician_id')->nullable();

            // Keep frontend-compatible display name
            $table->string('assigned_technician')->nullable();

            $table->date('date');
            $table->time('scheduled_time');

            $table->enum('status', [
                'pending',
                'confirmed',
                'in_progress',
                'completed',
                'cancelled',
            ])->default('pending');

            $table->enum('payment_status', [
                'pending',
                'paid',
                'failed',
                'refunded',
            ])->default('pending');

            $table->decimal('total_price', 15, 2)->default(0);

            $table->text('notes')->nullable();

            $table->timestamps();

            // Helpful indexes for availability checks
            $table->index([
                'technician_id',
                'date',
                'scheduled_time',
            ]);

            $table->index([
                'customer_id',
                'date',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
