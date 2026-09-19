<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerGarageController extends Controller
{
    /**
     * Get a customer's garage, appointments, and orders.
     */
        public function index(
        Request $request,
        Customer $customer
        ): JsonResponse {
        $this->authorizeGarageAccess($request, $customer);

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

        /*
         * Do not return the complete Customer model here.
         *
         * The garage frontend does not need encrypted_vault,
         * encrypted_vault_key, or other internal customer fields.
         *
         * Keep the garage response limited to the customer data
         * required by the dashboard.
         */
        $customerData = [
            'id' => $customer->id,
            'userId' => $customer->user_id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'vehicleInfo' => $customer->vehicle_info,
            'totalSpent' => $customer->total_spent,
            'loyaltyPoints' => $customer->loyalty_points,
            'tier' => $customer->tier,
            'vehicles' => $customer->vehicles,
            'createdAt' => $customer->created_at,
            'updatedAt' => $customer->updated_at,
        ];

        return response()->json([
            'data' => [
                'customer' => $customerData,
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
        $this->authorizeGarageAccess($request, $customer);

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

        $vehicle = DB::transaction(function () use (
            $customer,
            $validated
        ) {
            /*
             * Only one vehicle can be primary.
             */
            if ($validated['is_primary'] ?? false) {
                $customer->vehicles()->update([
                    'is_primary' => false,
                ]);
            }

            return $customer->vehicles()->create($validated);
        });

        return response()->json([
            'message' => 'Vehicle added to garage.',
            'data' => $vehicle->fresh(),
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
        $this->authorizeGarageAccess($request, $customer);

        /*
         * Scope the vehicle lookup to this customer.
         *
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

        DB::transaction(function () use (
            $customer,
            $vehicleModel,
            $validated
        ) {
            /*
             * Only one vehicle can be primary.
             */
            if ($validated['is_primary'] ?? false) {
                $customer->vehicles()
                    ->whereKey('!=', $vehicleModel->id)
                    ->update([
                        'is_primary' => false,
                    ]);
            }

            $vehicleModel->update($validated);
        });

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
        $this->authorizeGarageAccess($request, $customer);

        /*
         * Scope the vehicle lookup to this customer.
         */
        $vehicleModel = $customer->vehicles()
            ->findOrFail($vehicle);

        DB::transaction(function () use ($vehicleModel) {
            $vehicleModel->delete();
        });

        return response()->json(null, 204);
    }

    /**
     * Authorize access to a customer's garage.
     *
     * Customers can only access their own garage.
     * Staff roles can access customer garages.
     */
    protected function authorizeGarageAccess(
        Request $request,
        Customer $customer
    ): void {
        $user = $request->user();

        if (
            $user->role === 'customer'
            && (int) $customer->user_id !== (int) $user->id
        ) {
            abort(
                403,
                'You are not authorized to access this garage.'
            );
        }
    }
}