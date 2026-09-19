<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerGarageController extends Controller
{
    /**
     * Get a customer's garage, appointments, and orders.
     */
    public function index(
        Request $request,
        Customer $customer
    ): JsonResponse {
        $user = $request->user();

        /*
         * Customers may only access their own garage.
         * Staff can access any customer garage.
         */
        if (
            $user->role === 'customer'
            && $customer->user_id !== $user->id
        ) {
            return response()->json([
                'error' => 'You are not authorized to access this garage.',
            ], 403);
        }

        $customer->load('vehicles');

        $appointments = $customer->appointments()
            ->with([
                'customer',
                'vehicle',
                'service',
                'technician',
            ])
            ->latest()
            ->get();

        $orders = $customer->orders()
            ->with('items')
            ->latest()
            ->get();

        return response()->json([
            'data' => [
                'customer' => $customer,
                'appointments' => AppointmentResource::collection(
                    $appointments
                )->resolve(),
                'orders' => OrderResource::collection(
                    $orders
                )->resolve(),
            ],
        ]);
    }

    /**
     * Add a vehicle to the customer's garage.
     */
    public function store(
        Request $request,
        Customer $customer
    ): JsonResponse {
        $user = $request->user();

        /*
         * Customers may only modify their own garage.
         * Staff can manage any customer garage.
         */
        if (
            $user->role === 'customer'
            && $customer->user_id !== $user->id
        ) {
            return response()->json([
                'error' => 'You are not authorized to access this garage.',
            ], 403);
        }

        $validated = $request->validate([
            'year' => [
                'nullable',
                'string',
                'max:4',
            ],
            'make' => [
                'required',
                'string',
                'max:100',
            ],
            'model' => [
                'required',
                'string',
                'max:100',
            ],
            'plate' => [
                'nullable',
                'string',
                'max:30',
            ],
            'vin' => [
                'nullable',
                'string',
                'max:50',
            ],
            'color' => [
                'nullable',
                'string',
                'max:50',
            ],
            'engine' => [
                'nullable',
                'string',
                'max:100',
            ],
            'is_primary' => [
                'sometimes',
                'boolean',
            ],
        ]);

        /*
         * Only one vehicle can be primary.
         */
        if ($validated['is_primary'] ?? false) {
            $customer->vehicles()->update([
                'is_primary' => false,
            ]);
        }

        $vehicle = $customer->vehicles()->create($validated);

        return response()->json([
            'message' => 'Vehicle added to garage.',
            'data' => $vehicle,
        ], 201);
    }

    /**
     * Update a vehicle in the customer's garage.
     */
    public function update(
        Request $request,
        Customer $customer,
        int $vehicle
    ): JsonResponse {
        $user = $request->user();

        /*
         * Customers may only modify their own garage.
         * Staff can manage any customer garage.
         */
        if (
            $user->role === 'customer'
            && $customer->user_id !== $user->id
        ) {
            return response()->json([
                'error' => 'You are not authorized to access this garage.',
            ], 403);
        }

        /*
         * Scope the vehicle lookup to this customer.
         * This prevents one customer from modifying another
         * customer's vehicle by changing the vehicle ID.
         */
        $vehicleModel = $customer->vehicles()
            ->findOrFail($vehicle);

        $validated = $request->validate([
            'year' => [
                'nullable',
                'string',
                'max:4',
            ],
            'make' => [
                'sometimes',
                'string',
                'max:100',
            ],
            'model' => [
                'sometimes',
                'string',
                'max:100',
            ],
            'plate' => [
                'nullable',
                'string',
                'max:30',
            ],
            'vin' => [
                'nullable',
                'string',
                'max:50',
            ],
            'color' => [
                'nullable',
                'string',
                'max:50',
            ],
            'engine' => [
                'nullable',
                'string',
                'max:100',
            ],
            'is_primary' => [
                'sometimes',
                'boolean',
            ],
        ]);

        /*
         * Only one vehicle can be primary.
         */
        if ($validated['is_primary'] ?? false) {
            $customer->vehicles()->update([
                'is_primary' => false,
            ]);
        }

        $vehicleModel->update($validated);

        return response()->json([
            'message' => 'Garage vehicle updated.',
            'data' => $vehicleModel->fresh(),
        ]);
    }

    /**
     * Delete a vehicle from the customer's garage.
     */
    public function destroy(
        Request $request,
        Customer $customer,
        int $vehicle
    ): JsonResponse {
        $user = $request->user();

        /*
         * Customers may only modify their own garage.
         * Staff can manage any customer garage.
         */
        if (
            $user->role === 'customer'
            && $customer->user_id !== $user->id
        ) {
            return response()->json([
                'error' => 'You are not authorized to access this garage.',
            ], 403);
        }

        /*
         * Scope the vehicle lookup to this customer.
         */
        $vehicleModel = $customer->vehicles()
            ->findOrFail($vehicle);

        $vehicleModel->delete();

        return response()->json(null, 204);
    }
}