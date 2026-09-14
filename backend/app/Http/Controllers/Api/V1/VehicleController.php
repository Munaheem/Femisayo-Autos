<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VehicleController extends Controller
{
    public function index()
    {
        return VehicleResource::collection(
            Vehicle::latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'make' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'year' => ['required', 'integer', 'min:1900', 'max:2100'],
            'price' => ['required', 'numeric', 'min:0'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'transmission' => ['required', 'string', 'max:100'],
            'fuel' => ['required', 'string', 'max:100'],
            'bodyType' => ['required', 'string', 'max:100'],
            'horsepower' => ['nullable', 'integer', 'min:0'],
            'zeroToSixty' => ['nullable', 'numeric', 'min:0'],
            'engine' => ['nullable', 'string', 'max:100'],
            'vin' => ['nullable', 'string', 'max:100', 'unique:vehicles,vin'],
            'color' => ['nullable', 'string', 'max:100'],
            'inStock' => ['nullable', 'boolean'],
            'image' => ['nullable', 'string'],
            'gallery' => ['nullable', 'array'],
            'badges' => ['nullable', 'array'],
            'features' => ['nullable', 'array'],
        ]);

        $vehicle = Vehicle::create([
            'id' => 'veh-' . Str::lower(Str::random(12)),
            'make' => $validated['make'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'price' => $validated['price'],
            'mileage' => $validated['mileage'] ?? 0,
            'transmission' => $validated['transmission'],
            'fuel' => $validated['fuel'],
            'body_type' => $validated['bodyType'],
            'horsepower' => $validated['horsepower'] ?? null,
            'zero_to_sixty' => $validated['zeroToSixty'] ?? null,
            'engine' => $validated['engine'] ?? null,
            'vin' => $validated['vin'] ?? null,
            'color' => $validated['color'] ?? null,
            'in_stock' => $validated['inStock'] ?? true,
            'image' => $validated['image'] ?? null,
            'gallery' => $validated['gallery'] ?? [],
            'badges' => $validated['badges'] ?? [],
            'features' => $validated['features'] ?? [],
        ]);

        return new VehicleResource($vehicle);
    }

    public function show(Vehicle $vehicle)
    {
        return new VehicleResource($vehicle);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'make' => ['sometimes', 'required', 'string', 'max:100'],
            'model' => ['sometimes', 'required', 'string', 'max:100'],
            'year' => ['sometimes', 'required', 'integer', 'min:1900', 'max:2100'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'mileage' => ['sometimes', 'integer', 'min:0'],
            'transmission' => ['sometimes', 'required', 'string', 'max:100'],
            'fuel' => ['sometimes', 'required', 'string', 'max:100'],
            'bodyType' => ['sometimes', 'required', 'string', 'max:100'],
            'horsepower' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'zeroToSixty' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'engine' => ['sometimes', 'nullable', 'string', 'max:100'],
            'vin' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
                'unique:vehicles,vin,' . $vehicle->id . ',id',
            ],
            'color' => ['sometimes', 'nullable', 'string', 'max:100'],
            'inStock' => ['sometimes', 'boolean'],
            'image' => ['sometimes', 'nullable', 'string'],
            'gallery' => ['sometimes', 'array'],
            'badges' => ['sometimes', 'array'],
            'features' => ['sometimes', 'array'],
        ]);

        $mapping = [
            'bodyType' => 'body_type',
            'zeroToSixty' => 'zero_to_sixty',
            'inStock' => 'in_stock',
        ];

        foreach ($mapping as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $validated[$column] = $validated[$input];
                unset($validated[$input]);
            }
        }

        $vehicle->update($validated);

        return new VehicleResource($vehicle->fresh());
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return response()->noContent();
    }
}