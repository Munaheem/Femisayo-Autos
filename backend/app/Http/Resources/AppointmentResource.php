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

            'customerName' => $this->customer?->name,

            'customerPhone' => $this->customer?->phone,

            'customerEmail' => $this->customer?->email,

            'vehicleId' => $this->vehicle_id,

            'vehicleYear' => $this->vehicle?->year,

            'vehicleMake' => $this->vehicle?->make,

            'vehicleModel' => $this->vehicle?->model,

            'vehiclePlate' => $this->vehicle?->plate,

            'vin' => $this->vehicle?->vin,

            'serviceId' => $this->service_id,

            'serviceName' => $this->service?->name,

            'additionalServices' => $this->additional_services ?? [],

            'technicianId' => $this->technician_id,

            'assignedTechnician' => $this->assigned_technician,

            'scheduledDate' => $this->scheduled_date?->format('Y-m-d'),

            'scheduledTime' => $this->scheduled_time
                ? substr($this->scheduled_time, 0, 5)
                : null,

            'status' => $this->status,

            'customerNotes' => $this->customer_notes,

            'technicianNotes' => $this->technician_notes,

            'totalCost' => (float) $this->total_cost,

            'depositAmount' => (float) $this->deposit_amount,

            'paymentStatus' => $this->payment_status,

            'paymentTransactionId' => $this->payment_transaction_id,

            'createdAt' => $this->created_at?->toISOString(),

            'updatedAt' => $this->updated_at?->toISOString(),

            // Related customer resource.
            'customer' => $this->whenLoaded(
                'customer',
                fn () => $this->customer
                    ? (new CustomerResource($this->customer))->resolve()
                    : null
            ),

            // Related vehicle resource.
            'vehicle' => $this->whenLoaded(
                'vehicle',
                fn () => $this->vehicle
                    ? (new CustomerVehicleResource($this->vehicle))->resolve()
                    : null
            ),

            // Related service resource.
            'service' => $this->whenLoaded(
                'service',
                fn () => $this->service
                    ? (new ServiceResource($this->service))->resolve()
                    : null
            ),

            // Related technician resource.
            'technician' => $this->whenLoaded(
                'technician',
                fn () => $this->technician
                    ? (new TechnicianResource($this->technician))->resolve()
                    : null
            ),
        ];
    }
}