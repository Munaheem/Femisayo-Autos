<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'id' => 'srv-engine-diagnostics',
                'name' => 'Engine Diagnostics',
                'category' => 'Diagnostics',
                'price' => 89.00,
                'duration_minutes' => 40,
                'description' => 'Professional computerized engine diagnostics to identify the root cause of check-engine lights, misfires, rough running, and poor performance.',
                'recommended_mileage' => 'Upon check-engine light or any warning',
                'features' => [
                    'Full CAN-bus / OBD-II fault code interrogation',
                    'Live sensor stream telemetry analysis',
                    'Cylinder misfire & fuel trim diagnosis',
                    'Itemized repair roadmap provided',
                ],
                'popular' => true,
                'featured' => true,
            ],

            [
                'id' => 'srv-oil-change',
                'name' => 'Oil Change & Servicing',
                'category' => 'Maintenance',
                'price' => 79.00,
                'duration_minutes' => 30,
                'description' => 'Engine oil and filter replacement with routine maintenance checks to keep your engine running clean and protected.',
                'recommended_mileage' => 'Every 8,000 - 12,000 km',
                'features' => [
                    'Premium synthetic or conventional engine oil',
                    'OEM certified oil filter replacement',
                    'Fluid top-off (coolant, brake, windshield)',
                    'Multi-point under-hood health check',
                ],
                'popular' => true,
                'featured' => true,
            ],

            [
                'id' => 'srv-brakes',
                'name' => 'Brake Service',
                'category' => 'Brakes',
                'price' => 249.00,
                'duration_minutes' => 90,
                'description' => 'Full brake inspection, pad replacement, disc/rotor service, and brake repairs to restore confident stopping power.',
                'recommended_mileage' => 'Every 32,000 - 72,000 km',
                'features' => [
                    'Brake pad & shoe inspection and replacement',
                    'Disc / rotor resurfacing or replacement',
                    'Caliper service & hardware refresh',
                    'Brake fluid moisture boiling-point test',
                ],
                'popular' => true,
                'featured' => true,
            ],

            [
                'id' => 'srv-engine-repair',
                'name' => 'Engine Repair',
                'category' => 'Engine',
                'price' => 499.00,
                'duration_minutes' => 240,
                'description' => 'Troubleshooting and repair of engine problems — from rough idle and loss of power to major mechanical fault diagnosis.',
                'recommended_mileage' => 'As needed / when symptoms appear',
                'features' => [
                    'Compression & leak-down testing',
                    'Head gasket & cooling system combustion test',
                    'Timing, belt, and chain inspection',
                    'Detailed repair plan with transparent quote',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-transmission',
                'name' => 'Transmission Services',
                'category' => 'Drivetrain',
                'price' => 279.00,
                'duration_minutes' => 75,
                'description' => 'Transmission inspection, repairs, and fluid changes to keep gear shifts smooth and extend transmission life.',
                'recommended_mileage' => 'Every 64,000 - 96,000 km',
                'features' => [
                    'Transmission fluid flush & filter replacement',
                    'Pan and magnet inspection for wear debris',
                    'Shifting, slipping & clutch diagnostics',
                    'Computer shift-adaptation relearn',
                ],
                'popular' => false,
                'featured' => true,
            ],

            [
                'id' => 'srv-battery-electrical',
                'name' => 'Battery & Electrical Services',
                'category' => 'Electrical',
                'price' => 119.00,
                'duration_minutes' => 40,
                'description' => 'Battery replacement, alternator, starter, wiring, and electrical diagnostics for reliable starting and charging.',
                'recommended_mileage' => 'Battery every 3-5 years / on failure',
                'features' => [
                    'Battery load & conductance testing',
                    'Starter & alternator output verification',
                    'Charging system & parasitic drain test',
                    'Wiring and component repair',
                ],
                'popular' => false,
                'featured' => true,
            ],

            [
                'id' => 'srv-ac-service',
                'name' => 'Air Conditioning (AC) Service',
                'category' => 'Climate',
                'price' => 169.00,
                'duration_minutes' => 50,
                'description' => 'AC diagnosis, refrigerant recharge, and compressor and cooling-system repairs to blow ice-cold air again.',
                'recommended_mileage' => 'Every 2-3 seasons',
                'features' => [
                    'A/C system leak test with UV dye',
                    'Refrigerant recharge to exact factory weight',
                    'Compressor, condenser & pressure-switch checks',
                    'Vent temperature digital reading (<42°F)',
                ],
                'popular' => false,
                'featured' => true,
            ],

            [
                'id' => 'srv-suspension-steering',
                'name' => 'Suspension & Steering',
                'category' => 'Suspension',
                'price' => 249.00,
                'duration_minutes' => 80,
                'description' => 'Shock absorbers, struts, steering components, and suspension repairs for a smooth, stable, and safe ride.',
                'recommended_mileage' => 'Every 80,000 km / on noise or drift',
                'features' => [
                    'Shocks, struts & coil-spring inspection',
                    'Ball joints, tie rods & bushings testing',
                    'Steering system & wheel-bearing inspection',
                    'Suspension component replacement',
                ],
                'popular' => false,
                'featured' => true,
            ],

            [
                'id' => 'srv-alignment',
                'name' => 'Wheel Alignment & Balancing',
                'category' => 'Tires',
                'price' => 99.00,
                'duration_minutes' => 45,
                'description' => 'Computerized wheel alignment and balancing to correct uneven tire wear and improve vehicle handling.',
                'recommended_mileage' => 'Every 19,000 km or upon tire change',
                'features' => [
                    '4-wheel laser alignment (camber, caster, toe)',
                    'Dynamic wheel balancing',
                    'Steering angle sensor recalibration',
                    'Tire-wear correction inspection',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-tires',
                'name' => 'Tire Services',
                'category' => 'Tires',
                'price' => 139.00,
                'duration_minutes' => 60,
                'description' => 'Tire replacement, rotation, puncture repair, and tire checks to keep you safe on every road.',
                'recommended_mileage' => 'Rotation every 8,000 - 12,000 km',
                'features' => [
                    'Tire replacement & installation',
                    'Tire rotation and pressure systems',
                    'Puncture / nail repair service',
                    'Tread depth & tire-aging inspection',
                ],
                'popular' => true,
                'featured' => true,
            ],

            [
                'id' => 'srv-cooling',
                'name' => 'Cooling System Service',
                'category' => 'Cooling',
                'price' => 189.00,
                'duration_minutes' => 60,
                'description' => 'Radiator, coolant, thermostat, water pump, and overheating-problem diagnosis and repair.',
                'recommended_mileage' => 'Coolant every 48,000 - 96,000 km',
                'features' => [
                    'Coolant flush & replacement',
                    'Radiator, hoses & thermostat inspection',
                    'Water pump & fan testing',
                    'Cooling-system pressure & leak test',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-fuel-system',
                'name' => 'Fuel System Service',
                'category' => 'Fuel',
                'price' => 229.00,
                'duration_minutes' => 60,
                'description' => 'Fuel pump, injectors, filters, and fuel-system diagnostics for proper fuel delivery and efficiency.',
                'recommended_mileage' => 'Every 48,000 km / on poor economy',
                'features' => [
                    'Fuel-pressure & injector flow testing',
                    'Fuel pump & regulator assessment',
                    'Fuel filter replacement',
                    'Fuel-system cleaner service',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-routine-maintenance',
                'name' => 'Routine Vehicle Maintenance',
                'category' => 'Maintenance',
                'price' => 129.00,
                'duration_minutes' => 60,
                'description' => 'Complete routine maintenance service that keeps your vehicle in top shape between manufacturer services.',
                'recommended_mileage' => 'Every 8,000 - 12,000 km',
                'features' => [
                    'OEM scheduled maintenance checklist',
                    'Fluid inspection & top-off',
                    'Multi-point 25-point inspection',
                    'Digital health report',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-full-inspection',
                'name' => 'Full Vehicle Inspection',
                'category' => 'Inspection',
                'price' => 99.00,
                'duration_minutes' => 60,
                'description' => 'Comprehensive bumper-to-bumper inspection covering engine, brakes, suspension, electrical, and safety systems.',
                'recommended_mileage' => 'Annually or before long trips',
                'features' => [
                    'Engine, brakes & suspension assessment',
                    'Electrical & charging system check',
                    'Undercarriage & frame inspection',
                    'Detailed written inspection report',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-prepurchase',
                'name' => 'Pre-Purchase Vehicle Inspection',
                'category' => 'Inspection',
                'price' => 199.00,
                'duration_minutes' => 90,
                'description' => 'Thorough pre-buy inspection before you purchase any used vehicle — uncover hidden problems with professional equipment.',
                'recommended_mileage' => 'Prior to any vehicle purchase',
                'features' => [
                    '150-point bumper-to-bumper checklist',
                    'Digital paint-depth meter reading',
                    'Coolant combustion gas test',
                    '15-page photographic PDF report',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-scheduled-maintenance',
                'name' => 'Scheduled Maintenance',
                'category' => 'Maintenance',
                'price' => 149.00,
                'duration_minutes' => 75,
                'description' => 'Manufacturer schedule-based maintenance service when your vehicle hits its mileage milestone.',
                'recommended_mileage' => 'Per manufacturer service schedule',
                'features' => [
                    'Mileage-milestone maintenance service',
                    'Engine oil & filter service',
                    'Brake, tire & fluid system checks',
                    'Service book stamped + reminder set',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-fluid-checks',
                'name' => 'Fluid Checks & Replacement',
                'category' => 'Maintenance',
                'price' => 69.00,
                'duration_minutes' => 30,
                'description' => 'Fluid checks and replacement and top-off for engine oil, coolant, brake, power-steering, and transmission fluids.',
                'recommended_mileage' => 'Every 8,000 km / with service',
                'features' => [
                    'All fluid levels inspected',
                    'Brake & coolant condition tested',
                    'Power-steering & transmission fluid check',
                    'Replacement & top-off as needed',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-filter-replacement',
                'name' => 'Filter Replacement',
                'category' => 'Maintenance',
                'price' => 99.00,
                'duration_minutes' => 45,
                'description' => 'Replacement of engine air, cabin air, and oil filters to protect the engine and keep cabin air clean.',
                'recommended_mileage' => 'Air filter every 24,000 - 48,000 km',
                'features' => [
                    'Engine air filter replacement',
                    'Cabin / pollen filter replacement',
                    'Oil filter replacement',
                    'Filter condition inspection',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-safety-inspection',
                'name' => 'Vehicle Safety Inspection',
                'category' => 'Inspection',
                'price' => 79.00,
                'duration_minutes' => 45,
                'description' => 'Closely inspect all safety-critical systems so you can drive with confidence on any road.',
                'recommended_mileage' => 'Annually or after an incident',
                'features' => [
                    'Brakes, tires & steering safety check',
                    'Lights, signals & horn verification',
                    'Wipers, mirrors & seatbelts check',
                    'Pre-trip safety certificate',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-mobile-mechanic',
                'name' => 'Mobile Mechanic',
                'category' => 'Mobile Service',
                'price' => 149.00,
                'duration_minutes' => 120,
                'description' => 'Our certified mechanic comes to your location — home or office — for diagnostics and repairs on-site.',
                'recommended_mileage' => 'When you cannot visit the shop',
                'features' => [
                    'On-site diagnostics & repairs',
                    'Home or office visit convenience',
                    'Common parts carried on truck',
                    'Same-day service available',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-roadside',
                'name' => 'Emergency Roadside Assistance',
                'category' => 'Mobile Service',
                'price' => 59.00,
                'duration_minutes' => 60,
                'description' => '24/7 emergency roadside assistance including jump-starts, flat-tire changes, lockout, and fuel delivery.',
                'recommended_mileage' => 'When stranded on the road',
                'features' => [
                    'Jump-start & battery boost',
                    'Flat-tire change service',
                    'Lockout & fuel delivery',
                    '24/7 rapid dispatch',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-pickup-delivery',
                'name' => 'Vehicle Pickup & Delivery',
                'category' => 'Mobile Service',
                'price' => 79.00,
                'duration_minutes' => 90,
                'description' => 'We collect your vehicle from home or work, service it at our workshop, and deliver it back to you.',
                'recommended_mileage' => 'Busy schedule convenience',
                'features' => [
                    'Flatbed pickup & delivery',
                    'Service while you work',
                    'Secure vehicle handling',
                    'Scheduled collection windows',
                ],
                'popular' => false,
                'featured' => false,
            ],

            [
                'id' => 'srv-fleet-maintenance',
                'name' => 'Fleet Maintenance Program',
                'category' => 'Mobile Service',
                'price' => 999.00,
                'duration_minutes' => 480,
                'description' => 'Dedicated maintenance program for companies with multiple vehicles — scheduled servicing, reporting, and priority bay access.',
                'recommended_mileage' => 'Companies with 3+ vehicles',
                'features' => [
                    'Company-wide maintenance scheduling',
                    'Bulk parts & labour rates',
                    'Monthly fleet health reports',
                    'Priority bay allocation',
                ],
                'popular' => false,
                'featured' => false,
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['id' => $service['id']],
                $service
            );
        }
    }
}