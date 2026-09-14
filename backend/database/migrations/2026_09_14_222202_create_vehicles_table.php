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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->string('id')->primary();

            $table->string('make');
            $table->string('model');
            $table->unsignedSmallInteger('year');

            $table->decimal('price', 15, 2);
            $table->unsignedInteger('mileage')->default(0);

            $table->string('transmission');
            $table->string('fuel');
            $table->string('body_type');

            $table->unsignedSmallInteger('horsepower')->nullable();
            $table->decimal('zero_to_sixty', 4, 2)->nullable();

            $table->string('engine')->nullable();
            $table->string('vin')->nullable()->unique();
            $table->string('color')->nullable();

            $table->boolean('in_stock')->default(true);

            $table->string('image')->nullable();

            $table->json('gallery')->nullable();
            $table->json('badges')->nullable();
            $table->json('features')->nullable();

            $table->timestamps();

            $table->index(['make', 'model']);
            $table->index('year');
            $table->index('in_stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};