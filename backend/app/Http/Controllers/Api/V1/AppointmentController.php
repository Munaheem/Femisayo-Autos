<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\CustomerVehicle;
use App\Models\Service;
use App\Models\Technician;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    /**
     * Display appointments.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Appointment::with([
            'customer',
            'vehicle',
            'service',
            'technician',
        ])
            ->latest('date')
            ->latest('scheduled_time');

        /*
        |--------------------------------------------------------------------------
        | Customer Scope
        |--------------------------------------------------------------------------
        |
        | Customers can only see their own appointments.
        | Staff/admin users can see all appointments.
        |
        */

        if ($user->role === 'customer') {
            $customer = Customer::where('user_id', $user->id)->first();

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer profile not found.',
                ], 404);
            }

            $query->where('customer_id', $customer->id);
        }

        return AppointmentResource::collection(
            $query->get()
        );
    }


    /**
     * Create a new appointment.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'customerId' => [
                'nullable',
                'integer',
                'exists:customers,id',
            ],

            'vehicleId' => [
                'required',
                'integer',
                'exists:customer_vehicles,id',
            ],

            'serviceId' => [
                'required',
                'string',
                'exists:services,id',
            ],

            'technicianId' => [
                'nullable',
                'string',
                'exists:technicians,id',
            ],

            'assignedTechnician' => [
                'nullable',
                'string',
                'max:255',
            ],

            'date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'scheduledTime' => [
                'required',
                'date_format:H:i',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Determine Customer
        |--------------------------------------------------------------------------
        */

        if ($user->role === 'customer') {

            $customer = Customer::where(
                'user_id',
                $user->id
            )->first();

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer profile not found.',
                ], 404);
            }

        } else {

            if (! isset($validated['customerId'])) {
                throw ValidationException::withMessages([
                    'customerId' => [
                        'Customer ID is required for staff-created appointments.',
                    ],
                ]);
            }

            $customer = Customer::findOrFail(
                $validated['customerId']
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Verify Vehicle Belongs To Customer
        |--------------------------------------------------------------------------
        */

        $vehicle = CustomerVehicle::where(
            'id',
            $validated['vehicleId']
        )
            ->where(
                'customer_id',
                $customer->id
            )
            ->first();

        if (! $vehicle) {
            throw ValidationException::withMessages([
                'vehicleId' => [
                    'The selected vehicle does not belong to this customer.',
                ],
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | Get Active Service
        |--------------------------------------------------------------------------
        */

        $service = Service::where(
            'id',
            $validated['serviceId']
        )
            ->where(
                'is_active',
                true
            )
            ->first();

        if (! $service) {
            return response()->json([
                'error' => 'The selected service is not available.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Technician Validation
        |--------------------------------------------------------------------------
        */

        $technician = null;

        if (! empty($validated['technicianId'])) {

            $technician = Technician::find(
                $validated['technicianId']
            );

            if (! $technician) {
                return response()->json([
                    'error' => 'Selected technician was not found.',
                ], 422);
            }

            if ($technician->status === 'off_duty') {
                return response()->json([
                    'error' => 'Selected technician is currently off duty.',
                ], 422);
            }


            /*
            |--------------------------------------------------------------------------
            | Duration-Aware Technician Conflict Check
            |--------------------------------------------------------------------------
            |
            | Example:
            |
            | Existing appointment:
            | 10:00 → 10:30
            |
            | New appointment:
            | 10:15 → 10:45
            |
            | These appointments overlap and must be rejected.
            |
            */

            $requestedStart = Carbon::createFromFormat(
                'Y-m-d H:i',
                $validated['date']
                    . ' '
                    . $validated['scheduledTime']
            );

            $requestedEnd = $requestedStart->copy()
                ->addMinutes(
                    (int) $service->duration_minutes
                );


            $existingAppointments = Appointment::with('service')
                ->where(
                    'technician_id',
                    $technician->id
                )
                ->whereDate(
                    'date',
                    $validated['date']
                )
                ->whereNotIn(
                    'status',
                    ['cancelled']
                )
                ->get();


            foreach ($existingAppointments as $existingAppointment) {

                $existingStart = Carbon::createFromFormat(
                    'Y-m-d H:i',
                    $existingAppointment->date->format('Y-m-d')
                        . ' '
                        . substr(
                            $existingAppointment->scheduled_time,
                            0,
                            5
                        )
                );


                $existingServiceDuration =
                    $existingAppointment->service?->duration_minutes
                    ?? 60;


                $existingEnd = $existingStart->copy()
                    ->addMinutes(
                        (int) $existingServiceDuration
                    );


                $overlaps =
                    $requestedStart < $existingEnd
                    &&
                    $requestedEnd > $existingStart;


                if ($overlaps) {
                    return response()->json([
                        'error' =>
                            'Selected technician is already booked during this time.',
                    ], 409);
                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Create Appointment Atomically
        |--------------------------------------------------------------------------
        */

        $appointment = DB::transaction(function () use (
            $validated,
            $customer,
            $service,
            $technician
        ) {

            return Appointment::create([

                /*
                | Use a unique appointment ID.
                */
                'id' => 'apt-' . uniqid(),

                /*
                | Customer
                */
                'customer_id' => $customer->id,

                /*
                | Vehicle
                */
                'vehicle_id' => $validated['vehicleId'],

                /*
                | Service
                */
                'service_id' => $service->id,

                /*
                | Technician
                */
                'technician_id' => $technician?->id,

                /*
                | Display name for frontend compatibility.
                */
                'assigned_technician' =>
                    $technician?->name
                    ?? $validated['assignedTechnician']
                    ?? null,

                /*
                | Schedule
                */
                'date' => $validated['date'],

                'scheduled_time' =>
                    $validated['scheduledTime'],

                /*
                | Initial status
                */
                'status' => 'pending',

                /*
                | Initial payment status
                */
                'payment_status' => 'pending',

                /*
                | Never trust the frontend price.
                | Always use the current service price.
                */
                'total_price' => $service->price,

                /*
                | Optional customer notes.
                */
                'notes' => $validated['notes'] ?? null,
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | Load Relationships
        |--------------------------------------------------------------------------
        */

        $appointment->load([
            'customer',
            'vehicle',
            'service',
            'technician',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Return 201 Created
        |--------------------------------------------------------------------------
        */

        return (new AppointmentResource($appointment))
            ->response()
            ->setStatusCode(201);
    }


    /**
     * Display a specific appointment.
     */
    public function show(
        Request $request,
        Appointment $appointment
    ) {
        $this->authorizeAppointment(
            $request,
            $appointment
        );

        $appointment->load([
            'customer',
            'vehicle',
            'service',
            'technician',
        ]);

        return new AppointmentResource(
            $appointment
        );
    }


    /**
     * Update an appointment.
     */
    public function update(
        Request $request,
        Appointment $appointment
    ) {
        $this->authorizeAppointment(
            $request,
            $appointment
        );


        /*
        |--------------------------------------------------------------------------
        | Validate Update
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([

            'technicianId' => [
                'sometimes',
                'nullable',
                'string',
                'exists:technicians,id',
            ],

            'assignedTechnician' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'date' => [
                'sometimes',
                'date_format:Y-m-d',
            ],

            'scheduledTime' => [
                'sometimes',
                'date_format:H:i',
            ],

            'paymentStatus' => [
                'sometimes',
                'in:pending,paid,failed,refunded',
            ],

            'notes' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Technician Reassignment
        |--------------------------------------------------------------------------
        */

        if (array_key_exists(
            'technicianId',
            $validated
        )) {

            $technician = $validated['technicianId']
                ? Technician::find(
                    $validated['technicianId']
                )
                : null;


            if (
                $technician
                &&
                $technician->status === 'off_duty'
            ) {
                return response()->json([
                    'error' =>
                        'Selected technician is currently off duty.',
                ], 422);
            }


            $appointment->technician_id =
                $technician?->id;


            $appointment->assigned_technician =
                $technician?->name;
        }


        /*
        |--------------------------------------------------------------------------
        | Determine New Date and Time
        |--------------------------------------------------------------------------
        */

        $newDate = array_key_exists(
            'date',
            $validated
        )
            ? $validated['date']
            : $appointment->date->format('Y-m-d');


        $newTime = array_key_exists(
            'scheduledTime',
            $validated
        )
            ? $validated['scheduledTime']
            : substr(
                $appointment->scheduled_time,
                0,
                5
            );


        /*
        |--------------------------------------------------------------------------
        | Determine Technician
        |--------------------------------------------------------------------------
        */

        $technicianId =
            $appointment->technician_id;


        /*
        |--------------------------------------------------------------------------
        | Duration-Aware Conflict Check
        |--------------------------------------------------------------------------
        */

        if ($technicianId) {

            $service = Service::find(
                $appointment->service_id
            );


            if (! $service) {
                return response()->json([
                    'error' =>
                        'Appointment service could not be found.',
                ], 422);
            }


            /*
            | Calculate requested appointment window.
            */
            $requestedStart = Carbon::createFromFormat(
                'Y-m-d H:i',
                $newDate
                    . ' '
                    . $newTime
            );


            $requestedEnd = $requestedStart->copy()
                ->addMinutes(
                    (int) $service->duration_minutes
                );


            /*
            | Get other appointments for this technician
            | on the requested date.
            */
            $existingAppointments = Appointment::with('service')
                ->where(
                    'technician_id',
                    $technicianId
                )
                ->whereDate(
                    'date',
                    $newDate
                )
                ->where(
                    'id',
                    '!=',
                    $appointment->id
                )
                ->whereNotIn(
                    'status',
                    ['cancelled']
                )
                ->get();


            foreach (
                $existingAppointments
                as $existingAppointment
            ) {

                $existingStart = Carbon::createFromFormat(
                    'Y-m-d H:i',
                    $existingAppointment->date->format('Y-m-d')
                        . ' '
                        . substr(
                            $existingAppointment->scheduled_time,
                            0,
                            5
                        )
                );


                $existingServiceDuration =
                    $existingAppointment
                        ->service
                        ?->duration_minutes
                        ?? 60;


                $existingEnd = $existingStart->copy()
                    ->addMinutes(
                        (int) $existingServiceDuration
                    );


                /*
                | Determine whether the two appointment
                | windows overlap.
                */
                $overlaps =
                    $requestedStart < $existingEnd
                    &&
                    $requestedEnd > $existingStart;


                if ($overlaps) {
                    return response()->json([
                        'error' =>
                            'Technician is already booked during this time.',
                    ], 409);
                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Map Request Fields To Database Fields
        |--------------------------------------------------------------------------
        */

        if (array_key_exists(
            'date',
            $validated
        )) {
            $appointment->date =
                $validated['date'];
        }


        if (array_key_exists(
            'scheduledTime',
            $validated
        )) {
            $appointment->scheduled_time =
                $validated['scheduledTime'];
        }


        if (
            array_key_exists(
                'assignedTechnician',
                $validated
            )
            &&
            ! array_key_exists(
                'technicianId',
                $validated
            )
        ) {
            $appointment->assigned_technician =
                $validated['assignedTechnician'];
        }


        if (array_key_exists(
            'paymentStatus',
            $validated
        )) {
            $appointment->payment_status =
                $validated['paymentStatus'];
        }


        if (array_key_exists(
            'notes',
            $validated
        )) {
            $appointment->notes =
                $validated['notes'];
        }


        /*
        |--------------------------------------------------------------------------
        | Save
        |--------------------------------------------------------------------------
        */

        $appointment->save();


        /*
        |--------------------------------------------------------------------------
        | Reload Relationships
        |--------------------------------------------------------------------------
        */

        $appointment->load([
            'customer',
            'vehicle',
            'service',
            'technician',
        ]);


        return new AppointmentResource(
            $appointment
        );
    }


    /**
     * Update appointment status.
     *
     * Status changes are handled separately from general appointment edits
     * so that the workflow can enforce valid transitions.
     */
    public function updateStatus(
        Request $request,
        Appointment $appointment
    ) {
        $user = $request->user();

        if ($user->role === 'customer') {
            return response()->json([
                'error' => 'Customers cannot change appointment status.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:pending,confirmed,in_progress,completed,cancelled',
            ],
        ]);

        $currentStatus = $appointment->status;
        $newStatus = $validated['status'];

        if ($currentStatus === $newStatus) {
            $appointment->load([
                'customer',
                'vehicle',
                'service',
                'technician',
            ]);

            return new AppointmentResource($appointment);
        }

        $allowedTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['in_progress', 'cancelled'],
            'in_progress' => ['completed'],
            'completed' => [],
            'cancelled' => [],
        ];

        if (! in_array(
            $newStatus,
            $allowedTransitions[$currentStatus] ?? [],
            true
        )) {
            return response()->json([
                'error' => sprintf(
                    'Appointment cannot move from %s to %s.',
                    $currentStatus,
                    $newStatus
                ),
            ], 422);
        }

        $appointment->update([
            'status' => $newStatus,
        ]);

        $appointment->load([
            'customer',
            'vehicle',
            'service',
            'technician',
        ]);

        return new AppointmentResource($appointment);
    }


    /**
     * Cancel/delete an appointment.
     *
     * We keep the appointment for history.
     * DELETE therefore acts as cancellation.
     */
    public function destroy(
        Request $request,
        Appointment $appointment
    ) {
        $this->authorizeAppointment(
            $request,
            $appointment
        );


        $appointment->update([
            'status' => 'cancelled',
        ]);


        return response()->noContent();
    }


    /**
     * Ensure the authenticated customer can only
     * access their own appointments.
     */
    private function authorizeAppointment(
        Request $request,
        Appointment $appointment
    ): void {

        $user = $request->user();


        /*
        | Staff/admin can access appointments.
        */
        if ($user->role !== 'customer') {
            return;
        }


        /*
        | Find the customer profile belonging
        | to the authenticated user.
        */
        $customer = Customer::where(
            'user_id',
            $user->id
        )->first();


        /*
        | Block access to another customer's appointment.
        */
        if (
            ! $customer
            ||
            $appointment->customer_id !== $customer->id
        ) {
            abort(
                403,
                'You are not authorized to access this appointment.'
            );
        }
    }
}