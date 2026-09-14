<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WishlistItem extends Model
{
    protected $fillable = [
        'customer_id',
        'part_id',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(
            Customer::class,
            'customer_id'
        );
    }

    public function part(): BelongsTo
    {
        return $this->belongsTo(
            Part::class,
            'part_id',
            'id'
        );
    }
}