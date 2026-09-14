<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'make',
        'model',
        'year',
        'price',
        'mileage',
        'transmission',
        'fuel',
        'body_type',
        'horsepower',
        'zero_to_sixty',
        'engine',
        'vin',
        'color',
        'in_stock',
        'image',
        'gallery',
        'badges',
        'features',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'year' => 'integer',
            'mileage' => 'integer',
            'horsepower' => 'integer',
            'zero_to_sixty' => 'decimal:2',
            'in_stock' => 'boolean',
            'gallery' => 'array',
            'badges' => 'array',
            'features' => 'array',
        ];
    }
}