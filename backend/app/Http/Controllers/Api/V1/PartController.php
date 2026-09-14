<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartResource;
use App\Models\Part;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PartController extends Controller
{
    /**
     * GET /api/v1/parts
     */
    public function index()
    {
        $parts = Part::orderBy('name')->get();

        return PartResource::collection($parts);
    }

    /**
     * POST /api/v1/parts
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'error' => 'Only administrators can create parts.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['required', 'string', 'max:255'],
            'partNumber' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],

            'price' => ['required', 'numeric', 'min:0'],
            'originalPrice' => ['nullable', 'numeric', 'min:0'],

            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviewsCount' => ['nullable', 'integer', 'min:0'],
            'inStock' => ['required', 'integer', 'min:0'],

            'fitmentMakes' => ['nullable', 'array'],
            'fitmentMakes.*' => ['string', 'max:100'],

            'fitmentYears' => ['nullable', 'string', 'max:100'],

            'image' => ['nullable', 'string', 'max:2048'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string', 'max:2048'],

            'description' => ['nullable', 'string'],

            'isBestSeller' => ['nullable', 'boolean'],
            'badge' => ['nullable', 'string', 'max:255'],
        ]);

        $part = Part::create([
            'id' => 'part-' . Str::lower(Str::random(12)),

            'name' => $validated['name'],
            'brand' => $validated['brand'],
            'part_number' => $validated['partNumber'],
            'category' => $validated['category'],

            'price' => $validated['price'],
            'original_price' => $validated['originalPrice'] ?? null,

            'rating' => $validated['rating'] ?? 0,
            'reviews_count' => $validated['reviewsCount'] ?? 0,
            'in_stock' => $validated['inStock'],

            'fitment_makes' => $validated['fitmentMakes'] ?? [],
            'fitment_years' => $validated['fitmentYears'] ?? null,

            'image' => $validated['image'] ?? null,
            'gallery' => $validated['gallery'] ?? [],

            'description' => $validated['description'] ?? null,

            'is_best_seller' => $validated['isBestSeller'] ?? false,
            'badge' => $validated['badge'] ?? null,
        ]);

        return (new PartResource($part))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * PUT /api/v1/parts/{id}
     *
     * Update existing part or create it when it does not exist.
     */
    public function update(Request $request, string $id)
    {
        $role = $request->user()->role;

        if (! in_array($role, ['admin', 'sales', 'technician'], true)) {
            return response()->json([
                'error' => 'You are not authorized to update parts.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['required', 'string', 'max:255'],
            'partNumber' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],

            'price' => ['required', 'numeric', 'min:0'],
            'originalPrice' => ['nullable', 'numeric', 'min:0'],

            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviewsCount' => ['nullable', 'integer', 'min:0'],
            'inStock' => ['required', 'integer', 'min:0'],

            'fitmentMakes' => ['nullable', 'array'],
            'fitmentMakes.*' => ['string', 'max:100'],

            'fitmentYears' => ['nullable', 'string', 'max:100'],

            'image' => ['nullable', 'string', 'max:2048'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string', 'max:2048'],

            'description' => ['nullable', 'string'],

            'isBestSeller' => ['nullable', 'boolean'],
            'badge' => ['nullable', 'string', 'max:255'],
        ]);

        $data = [
            'name' => $validated['name'],
            'brand' => $validated['brand'],
            'part_number' => $validated['partNumber'],
            'category' => $validated['category'],

            'price' => $validated['price'],
            'original_price' => $validated['originalPrice'] ?? null,

            'rating' => $validated['rating'] ?? 0,
            'reviews_count' => $validated['reviewsCount'] ?? 0,
            'in_stock' => $validated['inStock'],

            'fitment_makes' => $validated['fitmentMakes'] ?? [],
            'fitment_years' => $validated['fitmentYears'] ?? null,

            'image' => $validated['image'] ?? null,
            'gallery' => $validated['gallery'] ?? [],

            'description' => $validated['description'] ?? null,

            'is_best_seller' => $validated['isBestSeller'] ?? false,
            'badge' => $validated['badge'] ?? null,
        ];

        $part = DB::transaction(function () use ($id, $data) {
            return Part::updateOrCreate(
                ['id' => $id],
                $data
            );
        });

        return new PartResource($part);
    }

    /**
     * DELETE /api/v1/parts/{id}
     */
    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'error' => 'Only administrators can remove parts.',
            ], 403);
        }

        $part = Part::find($id);

        if (! $part) {
            return response()->json([
                'error' => 'Part not found.',
            ], 404);
        }

        $part->delete();

        return response()->noContent();
    }
}