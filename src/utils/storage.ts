import { 
  Appointment, 
  CartItem, 
  CustomerRecord, 
  Order, 
  PartItem, 
  PushNotification, 
  ServiceItem, 
  Technician, 
  VehicleItem 
} from '../types';

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-engine-diagnostics',
    name: 'Engine Diagnostics',
    category: 'Diagnostics',
    price: 89.00,
    durationMinutes: 40,
    description: 'Professional computerized engine diagnostics to identify the root cause of check-engine lights, misfires, rough running, and poor performance.',
    recommendedMileage: 'Upon check-engine light or any warning',
    features: [
      'Full CAN-bus / OBD-II fault code interrogation',
      'Live sensor stream telemetry analysis',
      'Cylinder misfire & fuel trim diagnosis',
      'Itemized repair roadmap provided'
    ],
    popular: true,
    featured: true
  },
  {
    id: 'srv-oil-change',
    name: 'Oil Change & Servicing',
    category: 'Maintenance',
    price: 79.00,
    durationMinutes: 30,
    description: 'Engine oil and filter replacement with routine maintenance checks to keep your engine running clean and protected.',
    recommendedMileage: 'Every 8,000 - 12,000 km',
    features: [
      'Premium synthetic or conventional engine oil',
      'OEM certified oil filter replacement',
      'Fluid top-off (coolant, brake, windshield)',
      'Multi-point under-hood health check'
    ],
    popular: true,
    featured: true
  },
  {
    id: 'srv-brakes',
    name: 'Brake Service',
    category: 'Brakes',
    price: 249.00,
    durationMinutes: 90,
    description: 'Full brake inspection, pad replacement, disc/rotor service, and brake repairs to restore confident stopping power.',
    recommendedMileage: 'Every 32,000 - 72,000 km',
    features: [
      'Brake pad & shoe inspection and replacement',
      'Disc / rotor resurfacing or replacement',
      'Caliper service & hardware refresh',
      'Brake fluid moisture boiling-point test'
    ],
    popular: true,
    featured: true
  },
  {
    id: 'srv-engine-repair',
    name: 'Engine Repair',
    category: 'Engine',
    price: 499.00,
    durationMinutes: 240,
    description: 'Troubleshooting and repair of engine problems — from rough idle and loss of power to major mechanical fault diagnosis.',
    recommendedMileage: 'As needed / when symptoms appear',
    features: [
      'Compression & leak-down testing',
      'Head gasket & cooling system combustion test',
      'Timing, belt, and chain inspection',
      'Detailed repair plan with transparent quote'
    ]
  },
  {
    id: 'srv-transmission',
    name: 'Transmission Services',
    category: 'Drivetrain',
    price: 279.00,
    durationMinutes: 75,
    description: 'Transmission inspection, repairs, and fluid changes to keep gear shifts smooth and extend transmission life.',
    recommendedMileage: 'Every 64,000 - 96,000 km',
    features: [
      'Transmission fluid flush & filter replacement',
      'Pan and magnet inspection for wear debris',
      'Shifting, slipping & clutch diagnostics',
      'Computer shift-adaptation relearn'
    ],
    featured: true
  },
  {
    id: 'srv-battery-electrical',
    name: 'Battery & Electrical Services',
    category: 'Electrical',
    price: 119.00,
    durationMinutes: 40,
    description: 'Battery replacement, alternator, starter, wiring, and electrical diagnostics for reliable starting and charging.',
    recommendedMileage: 'Battery every 3-5 years / on failure',
    features: [
      'Battery load & conductance testing',
      'Starter & alternator output verification',
      'Charging system & parasitic drain test',
      'Wiring and component repair'
    ],
    featured: true
  },
  {
    id: 'srv-ac-service',
    name: 'Air Conditioning (AC) Service',
    category: 'Climate',
    price: 169.00,
    durationMinutes: 50,
    description: 'AC diagnosis, refrigerant recharge, and compressor and cooling-system repairs to blow ice-cold air again.',
    recommendedMileage: 'Every 2-3 seasons',
    features: [
      'A/C system leak test with UV dye',
      'Refrigerant recharge to exact factory weight',
      'Compressor, condenser & pressure-switch checks',
      'Vent temperature digital reading (<42°F)'
    ],
    featured: true
  },
  {
    id: 'srv-suspension-steering',
    name: 'Suspension & Steering',
    category: 'Suspension',
    price: 249.00,
    durationMinutes: 80,
    description: 'Shock absorbers, struts, steering components, and suspension repairs for a smooth, stable, and safe ride.',
    recommendedMileage: 'Every 80,000 km / on noise or drift',
    features: [
      'Shocks, struts & coil-spring inspection',
      'Ball joints, tie rods & bushings testing',
      'Steering system & wheel-bearing inspection',
      'Suspension component replacement'
    ],
    featured: true
  },
  {
    id: 'srv-alignment',
    name: 'Wheel Alignment & Balancing',
    category: 'Tires',
    price: 99.00,
    durationMinutes: 45,
    description: 'Computerized wheel alignment and balancing to correct uneven tire wear and improve vehicle handling.',
    recommendedMileage: 'Every 19,000 km or upon tire change',
    features: [
      '4-wheel laser alignment (camber, caster, toe)',
      'Dynamic wheel balancing',
      'Steering angle sensor recalibration',
      'Tire-wear correction inspection'
    ]
  },
  {
    id: 'srv-tires',
    name: 'Tire Services',
    category: 'Tires',
    price: 139.00,
    durationMinutes: 60,
    description: 'Tire replacement, rotation, puncture repair, and tire checks to keep you safe on every road.',
    recommendedMileage: 'Rotation every 8,000 - 12,000 km',
    features: [
      'Tire replacement & installation',
      'Tire rotation and pressure systems',
      'Puncture / nail repair service',
      'Tread depth & tire-aging inspection'
    ],
    popular: true,
    featured: true
  },
  {
    id: 'srv-cooling',
    name: 'Cooling System Service',
    category: 'Cooling',
    price: 189.00,
    durationMinutes: 60,
    description: 'Radiator, coolant, thermostat, water pump, and overheating-problem diagnosis and repair.',
    recommendedMileage: 'Coolant every 48,000 - 96,000 km',
    features: [
      'Coolant flush & replacement',
      'Radiator, hoses & thermostat inspection',
      'Water pump & fan testing',
      'Cooling-system pressure & leak test'
    ]
  },
  {
    id: 'srv-fuel-system',
    name: 'Fuel System Service',
    category: 'Fuel',
    price: 229.00,
    durationMinutes: 60,
    description: 'Fuel pump, injectors, filters, and fuel-system diagnostics for proper fuel delivery and efficiency.',
    recommendedMileage: 'Every 48,000 km / on poor economy',
    features: [
      'Fuel-pressure & injector flow testing',
      'Fuel pump & regulator assessment',
      'Fuel filter replacement',
      'Fuel-system cleaner service'
    ]
  },
  {
    id: 'srv-routine-maintenance',
    name: 'Routine Vehicle Maintenance',
    category: 'Maintenance',
    price: 129.00,
    durationMinutes: 60,
    description: 'Complete routine maintenance service that keeps your vehicle in top shape between manufacturer services.',
    recommendedMileage: 'Every 8,000 - 12,000 km',
    features: [
      'OEM scheduled maintenance checklist',
      'Fluid inspection & top-off',
      'Multi-point 25-point inspection',
      'Digital health report'
    ]
  },
  {
    id: 'srv-full-inspection',
    name: 'Full Vehicle Inspection',
    category: 'Inspection',
    price: 99.00,
    durationMinutes: 60,
    description: 'Comprehensive bumper-to-bumper inspection covering engine, brakes, suspension, electrical, and safety systems.',
    recommendedMileage: 'Annually or before long trips',
    features: [
      'Engine, brakes & suspension assessment',
      'Electrical & charging system check',
      'Undercarriage & frame inspection',
      'Detailed written inspection report'
    ]
  },
  {
    id: 'srv-prepurchase',
    name: 'Pre-Purchase Vehicle Inspection',
    category: 'Inspection',
    price: 199.00,
    durationMinutes: 90,
    description: 'Thorough pre-buy inspection before you purchase any used vehicle — uncover hidden problems with professional equipment.',
    recommendedMileage: 'Prior to any vehicle purchase',
    features: [
      '150-point bumper-to-bumper checklist',
      'Digital paint-depth meter reading',
      'Coolant combustion gas test',
      '15-page photographic PDF report'
    ]
  },
  {
    id: 'srv-scheduled-maintenance',
    name: 'Scheduled Maintenance',
    category: 'Maintenance',
    price: 149.00,
    durationMinutes: 75,
    description: 'Manufacturer schedule-based maintenance service when your vehicle hits its mileage milestone.',
    recommendedMileage: 'Per manufacturer service schedule',
    features: [
      'Mileage-milestone maintenance service',
      'Engine oil & filter service',
      'Brake, tire & fluid system checks',
      'Service book stamped + reminder set'
    ]
  },
  {
    id: 'srv-fluid-checks',
    name: 'Fluid Checks & Replacement',
    category: 'Maintenance',
    price: 69.00,
    durationMinutes: 30,
    description: 'Fluid checks and replacement and top-off for engine oil, coolant, brake, power-steering, and transmission fluids.',
    recommendedMileage: 'Every 8,000 km / with service',
    features: [
      'All fluid levels inspected',
      'Brake & coolant condition tested',
      'Power-steering & transmission fluid check',
      'Replacement & top-off as needed'
    ]
  },
  {
    id: 'srv-filter-replacement',
    name: 'Filter Replacement',
    category: 'Maintenance',
    price: 99.00,
    durationMinutes: 45,
    description: 'Replacement of engine air, cabin air, and oil filters to protect the engine and keep cabin air clean.',
    recommendedMileage: 'Air filter every 24,000 - 48,000 km',
    features: [
      'Engine air filter replacement',
      'Cabin / pollen filter replacement',
      'Oil filter replacement',
      'Filter condition inspection'
    ]
  },
  {
    id: 'srv-safety-inspection',
    name: 'Vehicle Safety Inspection',
    category: 'Inspection',
    price: 79.00,
    durationMinutes: 45,
    description: 'Closely inspect all safety-critical systems so you can drive with confidence on any road.',
    recommendedMileage: 'Annually or after an incident',
    features: [
      'Brakes, tires & steering safety check',
      'Lights, signals & horn verification',
      'Wipers, mirrors & seatbelts check',
      'Pre-trip safety certificate'
    ]
  },
  {
    id: 'srv-mobile-mechanic',
    name: 'Mobile Mechanic',
    category: 'Mobile Service',
    price: 149.00,
    durationMinutes: 120,
    description: 'Our certified mechanic comes to your location — home or office — for diagnostics and repairs on-site.',
    recommendedMileage: 'When you cannot visit the shop',
    features: [
      'On-site diagnostics & repairs',
      'Home or office visit convenience',
      'Common parts carried on truck',
      'Same-day service available'
    ]
  },
  {
    id: 'srv-roadside',
    name: 'Emergency Roadside Assistance',
    category: 'Mobile Service',
    price: 59.00,
    durationMinutes: 60,
    description: '24/7 emergency roadside assistance including jump-starts, flat-tire changes, lockout, and fuel delivery.',
    recommendedMileage: 'When stranded on the road',
    features: [
      'Jump-start & battery boost',
      'Flat-tire change service',
      'Lockout & fuel delivery',
      '24/7 rapid dispatch'
    ]
  },
  {
    id: 'srv-pickup-delivery',
    name: 'Vehicle Pickup & Delivery',
    category: 'Mobile Service',
    price: 79.00,
    durationMinutes: 90,
    description: 'We collect your vehicle from home or work, service it at our workshop, and deliver it back to you.',
    recommendedMileage: 'Busy schedule convenience',
    features: [
      'Flatbed pickup & delivery',
      'Service while you work',
      'Secure vehicle handling',
      'Scheduled collection windows'
    ]
  },
  {
    id: 'srv-fleet-maintenance',
    name: 'Fleet Maintenance Program',
    category: 'Mobile Service',
    price: 999.00,
    durationMinutes: 480,
    description: 'Dedicated maintenance program for companies with multiple vehicles — scheduled servicing, reporting, and priority bay access.',
    recommendedMileage: 'Companies with 3+ vehicles',
    features: [
      'Company-wide maintenance scheduling',
      'Bulk parts & labour rates',
      'Monthly fleet health reports',
      'Priority bay allocation'
    ]
  }
];

