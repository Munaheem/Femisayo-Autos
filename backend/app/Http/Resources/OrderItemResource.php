<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'partId' => $this->part_id,
            'partName' => $this->part_name,
            'brand' => $this->brand,
            'price' => (float) $this->price,
            'quantity' => (int) $this->quantity,
            'image' => $this->image,
        ];
    }
}