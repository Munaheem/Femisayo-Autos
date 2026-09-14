<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Technician extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'specialty',
        'experience_years',
        'rating',
        'avatar',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'experience_years' => 'integer',
            'rating' => 'decimal:2',
        ];
    }
}