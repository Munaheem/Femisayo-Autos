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
        Schema::create('services', function (Blueprint $table) {
            $table->string('id')->primary();

            $table->string('name');
            $table->string('category');
            $table->decimal('price', 15, 2);
            $table->unsignedInteger('duration_minutes');
            $table->text('description')->nullable();
            $table->string('recommended_mileage')->nullable();

            $table->json('features')->nullable();

            $table->boolean('popular')->default(false);
            $table->boolean('featured')->default(false);

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
