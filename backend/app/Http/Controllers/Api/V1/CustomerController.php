<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless(
            in_array($request->user()->role, ['admin', 'sales', 'technician']),
            403
        );

        $customers = Customer::with('vehicles')
            ->latest()
            ->get();

        return response()->json([
            'data' => $customers,
        ]);
    }

    public function show(Request $request, Customer $customer): JsonResponse
    {
        $user = $request->user();

        if (
            $user->role === 'customer' &&
            $customer->user_id !== $user->id
        ) {
            abort(403);
        }

        return response()->json([
            'data' => $customer->load('vehicles'),
        ]);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $user = $request->user();

        if (
            $user->role === 'customer' &&
            $customer->user_id !== $user->id
        ) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'address' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'vehicleInfo' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        $mapped = [];

        foreach ($validated as $key => $value) {
            $mapped[str_replace(
                ['vehicleInfo'],
                ['vehicle_info'],
                $key
            )] = $value;
        }

        $customer->update($mapped);

        return response()->json([
            'message' => 'Customer updated successfully.',
            'data' => $customer->fresh(),
        ]);
    }

    public function destroy(Request $request, Customer $customer): JsonResponse
    {
        abort_unless(
            in_array($request->user()->role, ['admin']),
            403
        );

        $customer->delete();

        return response()->json(null, 204);
    }
}