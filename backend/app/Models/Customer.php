<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'address',
        'vehicle_info',
        'total_spent',
        'loyalty_points',
        'tier',
        'encrypted_vault',
        'encrypted_vault_key',
    ];

    /**
     * Never expose the server-side customer vault key
     * in API responses.
     */
    protected $hidden = [
        'encrypted_vault_key',
    ];

    protected function casts(): array
    {
        return [
            'total_spent' => 'decimal:2',
            'loyalty_points' => 'integer',
            'encrypted_vault' => 'array',
        ];
    }

    /**
     * Customer login account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Customer vehicles.
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(
            CustomerVehicle::class,
            'customer_id'
        );
    }

    /**
     * Customer wishlist items.
     */
    public function wishlistItems(): HasMany
    {
        return $this->hasMany(
            WishlistItem::class,
            'customer_id'
        );
    }

    /**
     * Customer payments.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(
            Payment::class,
            'customer_id'
        );
    }

    /**
     * Customer appointments.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(
            Appointment::class,
            'customer_id'
        );
    }

    /**
     * Customer orders.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(
            Order::class,
            'customer_id'
        );
    }
}