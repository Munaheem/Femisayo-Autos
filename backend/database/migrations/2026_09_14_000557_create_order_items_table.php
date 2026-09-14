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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            $table->string('order_id');

            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->cascadeOnDelete();

            $table->string('part_id');

            $table->string('part_name');
            $table->string('brand');

            $table->decimal('price', 15, 2);

            $table->unsignedInteger('quantity');

            $table->string('image')->nullable();

            $table->timestamps();

            $table->index(['order_id']);
            $table->index(['part_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
