<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'make' => $this->make,
            'model' => $this->model,
            'year' => $this->year,
            'price' => (float) $this->price,
            'mileage' => $this->mileage,
            'transmission' => $this->transmission,
            'fuel' => $this->fuel,
            'bodyType' => $this->body_type,
            'horsepower' => $this->horsepower,
            'zeroToSixty' => $this->zero_to_sixty !== null
                ? (float) $this->zero_to_sixty
                : null,
            'engine' => $this->engine,
            'vin' => $this->vin,
            'color' => $this->color,
            'inStock' => $this->in_stock,
            'image' => $this->image,
            'gallery' => $this->gallery ?? [],
            'badges' => $this->badges ?? [],
            'features' => $this->features ?? [],
        ];
    }
}