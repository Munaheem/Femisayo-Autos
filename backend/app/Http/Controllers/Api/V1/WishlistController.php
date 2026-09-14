<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartResource;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    public function index(Request $request, int $customerId)
    {
        $customer = Customer::find($customerId);

        if (! $customer) {
            return response()->json([
                'error' => 'Customer not found.',
            ], 404);
        }

        $user = $request->user();

        // Customers can only access their own wishlist.
        if (
            $user->role === 'customer'
            && $customer->user_id !== $user->id
        ) {
            return response()->json([
                'error' => 'You are not authorized to access this wishlist.',
            ], 403);
        }

        $parts = $customer->wishlistItems()
            ->with('part')
            ->get()
            ->pluck('part')
            ->filter();

        return PartResource::collection($parts);
    }

    public function update(Request $request, int $customerId)
    {   
        $customer = Customer::find($customerId);

        if (! $customer) {
            return response()->json([
                'error' => 'Customer not found.',
            ], 404);
        }

        $user = $request->user();

        // Customers can only modify their own wishlist.
        if (
            $user->role === 'customer'
            && $customer->user_id !== $user->id
        ) {
            return response()->json([
                'error' => 'You are not authorized to modify this wishlist.',
            ], 403);
        }

        $validated = $request->validate([
            // "present" allows an empty array so the wishlist can be cleared.
            'items' => ['present', 'array'],

            'items.*.id' => [
                'required',
                'string',
                'distinct',
                'exists:parts,id',
            ],
        ]);

        $partIds = collect($validated['items'])
            ->pluck('id')
            ->values()
            ->all();

        DB::transaction(function () use ($customer, $partIds) {
            // Replace the customer's existing wishlist.
            $customer->wishlistItems()->delete();

            foreach ($partIds as $partId) {
                $customer->wishlistItems()->create([
                    'part_id' => $partId,
                ]);
            }
        });

        $parts = $customer->wishlistItems()
            ->with('part')
            ->get()
            ->pluck('part')
            ->filter();

        return PartResource::collection($parts);
    }
}