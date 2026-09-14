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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('message');

            $table->enum('type', [
                'appointment',
                'order',
                'inventory',
                'security',
            ]);

            /*
             * Target:
             *
             * all
             * customers
             * staff
             * admin
             * sales
             * technician
             * customer:{id}
             */
            $table->string('target')->nullable();

            /*
             * Optional relationships to the event
             * that generated the notification.
             */
            $table->string('appointment_id')->nullable();
            $table->string('order_id')->nullable();

            /*
             * User-specific read state.
             *
             * A notification can be sent to many users,
             * so read state will be handled separately.
             */
            $table->boolean('is_read')->default(false);

            $table->timestamps();

            $table->index('type');
            $table->index('target');
            $table->index('appointment_id');
            $table->index('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};