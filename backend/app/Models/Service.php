<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'category',
        'price',
        'duration_minutes',
        'description',
        'recommended_mileage',
        'features',
        'popular',
        'featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_minutes' => 'integer',
            'features' => 'array',
            'popular' => 'boolean',
            'featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}