export const INITIAL_VEHICLES: VehicleItem[] = [
  {
    id: 'veh-bmw-m4-competition-2024',
    make: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    price: 86900,
    mileage: 5100,
    transmission: 'Automatic',
    fuel: 'Petrol',
    bodyType: 'sports',
    horsepower: 503,
    zeroToSixty: '3.5s',
    engine: '3.0L BMW M TwinPower Turbo Inline-6',
    vin: 'WBS33AY04PFP47182',
    color: 'Isle of Man Green Metallic',
    inStock: true,
    image: '/images/BMW m4 competition.jpg',
    badges: ['Certified Pre-Owned', 'Clean Title', 'M Sport Package'],
    features: [
      'Carbon Fiber Bucket Seats',
      'Harman Kardon Surround Sound',
      'M Drive Professional with Drift Analyzer',
      'Adaptive M Suspension',
      'M Compound Brakes'
    ]
  },
  {
    id: 'veh-bmw-m4-2024',
    make: 'BMW',
    model: 'M4 Competition M xDrive',
    year: 2024,
    price: 89900,
    mileage: 4850,
    transmission: 'Automatic',
    fuel: 'Petrol',
    bodyType: 'sports',
    horsepower: 503,
    zeroToSixty: '3.4s',
    engine: '3.0L BMW M TwinPower Turbo Inline-6',
    vin: 'WBS33AY08PFP48291',
    color: 'Isle of Man Green Metallic',
    inStock: true,
    image: '/images/BMW m4 comp xdrive.jpg',
    badges: ['Certified Pre-Owned', 'Clean Title', 'Track Package'],
    features: [
      'Carbon Fiber Bucket Seats',
      'Harman Kardon Surround Sound',
      'M Drive Professional with Drift Analyzer',
      'Carbon Ceramic Brakes',
      'Adaptive M Suspension'
    ]
  },
  {
    id: 'veh-merc-eclass-2024',
    make: 'Mercedes-Benz',
    model: 'E-Class E450 4MATIC Sedan',
    year: 2024,
    price: 64500,
    mileage: 12200,
    transmission: 'Automatic',
    fuel: 'Petrol',
    bodyType: 'sedan',
    horsepower: 375,
    zeroToSixty: '4.4s',
    engine: '3.0L Turbocharged Inline-6 with Mild Hybrid',
    vin: 'W1KZF8EB2RA194038',
    color: 'Iridium Silver Metallic',
    inStock: true,
    image: '/images/2024 Mercedes-Benz E-Class E450 4MATIC Sedan.jpg',
    badges: ['Single Owner', 'Dealer Maintained', 'Warranty Included'],
    features: [
      'Superscreen Display with Selfie Camera',
      'Burmester 4D Audio with Dolby Atmos',
      'Active Distance Assist DISTRONIC',
      'Panoramic Sliding Glass Sunroof'
    ]
  },
  {
    id: 'veh-audi-rs5-2024',
    make: 'Audi',
    model: 'RS5 Sportback 2.9T quattro',
    year: 2024,
    price: 76800,
    mileage: 8900,
    transmission: 'Automatic',
    fuel: 'Petrol',
    bodyType: 'sports',
    horsepower: 444,
    zeroToSixty: '3.7s',
    engine: '2.9L Twin-Turbo V6',
    vin: 'WAUZZZF58RA920194',
    color: 'Mythos Black Metallic',
    inStock: true,
    image: '/images/2024 Audi RS5 Sportback 2.9T quattro.jpg',
    badges: ['Dynamic Plus Package', 'Ceramic Brakes', 'Apex Inspected'],
    features: [
      'Bang & Olufsen 3D Sound System',
      'RS Sport Exhaust with Black Oval Tips',
      'Virtual Cockpit Plus with RS Track Layout',
      'Quattro Sport Rear Differential'
    ]
  },
  {
    id: 'veh-porsche-911-2024',
    make: 'Porsche',
    model: '911 Carrera GTS (992)',
    year: 2024,
    price: 122900,
    mileage: 3100,
    transmission: 'Dual-Clutch',
    fuel: 'Petrol',
    bodyType: 'sports',
    horsepower: 473,
    zeroToSixty: '3.2s',
    engine: '3.0L Twin-Turbo Flat-6 Boxer',
    vin: 'WP0AB2A98NS240918',
    color: 'Guards Red / Jet Black',
    inStock: true,
    image: '/images/2024 Porsche 911 Carrera GTS (992).jpg',
    badges: ['Sport Chrono Package', 'Porsche Approved CPO', 'Rare Spec'],
    features: [
      'Sport Chrono Package with Mode Switch',
      'PASM Sport Suspension (-10mm lower)',
      'Rear-Axle Steering',
      'Center-Lock Satin Black Wheels'
    ]
  },
  {
    id: 'veh-velar-2024',
    make: 'Land Rover',
    model: 'Range Rover Velar Dynamic HSE',
    year: 2024,
    price: 71300,
    mileage: 9400,
    transmission: 'Automatic',
    fuel: 'Hybrid',
    bodyType: 'suv',
    horsepower: 395,
    zeroToSixty: '5.2s',
    engine: '3.0L Turbo Inline-6 MHEV',
    vin: 'SALYA2V48PA849102',
    color: 'Fuji White with Gloss Black Roof',
    inStock: true,
    image: '/images/2024 Land Rover Range Rover Velar Dynamic HSE.jpg',
    badges: ['Luxury SUV', 'Terrain Response 2', 'AWD'],
    features: [
      'Meridian 3D Surround Sound 750W',
      'Electronic Air Suspension with Dynamic Dynamics',
      'Pixel LED Headlights with Signature DRL',
      '3D Surround Camera with ClearSight Ground View'
    ]
  },
  {
    id: 'veh-tesla-s-2024',
    make: 'Tesla',
    model: 'Model S Plaid Tri-Motor',
    year: 2024,
    price: 88500,
    mileage: 6200,
    transmission: 'Automatic',
    fuel: 'Electric',
    bodyType: 'luxury',
    horsepower: 1020,
    zeroToSixty: '1.99s',
    engine: 'Tri-Motor AWD with Torque Vectoring',
    vin: '5YJSA1E63PF991048',
    color: 'Stealth Grey Metallic',
    inStock: true,
    image: '/images/2024 Tesla Model S Plaid Tri-Motor.jpg',
    badges: ['Full Self-Driving Included', 'Zero Emission', 'Carbon Sleeved Rotors'],
    features: [
      'Tri-Motor All-Wheel Drive 1,020 HP',
      '17-inch Cinematic Tilting Touchscreen',
      'Yoke Steering Control',
      'Carbon-Fiber Spoiler'
    ]
  },
  {
    id: 'veh-supra-2024',
    make: 'Toyota',
    model: 'GR Supra 3.0 Premium 6-Speed MT',
    year: 2024,
    price: 58900,
    mileage: 5100,
    transmission: 'Manual',
    fuel: 'Petrol',
    bodyType: 'sports',
    horsepower: 382,
    zeroToSixty: '3.9s',
    engine: '3.0L Twin-Scroll Single Turbo Inline-6',
    vin: 'JTMBZ8A18P0029184',
    color: 'Nitro Yellow',
    inStock: true,
    image: '/images/2024 Toyota GR Supra 3.0 Premium 6-Speed MT.jpg',
    badges: ['6-Speed Manual', 'Brembo Front Brakes', 'Apex Dyno Tuned'],
    features: [
      'Intelligent Manual Transmission (iMT) Rev-Match',
      'Active Rear Sport Differential',
      'JBL 14-Speaker 500W Premium Audio',
      '19-inch Forged Aluminum Matte Black Wheels'
    ]
  },
  {
    id: 'veh-civic-r-2024',
    make: 'Honda',
    model: 'Civic Type R FL5',
    year: 2024,
    price: 45900,
    mileage: 7800,
    transmission: 'Manual',
    fuel: 'Petrol',
    bodyType: 'hatchback',
    horsepower: 315,
    zeroToSixty: '4.9s',
    engine: '2.0L VTEC Turbocharged 4-Cylinder',
    vin: 'JH4FL5G43PC019482',
    color: 'Championship White',
    inStock: true,
    image: '/images/2024 Honda Civic Type R FL5.jpg',
    badges: ['Track Weapon', 'Factory Warranty', 'Pure Enthusiast'],
    features: [
      'Red Suede Effect Bucket Seats',
      'LogR Real-time Data Telemetry System',
      'Brembo 4-Piston Aluminum Front Calipers',
      'Dual-Axis MacPherson Front Strut Suspension'
    ]
  },
  {
    id: 'veh-audi-rsq8-2024',
    make: 'Audi',
    model: 'RS Q8 4.0 TFSI quattro',
    year: 2024,
    price: 98500,
    mileage: 7300,
    transmission: 'Automatic',
    fuel: 'Petrol',
    bodyType: 'suv',
    horsepower: 591,
    zeroToSixty: '3.8s',
    engine: '4.0L Twin-Turbocharged V8',
    vin: 'WA1ZZZF55RB920401',
    color: 'Mythos Black Metallic',
    inStock: true,
    image: '/images/2024 Audi RS Q8 4.0 TFSI quattro.jpg',
    badges: ['RS Performance', 'Quattro All-Wheel Drive', 'Air Suspension'],
    features: [
      'RS Adaptive Air Suspension with Sport+ Mode',
      'Bang & Olufsen 3D Advanced Sound System',
      'Virtual Cockpit Plus with RS Track Layout',
      'RS Sports Exhaust with Black Oval Tailpipes'
    ]
  },
  {
    id: 'veh-toyota-prado-2023',
    make: 'Toyota',
    model: 'Land Cruiser Prado VX 2.8 Turbo-Diesel',
    year: 2023,
    price: 49900,
    mileage: 12500,
    transmission: 'Automatic',
    fuel: 'Diesel',
    bodyType: 'suv',
    horsepower: 201,
    zeroToSixty: '10.4s',
    engine: '2.8L Turbo-Diesel Inline-4',
    vin: 'JTMHV05J004192831',
    color: 'Pearl White',
    inStock: true,
    image: '/images/2023 Toyota Land Cruiser Prado.jpg',
    badges: ['7-Seater', 'Full-Time 4x4', 'Clean Title'],
    features: [
      '7-Seat Cabin with Third-Row Climate Control',
      'Full-Time 4WD with Center Differential Lock',
      'Multi-Terrain Select with Crawl Control',
      'JBL 9-Speaker Premium Audio'
    ]
  },
  {
    id: 'veh-lexus-lx600-2024',
    make: 'Lexus',
    model: 'LX 600 Ultra Luxury 3.4TT',
    year: 2024,
    price: 78900,
    mileage: 8700,
    transmission: 'Automatic',
    fuel: 'Petrol',
    bodyType: 'suv',
    horsepower: 409,
    zeroToSixty: '6.7s',
    engine: '3.4L Twin-Turbocharged V6',
    vin: 'JTJBKBCA5R4032810',
    color: 'Ember Copper / Onyx Black',
    inStock: true,
    image: '/images/2024 Lexus LX 600 Ultra Luxury 3.4TT.jpg',
    badges: ['Lexus Certified', '7-Seater', 'Adaptive Variable Suspension'],
    features: [
      'Ultra Luxury 4-Seat Configuration',
      'Mark Levinson 25-Speaker Reference Audio',
      'Multi-Terrain Monitor with Off-Road Camera',
      'Heated & Ventilated 28-Way Massaging Seats'
    ]
  },
  {
    id: 'veh-toyota-hilux-2025',
    make: 'Toyota',
    model: 'Hilux Legend 45 2.8 GD-6 4x4 Auto',
    year: 2025,
    price: 36900,
    mileage: 6100,
    transmission: 'Automatic',
    fuel: 'Diesel',
    bodyType: 'suv',
    horsepower: 204,
    zeroToSixty: '9.8s',
    engine: '2.8L Turbo-Diesel Inline-4',
    vin: 'MR0FB8CDX0218447',
    color: 'Pearl White',
    inStock: true,
    image: '/images/2025 Toyota Hilux Legend 45 2.8 GD-6 4x4 Auto.jpg',
    badges: ['4x4 Workhorse', 'Tow-Ready', 'Low Mileage'],
    features: [
      '4x4 with Rear Differential Lock',
      'Tow Package Rated for 3,500 kg',
      '8.0-inch Touchscreen with Apple CarPlay',
      'Side-Stepping Sports Bar & Roller Shutter'
    ]
  },
  {
    id: 'veh-merc-gle63s-2024',
    make: 'Mercedes-Benz',
    model: 'AMG GLE 63 S 4MATIC+',
    year: 2024,
    price: 109500,
    mileage: 5400,
    transmission: 'Automatic',
    fuel: 'Petrol',
    bodyType: 'suv',
    horsepower: 603,
    zeroToSixty: '3.7s',
    engine: '4.0L Biturbo V8 with EQ Boost',
    vin: '4JGFB8KB2RB318204',
    color: 'Polar White',
    inStock: true,
    image: '/images/2024 Mercedes-Benz AMG GLE 63 S 4MATIC+.jpg',
    badges: ['AMG Performance', '4MATIC+ All-Wheel Drive', 'OEM Warranty'],
    features: [
      'AMG RIDE CONTROL+ Air Suspension',
      'Burmester 3D Surround Sound System',
      'AMG Track Pace Lap-Timing System',
      'AMG High-Performance Ceramic Composite Brakes'
    ]
  }
];

