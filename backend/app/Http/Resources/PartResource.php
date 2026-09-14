<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'brand' => $this->brand,
            'partNumber' => $this->part_number,
            'category' => $this->category,

            'price' => (float) $this->price,
            'originalPrice' => $this->original_price !== null
                ? (float) $this->original_price
                : null,

            'rating' => (float) $this->rating,
            'reviewsCount' => (int) $this->reviews_count,
            'inStock' => (int) $this->in_stock,

            'fitmentMakes' => $this->fitment_makes ?? [],
            'fitmentYears' => $this->fitment_years,

            'image' => $this->image,
            'gallery' => $this->gallery ?? [],

            'description' => $this->description,

            'isBestSeller' => (bool) $this->is_best_seller,
            'badge' => $this->badge,
        ];
    }
}