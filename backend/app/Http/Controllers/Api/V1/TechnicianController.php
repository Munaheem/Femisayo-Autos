<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TechnicianResource;
use App\Models\Technician;
use Illuminate\Http\Request;

class TechnicianController extends Controller
{
    /**
     * Display a listing of technicians.
     */
    public function index()
    {
        return TechnicianResource::collection(
            Technician::orderBy('name')->get()
        );
    }

    /**
     * Update the specified technician.
     */
    public function update(Request $request, Technician $technician)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'specialty' => ['sometimes', 'string', 'max:255'],
            'experienceYears' => ['sometimes', 'integer', 'min:0'],
            'rating' => ['sometimes', 'numeric', 'min:0', 'max:5'],
            'avatar' => ['nullable', 'string', 'max:2048'],
            'status' => ['sometimes', 'in:available,in_bay,off_duty'],
        ]);

        $data = [];

        foreach ([
            'name',
            'specialty',
            'rating',
            'avatar',
            'status',
        ] as $field) {
            if (array_key_exists($field, $validated)) {
                $data[$field] = $validated[$field];
            }
        }

        if (array_key_exists('experienceYears', $validated)) {
            $data['experience_years'] = $validated['experienceYears'];
        }

        $technician->update($data);

        return new TechnicianResource($technician->fresh());
    }
}