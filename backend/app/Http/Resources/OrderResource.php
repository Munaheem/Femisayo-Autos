<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'customerId' => $this->customer_id,
            'customerName' => $this->customer_name,
            'customerEmail' => $this->customer_email,

            'shippingAddress' => $this->shipping_address,

            'items' => OrderItemResource::collection($this->whenLoaded('items')),

            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'tax' => (float) $this->tax,
            'shipping' => (float) $this->shipping,
            'total' => (float) $this->total,

            'couponApplied' => $this->coupon_applied,

            'paymentMethod' => $this->payment_method,
            'paymentStatus' => $this->payment_status,

            'fulfillmentStatus' => $this->fulfillment_status,
            'status' => $this->status,

            'estimatedDelivery' => $this->estimated_delivery,
            'trackingNumber' => $this->tracking_number,
            'carrier' => $this->carrier,

            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}