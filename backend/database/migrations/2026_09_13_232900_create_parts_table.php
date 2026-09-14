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
        Schema::create('parts', function (Blueprint $table) {
            $table->string('id')->primary();

            $table->string('name');
            $table->string('brand');
            $table->string('part_number')->index();
            $table->string('category')->index();

            $table->decimal('price', 15, 2);
            $table->decimal('original_price', 15, 2)->nullable();

            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);

            $table->unsignedInteger('in_stock')->default(0);

            $table->json('fitment_makes')->nullable();
            $table->string('fitment_years')->nullable();

            $table->string('image')->nullable();
            $table->json('gallery')->nullable();

            $table->text('description')->nullable();

            $table->boolean('is_best_seller')->default(false);
            $table->string('badge')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parts');
    }
};
