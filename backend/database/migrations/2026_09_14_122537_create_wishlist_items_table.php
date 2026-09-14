<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->string('part_id');

            $table->timestamps();

            $table->unique(['customer_id', 'part_id']);
            $table->index('part_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlist_items');
    }
};