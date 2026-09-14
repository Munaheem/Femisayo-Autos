<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'customerId' => $this->customer_id,

            'vehicleId' => $this->vehicle_id,

            'serviceId' => $this->service_id,

            'technicianId' => $this->technician_id,

            'assignedTechnician' => $this->assigned_technician,

            'date' => $this->date?->format('Y-m-d'),

            'scheduledTime' => $this->scheduled_time
                ? substr($this->scheduled_time, 0, 5)
                : null,

            'status' => $this->status,

            'paymentStatus' => $this->payment_status,

            'totalPrice' => (float) $this->total_price,

            'notes' => $this->notes,

            // Related information useful to the frontend
            'customer' => $this->whenLoaded(
                'customer',
                fn () => $this->customer ? $this->customer->toArray() : null
            ),

            'vehicle' => $this->whenLoaded(
                'vehicle',
                fn () => $this->vehicle ? $this->vehicle->toArray() : null
            ),

            'service' => $this->whenLoaded(
                'service',
                fn () => new ServiceResource($this->service)
            ),

            'technician' => $this->whenLoaded(
                'technician',
                fn () => new TechnicianResource($this->technician)
            ),

            'createdAt' => $this->created_at?->toISOString(),

            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}