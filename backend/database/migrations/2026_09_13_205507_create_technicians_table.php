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
        Schema::create('technicians', function (Blueprint $table) {
            $table->string('id')->primary();

            $table->string('name');
            $table->string('specialty');
            $table->unsignedInteger('experience_years')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->string('avatar')->nullable();

            $table->enum('status', [
                'available',
                'in_bay',
                'off_duty',
            ])->default('available');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('technicians');
    }
};
