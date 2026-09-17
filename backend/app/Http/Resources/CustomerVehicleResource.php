<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerVehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customerId' => $this->customer_id,
            'year' => (int) $this->year,
            'make' => $this->make,
            'model' => $this->model,
            'plate' => $this->plate,
            'vin' => $this->vin,
            'color' => $this->color,
            'engine' => $this->engine,
            'isPrimary' => (bool) $this->is_primary,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}