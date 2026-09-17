<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Upgrade appointments to the frontend API contract.
     */
    public function up(): void
    {
        /*
         * 1. Add the new contract fields.
         */
        Schema::table('appointments', function (Blueprint $table) {
            $table->json('additional_services')
                ->nullable()
                ->after('service_id');

            $table->date('scheduled_date')
                ->nullable()
                ->after('assigned_technician');

            $table->text('customer_notes')
                ->nullable()
                ->after('payment_status');

            $table->text('technician_notes')
                ->nullable()
                ->after('customer_notes');

            $table->decimal('total_cost', 15, 2)
                ->default(0)
                ->after('technician_notes');

            $table->decimal('deposit_amount', 15, 2)
                ->default(0)
                ->after('total_cost');

            $table->string('payment_transaction_id')
                ->nullable()
                ->after('deposit_amount');
        });

        /*
         * 2. Copy existing data into the new fields.
         */
        DB::table('appointments')->update([
            'scheduled_date' => DB::raw('date'),
            'customer_notes' => DB::raw('notes'),
            'total_cost' => DB::raw('total_price'),
        ]);

        /*
         * 3. Replace the old status enum with the contract statuses.
         *
         * Existing "in_progress" appointments are migrated to
         * "in_repair", which is the closest contract equivalent.
         */
        DB::statement("
            ALTER TABLE appointments
            MODIFY status ENUM(
                'pending',
                'confirmed',
                'in_inspection',
                'in_repair',
                'quality_check',
                'ready_for_pickup',
                'completed',
                'cancelled'
            ) NOT NULL DEFAULT 'pending'
        ");

        DB::table('appointments')
            ->where('status', 'in_progress')
            ->update([
                'status' => 'in_repair',
            ]);

        /*
         * 4. Replace the old payment statuses with the contract statuses.
         *
         * Existing "failed" payments are migrated to "pending"
         * because "failed" is not part of the appointment contract.
         */
        DB::statement("
            ALTER TABLE appointments
            MODIFY payment_status ENUM(
                'pending',
                'deposit_paid',
                'paid',
                'refunded'
            ) NOT NULL DEFAULT 'pending'
        ");

        DB::table('appointments')
            ->where('payment_status', 'failed')
            ->update([
                'payment_status' => 'pending',
            ]);
    }

    /**
     * Reverse the appointment contract upgrade.
     */
    public function down(): void
    {
        /*
         * Restore contract data to the old fields first.
         */
        DB::table('appointments')->update([
            'date' => DB::raw('scheduled_date'),
            'notes' => DB::raw('customer_notes'),
            'total_price' => DB::raw('total_cost'),
        ]);

        /*
         * Restore old status values.
         */
        DB::table('appointments')
            ->whereIn('status', [
                'in_inspection',
                'in_repair',
                'quality_check',
                'ready_for_pickup',
            ])
            ->update([
                'status' => 'in_progress',
            ]);

        DB::statement("
            ALTER TABLE appointments
            MODIFY status ENUM(
                'pending',
                'confirmed',
                'in_progress',
                'completed',
                'cancelled'
            ) NOT NULL DEFAULT 'pending'
        ");

        /*
         * Restore old payment statuses.
         */
        DB::statement("
            ALTER TABLE appointments
            MODIFY payment_status ENUM(
                'pending',
                'paid',
                'failed',
                'refunded'
            ) NOT NULL DEFAULT 'pending'
        ");

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'additional_services',
                'scheduled_date',
                'customer_notes',
                'technician_notes',
                'total_cost',
                'deposit_amount',
                'payment_transaction_id',
            ]);
        });
    }
};