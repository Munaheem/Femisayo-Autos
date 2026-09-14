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
        Schema::create('notification_user', function (Blueprint $table) {
            $table->id();

            $table->foreignId('notification_id')
                ->constrained('notifications')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->boolean('is_read')->default(false);

            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            /*
             * A user should receive a particular notification
             * only once.
             */
            $table->unique([
                'notification_id',
                'user_id',
            ]);

            $table->index('user_id');
            $table->index('is_read');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_user');
    }
};