export const INITIAL_PARTS: PartItem[] = [
  {
    id: 'part-powerstop-z23',
    name: 'PowerStop Z23 Evolution Carbon-Fiber Ceramic Brake Kit',
    brand: 'PowerStop',
    partNumber: 'PS-K2008-Z23',
    category: 'brakes',
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.9,
    reviewsCount: 842,
    inStock: 18,
    fitmentMakes: ['BMW', 'Mercedes-Benz', 'Audi', 'Toyota', 'Honda', 'Porsche'],
    fitmentYears: '2016-2025',
    image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=600&q=80',
    description: 'Drilled and slotted zinc-dichromate plated rotors paired with carbon-fiber infused ceramic friction pads. Low dust, zero fade under spirited driving.',
    isBestSeller: true,
    badge: '15% OFF'
  },
  {
    id: 'part-kn-filter',
    name: 'K&N High-Flow Washable Lifetime Cold Air Filter',
    brand: 'K&N Engineering',
    partNumber: 'KN-33-3111',
    category: 'filters',
    price: 54.99,
    originalPrice: 69.99,
    rating: 4.8,
    reviewsCount: 1245,
    inStock: 42,
    fitmentMakes: ['All Makes', 'BMW', 'Toyota', 'Audi', 'Mercedes-Benz', 'Honda'],
    fitmentYears: 'Universal / Model-Specific',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    description: 'Engineered to increase horsepower and rate of acceleration while providing exceptional engine protection. Washable and reusable for 160,000 km.',
    isBestSeller: true,
    badge: 'Top Seller'
  },
  {
    id: 'part-bilstein-b8',
    name: 'Bilstein B8 5100 Monotube High-Performance Shock Absorber',
    brand: 'Bilstein',
    partNumber: 'BIL-24-186728',
    category: 'suspension',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.9,
    reviewsCount: 956,
    inStock: 14,
    fitmentMakes: ['Land Rover', 'Ford', 'Toyota', 'BMW', 'Audi'],
    fitmentYears: '2018-2025',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    description: 'Gas-pressure monotube damper with 46mm digressive working piston. Instantly reacts to road imperfections with razor-sharp chassis composure.',
    isBestSeller: true
  },
  {
    id: 'part-sealight-led',
    name: 'SEALIGHT X4 28,000LM Ultra 6500K LED Headlight Bulbs H11',
    brand: 'SEALIGHT',
    partNumber: 'SL-H11-X4',
    category: 'electrical',
    price: 39.99,
    originalPrice: 59.99,
    rating: 4.7,
    reviewsCount: 1102,
    inStock: 35,
    fitmentMakes: ['Universal Fit', 'Honda', 'Toyota', 'BMW', 'Nissan'],
    fitmentYears: 'All Model Years',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
    description: 'True 1:1 halogen beam pattern with aircraft aluminum heat dissipation and turbo cooling fan. 400% brighter than stock bulbs.',
    isBestSeller: true,
    badge: 'Save $20'
  },
  {
    id: 'part-flowmaster-muffler',
    name: 'Flowmaster Super 44 High-Flow Chambered Exhaust Muffler',
    brand: 'Flowmaster',
    partNumber: 'FM-942548',
    category: 'engine',
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.9,
    reviewsCount: 753,
    inStock: 12,
    fitmentMakes: ['BMW', 'Ford', 'Chevrolet', 'Dodge', 'Toyota'],
    fitmentYears: 'Universal 2.5" / 3.0"',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    description: 'Delivers an aggressive deep exterior rumble with patented Delta Flow technology that minimizes interior cabin resonance and backpressure.',
    isBestSeller: true
  },
  {
    id: 'part-rtx-revolver-rims',
    name: 'RTX Revolver Satin Black 18x8.5 Track Alloy Wheels (Set of 4)',
    brand: 'RTX Wheels',
    partNumber: 'RTX-REV-1885',
    category: 'wheels',
    price: 719.99,
    originalPrice: 879.99,
    rating: 4.8,
    reviewsCount: 632,
    inStock: 8,
    fitmentMakes: ['BMW', 'Audi', 'Mercedes-Benz', 'Toyota', 'Honda'],
    fitmentYears: '5x112 / 5x120 Pattern',
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    description: 'Lightweight flow-formed alloy engineering, maximizing heat dissipation and brake caliper clearance while shaving unsprung rotary mass.',
    isBestSeller: true,
    badge: 'Popular'
  },
  {
    id: 'part-optima-battery',
    name: 'OPTIMA RedTop High-Performance 800 CCA AGM Battery',
    brand: 'Optima',
    partNumber: 'OPT-RED-3478',
    category: 'electrical',
    price: 259.99,
    originalPrice: 289.99,
    rating: 4.9,
    reviewsCount: 512,
    inStock: 16,
    fitmentMakes: ['All Makes', 'Porsche', 'BMW', 'Land Rover', 'Tesla'],
    fitmentYears: 'Universal Group 34/78',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: 'SpiralCell design provides 15 times more vibration resistance and up to 3 times longer life than standard flooded automotive batteries.',
    isBestSeller: false
  },
  {
    id: 'part-bosch-sparkplugs',
    name: 'Bosch Double Platinum Fine Wire Spark Plug (Set of 6)',
    brand: 'Bosch',
    partNumber: 'BSH-FR7DPP33X',
    category: 'engine',
    price: 52.99,
    originalPrice: 65.00,
    rating: 4.9,
    reviewsCount: 884,
    inStock: 60,
    fitmentMakes: ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Toyota'],
    fitmentYears: '2015-2025',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
    description: 'Laser welded 360-degree continuous platinum center electrode firing pin ensures pinpoint spark delivery and 3X longer service life.',
    isBestSeller: false
  },
  {
    id: 'part-akebono-pads',
    name: 'Akebono ProACT Ultra-Premium Ceramic Brake Pads',
    brand: 'Akebono',
    partNumber: 'AKB-ACT-295X',
    category: 'brakes',
    price: 94.99,
    originalPrice: 119.99,
    rating: 4.9,
    reviewsCount: 1104,
    inStock: 32,
    fitmentMakes: ['All Makes', 'Toyota', 'Honda', 'Ford', 'BMW'],
    fitmentYears: '2015-2025',
    image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=600&q=80',
    description: 'Ultra-premium ceramic friction material with anodized steel backing plates for whisper-quiet, low-dust braking with OEM pedal feel.',
    isBestSeller: true,
    badge: 'Top Seller'
  },
  {
    id: 'part-brembo-discs',
    name: 'Brembo Performance Drilled Disc Rotors (Pair)',
    brand: 'Brembo',
    partNumber: 'BRE-09A678-23',
    category: 'brakes',
    price: 189.99,
    originalPrice: 239.99,
    rating: 4.9,
    reviewsCount: 687,
    inStock: 14,
    fitmentMakes: ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche'],
    fitmentYears: '2016-2025',
    image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=600&q=80',
    description: 'Precision-drilled high-carbon rotors that stay cool under hard braking, shed water faster, and resist pad glazing.',
    isBestSeller: false
  },
  {
    id: 'part-brembo-calipers',
    name: 'Brembo GT 4-Piston Caliper Upgrade Kit',
    brand: 'Brembo',
    partNumber: 'BRE-GT41-6600',
    category: 'brakes',
    price: 1899.00,
    originalPrice: 2199.00,
    rating: 4.8,
    reviewsCount: 214,
    inStock: 4,
    fitmentMakes: ['BMW', 'Audi', 'Ford', 'Chevrolet'],
    fitmentYears: '2018-2025',
    image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=600&q=80',
    description: 'Radial-mount 4-piston forged aluminium calipers with large racing pads for fade-free, repeatable track stopping power.',
    isBestSeller: false
  },
  {
    id: 'part-castrol-brakefluid',
    name: 'Castrol React DOT 4 Brake Fluid (1L)',
    brand: 'Castrol',
    partNumber: 'CST-RBF-DOT4',
    category: 'brakes',
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.8,
    reviewsCount: 932,
    inStock: 75,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=600&q=80',
    description: 'High-Performance DOT 4 fluid with dry boiling point of 265°C for consistent pedal feel in daily driving and track use.',
    isBestSeller: false
  },
  {
    id: 'part-gates-belt-kit',
    name: 'Gates Timing Belt & Tensioner Kit',
    brand: 'Gates',
    partNumber: 'GAT-TCK-200',
    category: 'engine',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.9,
    reviewsCount: 1012,
    inStock: 22,
    fitmentMakes: ['Honda', 'Toyota', 'Nissan', 'Mazda', 'Subaru'],
    fitmentYears: '2010-2024',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
    description: 'Complete timing belt kit with precision tensioner and idler pulleys — everything needed for a factory-spec timing service.',
    isBestSeller: false
  },
  {
    id: 'part-felpro-gasket',
    name: 'Fel-Pro Performance Head Gasket Set',
    brand: 'Fel-Pro',
    partNumber: 'FP-PHP-1988',
    category: 'engine',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.9,
    reviewsCount: 456,
    inStock: 18,
    fitmentMakes: ['Chevrolet', 'Ford', 'Dodge', 'Toyota'],
    fitmentYears: '2005-2024',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    description: 'Multi-layer steel (MLS) head gaskets with PermaDry sealing technology for the toughest engine rebuilds.',
    isBestSeller: false
  },
  {
    id: 'part-acdelco-pistons',
    name: 'ACDelco Forged Performance Piston Set',
    brand: 'ACDelco',
    partNumber: 'ACD-FP-4032',
    category: 'engine',
    price: 349.99,
    originalPrice: 419.99,
    rating: 4.7,
    reviewsCount: 176,
    inStock: 6,
    fitmentMakes: ['GM', 'Chevrolet', 'Ford'],
    fitmentYears: '2015-2024',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    description: 'CNC-forged 2618 alloy pistons rated for forced-induction builds up to 850hp with premium ring package included.',
    isBestSeller: false
  },
  {
    id: 'part-moog-control-arms',
    name: 'MOOG Premium Control Arm Kit',
    brand: 'MOOG',
    partNumber: 'MOG-RK620263',
    category: 'suspension',
    price: 149.99,
    originalPrice: 179.99,
    rating: 4.8,
    reviewsCount: 894,
    inStock: 11,
    fitmentMakes: ['BMW', 'Toyota', 'Honda', 'Ford', 'Chevrolet'],
    fitmentYears: '2015-2025',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    description: 'Problem-solver control arms with pre-installed ball joints and bushings for precise steering and alignment retention.',
    isBestSeller: true
  },
  {
    id: 'part-poly-bushings',
    name: 'Polyurethane Suspension Bushing Kit',
    brand: 'Prothane',
    partNumber: 'PTH-18-1125',
    category: 'suspension',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviewsCount: 512,
    inStock: 27,
    fitmentMakes: ['All Makes', 'BMW', 'Honda', 'Mazda'],
    fitmentYears: '2000-2024',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    description: 'Performance polyurethane bushings that eliminate sloppy suspension movement and sharpen the chassis handling response.',
    isBestSeller: false
  },
  {
    id: 'part-mevotech-balljoints',
    name: 'Mevotech Supreme Ball Joint Kit',
    brand: 'Mevotech',
    partNumber: 'MEV-SBJ-4450',
    category: 'suspension',
    price: 49.99,
    originalPrice: 64.99,
    rating: 4.8,
    reviewsCount: 633,
    inStock: 38,
    fitmentMakes: ['All Makes', 'Toyota', 'Ford', 'Chevrolet'],
    fitmentYears: '2012-2024',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    description: 'Greaseable, forged-steel ball joints with PTFE-coated studs for long service life and a factory-fresh ride.',
    isBestSeller: false
  },
  {
    id: 'part-denso-alternator',
    name: 'Denso High-Output Alternator (220A)',
    brand: 'Denso',
    partNumber: 'DEN-ALT-220',
    category: 'electrical',
    price: 249.99,
    originalPrice: 289.99,
    rating: 4.9,
    reviewsCount: 388,
    inStock: 9,
    fitmentMakes: ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz'],
    fitmentYears: '2015-2025',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: 'High-output 220A alternator engineered for higher electrical loads — audio systems, winches, and auxiliary lighting.',
    isBestSeller: false
  },
  {
    id: 'part-bosch-starter',
    name: 'Bosch Professional Starter Motor',
    brand: 'Bosch',
    partNumber: 'BSH-SRM-0049',
    category: 'electrical',
    price: 179.99,
    originalPrice: 209.99,
    rating: 4.9,
    reviewsCount: 425,
    inStock: 12,
    fitmentMakes: ['All Makes', 'Volkswagen', 'Audi', 'Mercedes-Benz'],
    fitmentYears: '2013-2024',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: 'OEM-grade remanufactured starter motor with fully tested solenoid, planetary gear assembly, and sealed electronics.',
    isBestSeller: false
  },
  {
    id: 'part-bosch-fuses',
    name: 'Bosch Standard & Mini Blade Fuse Assortment (120 pc)',
    brand: 'Bosch',
    partNumber: 'BSH-FUS-120',
    category: 'electrical',
    price: 14.99,
    originalPrice: 19.99,
    rating: 4.8,
    reviewsCount: 721,
    inStock: 90,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
    description: 'Everyday blade fuse assortment in a durable case — standard, mini, and low-profile sizes for repairs and replacements.',
    isBestSeller: false
  },
  {
    id: 'part-aisin-trans-filter',
    name: 'AISIN Automatic Transmission Filter Kit',
    brand: 'AISIN',
    partNumber: 'AIS-TF-3110',
    category: 'transmission',
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.8,
    reviewsCount: 358,
    inStock: 30,
    fitmentMakes: ['Toyota', 'Lexus', 'Honda', 'Nissan'],
    fitmentYears: '2012-2024',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    description: 'OEM-quality filter, pan gasket, and o-rings for complete transmission service without the stealership price.',
    isBestSeller: false
  },
  {
    id: 'part-mobil-atf',
    name: 'Mobil 1 Synthetic ATF Transmission Fluid (1 GAL)',
    brand: 'Mobil 1',
    partNumber: 'M1-SATF-128',
    category: 'transmission',
    price: 54.99,
    originalPrice: 64.99,
    rating: 4.9,
    reviewsCount: 614,
    inStock: 48,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'Dexron VI / Mercon V / SP-III',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    description: 'Full-synthetic ATF engineered for smooth shifts, superior friction durability, and extended transmission life.',
    isBestSeller: true
  },
  {
    id: 'part-luk-clutch-kit',
    name: 'LUK Clutch Kit (Disc, Pressure Plate & Release Bearing)',
    brand: 'LUK',
    partNumber: 'LUK-04-213',
    category: 'transmission',
    price: 289.99,
    originalPrice: 339.99,
    rating: 4.9,
    reviewsCount: 266,
    inStock: 8,
    fitmentMakes: ['Volkswagen', 'Audi', 'BMW', 'Ford'],
    fitmentYears: '2012-2024',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    description: 'Complete clutch replacement kit with OE-style damped disc, pressure plate, and release bearing for smooth engagement.',
    isBestSeller: false
  },
  {
    id: 'part-mishimoto-radiator',
    name: 'Mishimoto Aluminum Racing Radiator',
    brand: 'Mishimoto',
    partNumber: 'MSH-MMR-88',
    category: 'cooling',
    price: 349.99,
    originalPrice: 419.99,
    rating: 4.9,
    reviewsCount: 521,
    inStock: 7,
    fitmentMakes: ['Honda', 'Nissan', 'Subaru', 'BMW', 'Mazda'],
    fitmentYears: '2002-2024',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    description: '100% aluminium, 2-row cored radiator with TIG-welded tanks for maximum heat rejection and lifetime performance.',
    isBestSeller: false
  },
  {
    id: 'part-stant-thermostat',
    name: 'Stant SuperStat Thermostat',
    brand: 'Stant',
    partNumber: 'STA-SST-45358',
    category: 'cooling',
    price: 17.99,
    originalPrice: 22.99,
    rating: 4.8,
    reviewsCount: 884,
    inStock: 65,
    fitmentMakes: ['All Makes'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    description: 'Fail-safe thermostat with premium wax element and bypass design that holds temperature steadier under load.',
    isBestSeller: false
  },
  {
    id: 'part-bosch-waterpump',
    name: 'Bosch Engine Water Pump',
    brand: 'Bosch',
    partNumber: 'BSH-WPU-6723',
    category: 'cooling',
    price: 119.99,
    originalPrice: 149.99,
    rating: 4.9,
    reviewsCount: 445,
    inStock: 13,
    fitmentMakes: ['All Makes', 'BMW', 'Audi', 'Volkswagen'],
    fitmentYears: '2010-2024',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
    description: 'OEM-spec coolant pump with durable ceramic seal and precision bearings for quiet, leak-free cooling circulation.',
    isBestSeller: false
  },
  {
    id: 'part-mobil-oil-filter',
    name: 'Mobil 1 Extended Performance Oil Filter',
    brand: 'Mobil 1',
    partNumber: 'M1-EP-110',
    category: 'filters',
    price: 16.99,
    originalPrice: 21.99,
    rating: 4.9,
    reviewsCount: 1392,
    inStock: 88,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    description: 'Extended performance synthetic blend media filter rated for up to 32,000-km service intervals.',
    isBestSeller: true
  },
  {
    id: 'part-bosch-air-filter',
    name: 'Bosch Filtron Engine Air Filter',
    brand: 'Bosch',
    partNumber: 'BSH-AF-0999',
    category: 'filters',
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.8,
    reviewsCount: 1022,
    inStock: 54,
    fitmentMakes: ['All Makes', 'BMW', 'Toyota', 'Ford'],
    fitmentYears: '2014-2024',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    description: 'High-efficiency multi-layer media air filter that protects the engine while optimizing airflow and fuel economy.',
    isBestSeller: false
  },
  {
    id: 'part-fram-fuel-filter',
    name: 'FRAM SureGrip Fuel Filter',
    brand: 'FRAM',
    partNumber: 'FRM-G7418',
    category: 'filters',
    price: 12.99,
    originalPrice: 16.99,
    rating: 4.8,
    reviewsCount: 766,
    inStock: 47,
    fitmentMakes: ['All Makes', 'Toyota', 'Honda', 'Ford'],
    fitmentYears: '2008-2024',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    description: 'SureGrip fuel filter with high-dirt-holding capacity to protect fuel injectors and pumps from contamination.',
    isBestSeller: false
  },
  {
    id: 'part-michelin-tires',
    name: 'Michelin Pilot Sport 4 S Tyres (Set of 4)',
    brand: 'Michelin',
    partNumber: 'MCL-PS4S-25535',
    category: 'wheels',
    price: 1199.99,
    originalPrice: 1399.99,
    rating: 4.9,
    reviewsCount: 943,
    inStock: 6,
    fitmentMakes: ['All Makes'],
    fitmentYears: '255/35 R19',
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    description: 'The benchmark max-performance summer tyre — razor-sharp steering, incredible dry grip, and confidence in the wet.',
    isBestSeller: true,
    badge: 'Best Seller'
  },
  {
    id: 'part-bbs-rims',
    name: 'BBS CH-R Graphite Alloy Rims 18" (Set of 4)',
    brand: 'BBS',
    partNumber: 'BBS-CHR-18',
    category: 'wheels',
    price: 1499.99,
    originalPrice: 1799.99,
    rating: 4.9,
    reviewsCount: 312,
    inStock: 5,
    fitmentMakes: ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen'],
    fitmentYears: '5x112 / 5x120',
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    description: 'Flow-formed lightweight aluminium rims with a stiffer rim bed and striking graphite finish — style meets strength.',
    isBestSeller: false
  },
  {
    id: 'part-gorilla-lug-nuts',
    name: 'Gorilla Wheel Locks & Lug Nut Set (20 pc)',
    brand: 'Gorilla',
    partNumber: 'GOR-45525-HT',
    category: 'wheels',
    price: 49.99,
    originalPrice: 59.99,
    rating: 4.8,
    reviewsCount: 487,
    inStock: 39,
    fitmentMakes: ['All Makes'],
    fitmentYears: '12mm x 1.5 / universal',
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    description: 'Cold-forged lug nuts with anti-theft wheel locks and unique key for total wheel security.',
    isBestSeller: false
  },
  {
    id: 'part-floor-liners',
    name: 'WeatherTech All-Weather Custom Floor Liners',
    brand: 'WeatherTech',
    partNumber: 'WT-FL-44121',
    category: 'accessories',
    price: 179.99,
    originalPrice: 209.99,
    rating: 4.9,
    reviewsCount: 1234,
    inStock: 20,
    fitmentMakes: ['All Makes'],
    fitmentYears: 'Model-Specific Fit',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    description: 'Digitally measured laser-fit floor liners that trap water, mud, and snow with raised ridges for total floor protection.',
    isBestSeller: true,
    badge: 'Top Seller'
  },
  {
    id: 'part-seat-covers',
    name: 'Katzkin Custom Leather Seat Covers',
    brand: 'Katzkin',
    partNumber: 'KTZ-SC-2020',
    category: 'accessories',
    price: 899.99,
    originalPrice: 1099.99,
    rating: 4.8,
    reviewsCount: 268,
    inStock: 8,
    fitmentMakes: ['All Makes'],
    fitmentYears: 'Model-Specific Fit',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    description: 'Full custom leather upholstery in your choice of colours and stitching with a factory-finish look.',
    isBestSeller: false
  },
  {
    id: 'part-steering-cover',
    name: 'Perforated Leather Steering Wheel Cover',
    brand: 'MotorSeat',
    partNumber: 'MTS-SC-14',
    category: 'accessories',
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.6,
    reviewsCount: 1985,
    inStock: 64,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: '14-16" Wheels',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
    description: 'Anti-slip perforated leather steering wheel cover that improves grip and adds a premium touch to any cabin.',
    isBestSeller: false
  },
  {
    id: 'part-phone-holder',
    name: 'Magnetic Car Phone Holder (Dashboard & Vent)',
    brand: 'Anker',
    partNumber: 'ANK-MPH-01',
    category: 'accessories',
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.7,
    reviewsCount: 3421,
    inStock: 120,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    description: '360° adjustable magnetic phone mount with strong N52 magnets and a pivoting ball socket for one-handed mounting.',
    isBestSeller: true
  },
  {
    id: 'part-dash-cam',
    name: '4K Ultra HD Dual Dash Camera (Front & Rear)',
    brand: 'VIOFO',
    partNumber: 'VFO-A1294K',
    category: 'accessories',
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.8,
    reviewsCount: 1190,
    inStock: 17,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80',
    description: 'Sony STARVIS 4K front + 1080p rear recording with built-in GPS, Wi-Fi, and parking-guard motion detection.',
    isBestSeller: true,
    badge: 'Popular'
  },
  {
    id: 'part-parking-sensors',
    name: 'Wireless Rear Parking Sensor System',
    brand: 'Cobra',
    partNumber: 'CBR-PKS-4A',
    category: 'accessories',
    price: 89.99,
    originalPrice: 109.99,
    rating: 4.6,
    reviewsCount: 743,
    inStock: 21,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
    description: '4-sensor wireless parking assist with distance display and audible beeps so every parking spot becomes easy.',
    isBestSeller: false
  },
  {
    id: 'part-led-headlights',
    name: 'Philips Ultinon Pro9000 LED Headlight Kit',
    brand: 'Philips',
    partNumber: 'PHP-LED-9000',
    category: 'accessories',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.9,
    reviewsCount: 1667,
    inStock: 29,
    fitmentMakes: ['Universal Fit', 'Honda', 'Toyota', 'BMW'],
    fitmentYears: 'H11/H7/HB4 Sockets',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
    description: 'Intense 4500K premium LED upgrade with active cooling fan for sharp, bright, and perfectly focused beam patterns.',
    isBestSeller: true,
    badge: 'Save $30'
  },
  {
    id: 'part-car-audio',
    name: 'Pioneer Double-DIN Car Audio Receiver w/ Apple CarPlay',
    brand: 'Pioneer',
    partNumber: 'PIO-DSM-AH2550',
    category: 'accessories',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewsCount: 634,
    inStock: 10,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
    description: '6.8" touchscreen receiver with Apple CarPlay, Android Auto, Bluetooth, and DSP equaliser for studio-grade sound.',
    isBestSeller: false
  },
  {
    id: 'part-speakers',
    name: 'JBL 6.5" Coaxial Car Speakers (Pair)',
    brand: 'JBL',
    partNumber: 'JBL-CX652-2',
    category: 'accessories',
    price: 129.99,
    originalPrice: 149.99,
    rating: 4.8,
    reviewsCount: 1456,
    inStock: 33,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: '6.5" / 165mm',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
    description: 'High-efficiency coaxial speakers with Edge-Driven tweeters for crisp highs, deep bass, and dynamic clarity.',
    isBestSeller: false
  },
  {
    id: 'part-car-charger',
    name: 'Anker 45W Dual-Port USB-C Fast Car Charger',
    brand: 'Anker',
    partNumber: 'ANK-45W-CC',
    category: 'accessories',
    price: 34.99,
    originalPrice: 39.99,
    rating: 4.9,
    reviewsCount: 2876,
    inStock: 95,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    description: 'Charge two phones at once with 45W of total USB-C/PD fast charging that can even power laptops on the move.',
    isBestSeller: false
  },
  {
    id: 'part-air-freshener',
    name: 'Little Trees Premium Car Air Fresheners (6 Pack)',
    brand: 'Little Trees',
    partNumber: 'LT-AF-6PK',
    category: 'accessories',
    price: 8.99,
    originalPrice: 12.99,
    rating: 4.7,
    reviewsCount: 4088,
    inStock: 210,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
    description: 'Iconic scented trees in assorted fresh fragrance favourites to keep your interior smelling great for weeks.',
    isBestSeller: false
  },
  {
    id: 'part-sunshade',
    name: 'Foldable Windshield Sunshade (UV Protection)',
    brand: 'Covercraft',
    partNumber: 'CVC-SS-UV',
    category: 'accessories',
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.7,
    reviewsCount: 987,
    inStock: 48,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: 'Block up to 99% of UV rays and cut interior heat dramatically with this custom-fit folding sunshade.',
    isBestSeller: false
  },
  {
    id: 'part-wiper-blades',
    name: 'Bosch ICON All-Weather Wiper Blades (Pair)',
    brand: 'Bosch',
    partNumber: 'BSH-ICON-PAIR',
    category: 'accessories',
    price: 41.99,
    originalPrice: 49.99,
    rating: 4.9,
    reviewsCount: 2123,
    inStock: 60,
    fitmentMakes: ['All Makes'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80',
    description: 'Beam-style wipers with FX dual rubber compound for a virtually streak-free, chatter-free wipe in all weather.',
    isBestSeller: true
  },
  {
    id: 'part-roof-rack',
    name: 'Thule Crossbar Roof Rack System',
    brand: 'Thule',
    partNumber: 'THU-XL-450R',
    category: 'accessories',
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    reviewsCount: 365,
    inStock: 7,
    fitmentMakes: ['All Makes'],
    fitmentYears: 'Universal Fit',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
    description: 'Aerodynamic, wind-tunnel-tested crossbars with robust load rating — carry kayaks, bikes, and roof boxes securely.',
    isBestSeller: false
  },
  {
    id: 'part-cleaning-kit',
    name: "Meguiar's Complete Car Detailing & Cleaning Kit",
    brand: 'Meguiar`s',
    partNumber: 'MEG-COMPLETE-8',
    category: 'accessories',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviewsCount: 1544,
    inStock: 40,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'All Vehicles',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: 'Complete kit including wash, wax, tyre shine, interior cleaner, microfibre towels, and applicator pads.',
    isBestSeller: true,
    badge: 'Save $20'
  },
  {
    id: 'part-jump-starter',
    name: 'NOCO GB40 1000A Lithium Jump Starter + Power Bank',
    brand: 'NOCO',
    partNumber: 'NOC-GB40-6A',
    category: 'accessories',
    price: 99.99,
    originalPrice: 129.99,
    rating: 4.9,
    reviewsCount: 1833,
    inStock: 22,
    fitmentMakes: ['Universal Fit'],
    fitmentYears: 'Up to 6L Gas / 3L Diesel',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    description: 'Jump-start a dead battery in seconds plus power phones and tablets with 1000A and USB charging — safe and spark-proof.',
    isBestSeller: true
  }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-femi',
    name: 'Femi Adeyemi',
    specialty: 'Master Certified & Engine Diagnostics Specialist',
    experienceYears: 14,
    rating: 4.98,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    status: 'in_bay'
  },
  {
    id: 'tech-chidera',
    name: 'Chidera Nwosu',
    specialty: 'Lead Electrical & Computer Diagnostics Expert',
    experienceYears: 10,
    rating: 4.95,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    status: 'available'
  },
  {
    id: 'tech-tunde',
    name: 'Tunde Ogunleye',
    specialty: 'Brakes & Suspension Senior Tech',
    experienceYears: 12,
    rating: 4.92,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    status: 'available'
  },
  {
    id: 'tech-ibrahim',
    name: 'Ibrahim Suleiman',
    specialty: 'Transmission & HVAC Specialist',
    experienceYears: 8,
    rating: 4.89,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'available'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1001',
    customerId: 'cust-101',
    customerName: 'Babajide Adeleke',
    customerPhone: '+234 802 317 9860',
    customerEmail: 'b.adeleke@gmail.com',
    vehicleYear: 2023,
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehiclePlate: 'EKY-774-LG',
    vin: 'JTNBF4EK2P32048291',
    serviceId: 'srv-oil-change',
    serviceName: 'Oil Change & Servicing',
    additionalServices: ['Brake Fluid Moisture Test', 'Tire Rotation'],
    assignedTechnician: 'Femi Adeyemi',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:30',
    status: 'in_repair',
    customerNotes: 'Please check a slight vibration under acceleration around 3,000 RPM.',
    technicianNotes: 'Fresh 5W-30 fully synthetic oil and new filter fitted. Coupling bolt torqued to spec; vibration resolved.',
    totalCost: 179.99,
    depositAmount: 50.00,
    paymentStatus: 'deposit_paid',
    paymentTransactionId: 'txn_948291048',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'apt-1002',
    customerId: 'cust-102',
    customerName: 'Chioma Okafor',
    customerPhone: '+234 803 552 1920',
    customerEmail: 'chioma.okafor@lagosdesign.ng',
    vehicleYear: 2022,
    vehicleMake: 'Lexus',
    vehicleModel: 'ES 350',
    vehiclePlate: 'IKJ-813-AA',
    vin: '58ABZ1B25NU240918',
    serviceId: 'srv-brakes',
    serviceName: 'Brake Service',
    additionalServices: ['Rotor Resurfacing'],
    assignedTechnician: 'Tunde Ogunleye',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '13:00',
    status: 'ready_for_pickup',
    customerNotes: 'Please confirm the front pads are not squealing after the bed-in procedure.',
    technicianNotes: 'Front and rear pads replaced, discs resurfaced, brake fluid flushed. Final road test passed.',
    totalCost: 449.00,
    depositAmount: 449.00,
    paymentStatus: 'paid',
    paymentTransactionId: 'txn_102938475',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'apt-1003',
    customerId: 'cust-103',
    customerName: 'Olumide Bakare',
    customerPhone: '+234 808 891 3049',
    customerEmail: 'obakare@techlagos.com',
    vehicleYear: 2021,
    vehicleMake: 'Mercedes-Benz',
    vehicleModel: 'C300',
    vehiclePlate: 'LND-582-KS',
    vin: 'W1KZF8DB3MA920194',
    serviceId: 'srv-engine-diagnostics',
    serviceName: 'Engine Diagnostics',
    additionalServices: [],
    assignedTechnician: 'Chidera Nwosu',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '09:00',
    status: 'confirmed',
    customerNotes: 'Intermittent check-engine light, fuel system lean condition.',
    technicianNotes: 'Full OBD-II diagnostic scan and smoke test scheduled on lift bay #2.',
    totalCost: 89.00,
    depositAmount: 50.00,
    paymentStatus: 'deposit_paid',
    paymentTransactionId: 'txn_481029384',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-101',
    name: 'Babajide Adeleke',
    email: 'b.adeleke@gmail.com',
    phone: '+234 802 317 9860',
    address: 'Ilasan New Road, behind Emardeb Filling Station, Eti-Osa, Lekki, Lagos',
    vehicleInfo: '2023 Toyota Camry',
    totalSpent: 4250.00,
    loyaltyPoints: 850,
    tier: 'Femisayo VIP',
    createdAt: '2024-02-14',
    encryptedVault: {
      iv: 'jX7kLmNpQrStUvWx',
      ciphertext: 'kP9xLmNwRtY1028374==',
      algorithm: 'AES-GCM-256',
      maskedPreview: {
        vinLast4: '•••••••••••••8291',
        licenseMasked: '••••9482',
        taxIdMasked: '•••-••-4821'
      }
    }
  },
  {
    id: 'cust-102',
    name: 'Chioma Okafor',
    email: 'chioma.okafor@lagosdesign.ng',
    phone: '+234 803 552 1920',
    address: '1 Samuel Adedoyin Street, opposite Zion Court, Lekki, Elegushi, Lagos',
    vehicleInfo: '2022 Lexus ES 350',
    totalSpent: 6890.00,
    loyaltyPoints: 1378,
    tier: 'Platinum',
    createdAt: '2023-11-08',
    encryptedVault: {
      iv: 'aB3dEfGhIjKlMnOp',
      ciphertext: 'mZ8qLtVxPw1928374==',
      algorithm: 'AES-GCM-256',
      maskedPreview: {
        vinLast4: '•••••••••••••0918',
        licenseMasked: '••••1049',
        taxIdMasked: '•••-••-9182'
      }
    }
  },
  {
    id: 'cust-103',
    name: 'Olumide Bakare',
    email: 'obakare@techlagos.com',
    phone: '+234 808 891 3049',
    address: 'Admiralty Way, Lekki Phase 1, Eti-Osa, Lagos State',
    vehicleInfo: '2021 Mercedes-Benz C300',
    totalSpent: 1480.00,
    loyaltyPoints: 296,
    tier: 'Gold',
    createdAt: '2024-06-20',
    encryptedVault: {
      iv: 'qR5sTuVwXyZaBcDe',
      ciphertext: 'nL4kPsQwMz8271049==',
      algorithm: 'AES-GCM-256',
      maskedPreview: {
        vinLast4: '•••••••••••••0194',
        licenseMasked: '••••5820',
        taxIdMasked: '•••-••-3041'
      }
    }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-8021',
    customerId: 'cust-101',
    customerName: 'Babajide Adeleke',
    customerEmail: 'b.adeleke@gmail.com',
    shippingAddress: 'Ilasan New Road, behind Emardeb Filling Station, Eti-Osa, Lekki, Lagos',
    items: [
      {
        partId: 'part-powerstop-z23',
        partName: 'PowerStop Z23 Evolution Carbon-Fiber Ceramic Brake Kit',
        brand: 'PowerStop',
        price: 199.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=600&q=80'
      },
      {
        partId: 'part-kn-filter',
        partName: 'K&N High-Flow Washable Lifetime Cold Air Filter',
        brand: 'K&N Engineering',
        price: 54.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
      }
    ],
    subtotal: 254.98,
    discount: 25.50,
    tax: 20.65,
    total: 250.13,
    couponApplied: 'DRIVE10',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    fulfillmentStatus: 'shipped',
    trackingNumber: 'FEM-99201948201',
    carrier: 'Femisayo Express Dispatch Lekki',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    title: 'Service In Progress',
    message: 'Femisayo Autos Workshop: Femi Adeyemi has put your 2023 Toyota Camry on Bay #1 for oil & filter maintenance.',
    type: 'appointment',
    timestamp: '15 mins ago',
    read: false,
    appointmentId: 'apt-1001'
  },
  {
    id: 'notif-2',
    title: 'Vehicle Ready for Pickup!',
    message: 'Femisayo Autos: Your 2022 Lexus ES 350 brake service is complete. Final road test passed.',
    type: 'appointment',
    timestamp: '1 hour ago',
    read: false,
    appointmentId: 'apt-1002'
  },
  {
    id: 'notif-3',
    title: 'Parts Order Dispatched',
    message: 'Order #ORD-8021 containing PowerStop Brake Kit has been dispatched to Lekki. Tracking: FEM-99201948201',
    type: 'order',
    timestamp: '4 hours ago',
    read: true,
    orderId: 'ord-8021'
  }
];

// LocalStorage helpers with automatic JSON deserialization and fallback to initial seeds
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// Typed convenience accessors
export const loadAppointments = () => loadFromStorage<Appointment[]>('apex_appointments', INITIAL_APPOINTMENTS);
export const saveAppointments = (data: Appointment[]) => saveToStorage('apex_appointments', data);

export const loadVehicles = () => loadFromStorage<VehicleItem[]>('apex_vehicles', INITIAL_VEHICLES);
export const saveVehicles = (data: VehicleItem[]) => saveToStorage('apex_vehicles', data);

export const loadParts = () => loadFromStorage<PartItem[]>('apex_parts', INITIAL_PARTS);
export const saveParts = (data: PartItem[]) => saveToStorage('apex_parts', data);

export const loadCustomers = () => loadFromStorage<CustomerRecord[]>('apex_customers', INITIAL_CUSTOMERS);
export const saveCustomers = (data: CustomerRecord[]) => saveToStorage('apex_customers', data);

export const loadOrders = () => loadFromStorage<Order[]>('apex_orders', INITIAL_ORDERS);
export const saveOrders = (data: Order[]) => saveToStorage('apex_orders', data);

export const loadNotifications = () => loadFromStorage<PushNotification[]>('apex_notifications', INITIAL_NOTIFICATIONS);
export const saveNotifications = (data: PushNotification[]) => saveToStorage('apex_notifications', data);

// Customer Auth Accounts (email/password used for login)
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleInfo: string;
  password: string;
  createdAt: string;
}

export const loadAuthUsers = () => loadFromStorage<AuthUser[]>('apex_auth_users', []);
export const saveAuthUsers = (users: AuthUser[]) => saveToStorage('apex_auth_users', users);

// Per-account wishlist (persists across logout / sessions, keyed by account email)
export const loadWishlist = (email: string) => loadFromStorage<PartItem[]>(`apex_wishlist_${email}`, []);
export const saveWishlist = (email: string, items: PartItem[]) => saveToStorage(`apex_wishlist_${email}`, items);

// Push Notification Native Browser Trigger
export async function sendBrowserPushNotification(title: string, body: string, icon = '/favicon.ico') {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon
      });
      return true;
    } catch (e) {
      console.warn('Native notification spawn failed, fallback to toast:', e);
      return false;
    }
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(title, { body, icon });
      return true;
    }
  }
  return false;
}
