<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'reference',
        'customer_id',
        'amount',
        'amount_usd',
        'amount_kobo',
        'ngn_per_usd',
        'currency',
        'email',
        'title',
        'description',
        'status',
        'authorization_url',
        'access_code',
        'gateway',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'amount_usd' => 'decimal:2',
            'amount_kobo' => 'integer',
            'ngn_per_usd' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(
            'App\\Models\\Customer',
            'customer_id'
        );
    }
}