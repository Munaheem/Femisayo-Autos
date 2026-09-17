<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $vehicles = $this->relationLoaded('vehicles')
            ? $this->vehicles
                ->map(
                    fn ($vehicle) => (new CustomerVehicleResource(
                        $vehicle
                    ))->resolve($request)
                )
                ->values()
                ->all()
            : [];

        return [
            'id' => $this->id,

            'userId' => $this->user_id,

            'name' => $this->name,

            'email' => $this->email,

            'phone' => $this->phone,

            'address' => $this->address,

            'vehicleInfo' => $this->vehicle_info,

            'totalSpent' => (float) $this->total_spent,

            'loyaltyPoints' => (int) $this->loyalty_points,

            'tier' => $this->tier,

            'encryptedVault' => $this->encrypted_vault,

            'vehicles' => $vehicles,

            'createdAt' => $this->created_at?->toISOString(),

            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}