<?php

namespace Database\Seeders;

use App\Models\Technician;
use Illuminate\Database\Seeder;

class TechnicianSeeder extends Seeder
{
    public function run(): void
    {
        $technicians = [
            [
                'id' => 'tech-femi',
                'name' => 'Femi Adeyemi',
                'specialty' => 'Master Certified & Engine Diagnostics Specialist',
                'experience_years' => 14,
                'rating' => 4.98,
                'avatar' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
                'status' => 'in_bay',
            ],

            [
                'id' => 'tech-chidera',
                'name' => 'Chidera Nwosu',
                'specialty' => 'Lead Electrical & Computer Diagnostics Expert',
                'experience_years' => 10,
                'rating' => 4.95,
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
                'status' => 'available',
            ],

            [
                'id' => 'tech-tunde',
                'name' => 'Tunde Ogunleye',
                'specialty' => 'Brakes & Suspension Senior Tech',
                'experience_years' => 12,
                'rating' => 4.92,
                'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
                'status' => 'available',
            ],

            [
                'id' => 'tech-ibrahim',
                'name' => 'Ibrahim Suleiman',
                'specialty' => 'Transmission & HVAC Specialist',
                'experience_years' => 8,
                'rating' => 4.89,
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                'status' => 'available',
            ],
        ];

        foreach ($technicians as $technician) {
            Technician::updateOrCreate(
                ['id' => $technician['id']],
                $technician
            );
        }
    }
}