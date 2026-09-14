<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'price' => (float) $this->price,
            'durationMinutes' => $this->duration_minutes,
            'description' => $this->description,
            'recommendedMileage' => $this->recommended_mileage,
            'features' => $this->features ?? [],
            'popular' => (bool) $this->popular,
            'featured' => (bool) $this->featured,
        ];
    }
}