<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'brand',
        'part_number',
        'category',
        'price',
        'original_price',
        'rating',
        'reviews_count',
        'in_stock',
        'fitment_makes',
        'fitment_years',
        'image',
        'gallery',
        'description',
        'is_best_seller',
        'badge',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'rating' => 'decimal:2',
            'reviews_count' => 'integer',
            'in_stock' => 'integer',
            'fitment_makes' => 'array',
            'gallery' => 'array',
            'is_best_seller' => 'boolean',
        ];
    }
}