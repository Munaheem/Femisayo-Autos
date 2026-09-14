<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Notification extends Model
{
    protected $fillable = [
        'title',
        'message',
        'type',
        'target',
        'appointment_id',
        'order_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Users who received this notification.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'notification_user'
        )
            ->withPivot([
                'is_read',
                'read_at',
            ])
            ->withTimestamps();
    }

    /**
     * Appointment associated with this notification.
     */
    public function appointment()
    {
        return $this->belongsTo(
            Appointment::class,
            'appointment_id'
        );
    }

    /**
     * Order associated with this notification.
     */
    public function order()
    {
        return $this->belongsTo(
            Order::class,
            'order_id'
        );
    }
}