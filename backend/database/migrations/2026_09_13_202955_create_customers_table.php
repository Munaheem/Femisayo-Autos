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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->text('vehicle_info')->nullable();

            $table->decimal('total_spent', 15, 2)
                ->default(0);

            $table->unsignedInteger('loyalty_points')
                ->default(0);

            $table->enum('tier', [
                'Silver',
                'Gold',
                'Platinum',
                'Femisayo VIP',
                'Apex VIP',
            ])->default('Silver');

            $table->json('encrypted_vault')
                ->nullable();

            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
   public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
