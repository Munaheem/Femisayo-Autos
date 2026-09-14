<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,

            'target' => $this->target,

            'appointmentId' => $this->appointment_id,
            'orderId' => $this->order_id,

            /*
             * Read state belongs to the individual user
             * through the notification_user pivot table.
             */
            'isRead' => $this->when(
                $this->relationLoaded('users'),
                function () use ($request) {
                    $user = $this->users
                        ->firstWhere('id', $request->user()->id);

                    return $user
                        ? (bool) $user->pivot->is_read
                        : false;
                }
            ),

            'readAt' => $this->when(
                $this->relationLoaded('users'),
                function () use ($request) {
                    $user = $this->users
                        ->firstWhere('id', $request->user()->id);

                    if (! $user || ! $user->pivot->read_at) {
                        return null;
                    }

                    return \Carbon\Carbon::parse(
                        $user->pivot->read_at
                    )->toISOString();
                }
            ),

            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}