<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'customer_id',
        'vehicle_id',
        'service_id',
        'additional_services',
        'technician_id',
        'assigned_technician',
        'scheduled_date',
        'scheduled_time',
        'status',
        'payment_status',
        'customer_notes',
        'technician_notes',
        'total_cost',
        'deposit_amount',
        'payment_transaction_id',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'additional_services' => 'array',
            'total_cost' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(
            CustomerVehicle::class,
            'vehicle_id'
        );
    }

    public function service()
    {
        return $this->belongsTo(
            Service::class,
            'service_id'
        );
    }

    public function technician()
    {
        return $this->belongsTo(
            Technician::class,
            'technician_id'
        );
    }
}