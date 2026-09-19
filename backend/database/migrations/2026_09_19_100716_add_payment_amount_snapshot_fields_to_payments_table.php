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
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('amount_usd', 12, 2)
                ->after('amount');

            $table->unsignedBigInteger('amount_kobo')
                ->after('amount_usd');

            $table->decimal('ngn_per_usd', 12, 2)
                ->after('amount_kobo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'amount_usd',
                'amount_kobo',
                'ngn_per_usd',
            ]);
        });
    }
};