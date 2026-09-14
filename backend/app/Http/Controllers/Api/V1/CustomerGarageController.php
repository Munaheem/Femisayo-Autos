<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerGarageController extends Controller
{
    public function index(
        Request $request,
        Customer $customer
    ): JsonResponse {
        $user = $request->user();

        if (
            $user->role === 'customer' &&
            $customer->user_id !== $user->id
        ) {
            abort(403);
        }

        return response()->json([
            'data' => [
                'customer' => $customer->load('vehicles'),
                'appointments' => [],
                'orders' => [],
            ],
        ]);
    }

    public function store(
        Request $request,
        Customer $customer
    ): JsonResponse {
        if (
            $request->user()->role === 'customer' &&
            $customer->user_id !== $request->user()->id
        ) {
            abort(403);
        }

        $validated = $request->validate([
            'year' => ['nullable', 'string', 'max:4'],
            'make' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'plate' => ['nullable', 'string', 'max:30'],
            'vin' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:50'],
            'engine' => ['nullable', 'string', 'max:100'],
            'is_primary' => ['boolean'],
        ]);

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

    public function update(
        Request $request,
        Customer $customer,
        int $vehicle
    ): JsonResponse {
        $vehicle = $customer->vehicles()->findOrFail($vehicle);

        $validated = $request->validate([
            'year' => ['nullable', 'string', 'max:4'],
            'make' => ['sometimes', 'string', 'max:100'],
            'model' => ['sometimes', 'string', 'max:100'],
            'plate' => ['nullable', 'string', 'max:30'],
            'vin' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:50'],
            'engine' => ['nullable', 'string', 'max:100'],
            'is_primary' => ['boolean'],
        ]);

        if ($validated['is_primary'] ?? false) {
            $customer->vehicles()->update([
                'is_primary' => false,
            ]);
        }

        $vehicle->update($validated);

        return response()->json([
            'message' => 'Garage vehicle updated.',
            'data' => $vehicle->fresh(),
        ]);
    }

    public function destroy(
        Request $request,
        Customer $customer,
        int $vehicle
    ): JsonResponse {
        $vehicle = $customer->vehicles()->findOrFail($vehicle);

        $vehicle->delete();

        return response()->json(null, 204);
    }
}