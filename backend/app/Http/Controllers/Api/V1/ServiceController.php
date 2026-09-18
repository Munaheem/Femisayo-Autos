<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of active services.
     */
    public function index()
    {
        return ServiceResource::collection(
            Service::where('is_active', true)
                ->orderBy('name')
                ->get()
        );
    }

    /**
     * Store a newly created service.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'string', 'max:255', 'unique:services,id'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'durationMinutes' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
            'recommendedMileage' => ['nullable', 'string', 'max:255'],
            'features' => ['nullable', 'array'],
            'popular' => ['sometimes', 'boolean'],
            'featured' => ['sometimes', 'boolean'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $service = Service::create([
            'id' => $validated['id'],
            'name' => $validated['name'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'duration_minutes' => $validated['durationMinutes'],
            'description' => $validated['description'] ?? null,
            'recommended_mileage' => $validated['recommendedMileage'] ?? null,
            'features' => $validated['features'] ?? [],
            'popular' => $validated['popular'] ?? false,
            'featured' => $validated['featured'] ?? false,
            'is_active' => $validated['isActive'] ?? true,
        ]);

        return response()->json(
            new ServiceResource($service),
            201
        );
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        return new ServiceResource($service);
    }

    /**
     * Update the specified service or create it when using PUT
     * and the requested service ID does not exist.
     */
    public function update(Request $request, string $service)
    {
        $existingService = Service::find($service);

        // PATCH must only update an existing service.
        if (! $existingService && $request->isMethod('PATCH')) {
            return response()->json([
                'error' => 'Resource not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'durationMinutes' => ['sometimes', 'required', 'integer', 'min:1'],
            'description' => ['sometimes', 'nullable', 'string'],
            'recommendedMileage' => ['sometimes', 'nullable', 'string', 'max:255'],
            'features' => ['sometimes', 'nullable', 'array'],
            'popular' => ['sometimes', 'boolean'],
            'featured' => ['sometimes', 'boolean'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $data = [];

        if (array_key_exists('name', $validated)) {
            $data['name'] = $validated['name'];
        }

        if (array_key_exists('category', $validated)) {
            $data['category'] = $validated['category'];
        }

        if (array_key_exists('price', $validated)) {
            $data['price'] = $validated['price'];
        }

        if (array_key_exists('durationMinutes', $validated)) {
            $data['duration_minutes'] = $validated['durationMinutes'];
        }

        if (array_key_exists('description', $validated)) {
            $data['description'] = $validated['description'];
        }

        if (array_key_exists('recommendedMileage', $validated)) {
            $data['recommended_mileage'] = $validated['recommendedMileage'];
        }

        if (array_key_exists('features', $validated)) {
            $data['features'] = $validated['features'];
        }

        if (array_key_exists('popular', $validated)) {
            $data['popular'] = $validated['popular'];
        }

        if (array_key_exists('featured', $validated)) {
            $data['featured'] = $validated['featured'];
        }

        if (array_key_exists('isActive', $validated)) {
            $data['is_active'] = $validated['isActive'];
        }

        /*
         * PUT supports update-or-create (upsert).
         *
         * A missing PUT creates the service using the exact
         * ID supplied in the URL.
         */
        if (! $existingService) {
            $serviceModel = Service::create([
                'id' => $service,
                'name' => $validated['name'],
                'category' => $validated['category'],
                'price' => $validated['price'],
                'duration_minutes' => $validated['durationMinutes'],
                'description' => $validated['description'] ?? null,
                'recommended_mileage' => $validated['recommendedMileage'] ?? null,
                'features' => $validated['features'] ?? [],
                'popular' => $validated['popular'] ?? false,
                'featured' => $validated['featured'] ?? false,
                'is_active' => $validated['isActive'] ?? true,
            ]);

            return response()->json(
                new ServiceResource($serviceModel),
                201
            );
        }

        $existingService->update($data);

        return new ServiceResource($existingService->fresh());
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Service $service)
    {
        $service->delete();

        return response()->noContent();
    }
}