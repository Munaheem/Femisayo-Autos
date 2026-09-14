<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TechnicianResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'specialty' => $this->specialty,
            'experienceYears' => $this->experience_years,
            'rating' => (float) $this->rating,
            'avatar' => $this->avatar,
            'status' => $this->status,
        ];
    }
}