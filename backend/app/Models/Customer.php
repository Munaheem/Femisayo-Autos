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
    ];

    protected function casts(): array
    {
        return [
            'total_spent' => 'decimal:2',
            'loyalty_points' => 'integer',
            'encrypted_vault' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(CustomerVehicle::class);
    }

    public function wishlistItems()
    {
        return $this->hasMany(
            WishlistItem::class,
            'customer_id'
        );
    }
}