<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->date('date')->nullable()->change();
            $table->decimal('total_price', 15, 2)->nullable()->change();
            $table->text('notes')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->date('date')->nullable(false)->change();
            $table->decimal('total_price', 15, 2)->nullable(false)->change();
            $table->text('notes')->nullable()->change();
        });
    }
};