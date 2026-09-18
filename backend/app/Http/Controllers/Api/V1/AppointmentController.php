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
use Illuminate\Support\Str;
// use Symfony\Component\HttpFoundation\Response;

class AppointmentController extends Controller
{
    /**
     * GET /api/v1/appointments
     */
    public function index(Request $request)
    {
        $query = Appointment::with([
            'customer',
            'vehicle',
            'service',
            'technician',
        ])
            ->orderByDesc('scheduled_date')
            ->orderByDesc('scheduled_time');

        $user = $request->user();

        if ($user->role === 'customer') {
            $customer = Customer::where('user_id', $user->id)->first();

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer profile not found.',
                ], 404);
            }

            $query->where('customer_id', $customer->id);
        }

        return AppointmentResource::collection($query->get());
    }

    /**
     * POST /api/v1/appointments
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customerId' => [
                'sometimes',
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

            'additionalServices' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'additionalServices.*' => [
                'string',
                'max:255',
            ],

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

            'scheduledDate' => [
                'required',
                'date_format:Y-m-d',
            ],

            'scheduledTime' => [
                'required',
                'date_format:H:i',
            ],

            'customerNotes' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'technicianNotes' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'depositAmount' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'paymentStatus' => [
                'sometimes',
                'in:pending,deposit_paid,paid,refunded',
            ],

            'paymentTransactionId' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $user = $request->user();

        /*
         * Determine the customer.
         */
        if ($user->role === 'customer') {
            $customer = Customer::where('user_id', $user->id)->first();

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer profile not found.',
                ], 404);
            }
        } else {
            if (! isset($validated['customerId'])) {
                return response()->json([
                    'error' => 'customerId is required.',
                ], 422);
            }

            $customer = Customer::find($validated['customerId']);

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer not found.',
                ], 404);
            }
        }

        /*
         * Verify vehicle ownership.
         */
        $vehicle = CustomerVehicle::find($validated['vehicleId']);

        if (
            ! $vehicle ||
            (int) $vehicle->customer_id !== (int) $customer->id
        ) {
            return response()->json([
                'error' => 'The selected vehicle does not belong to this customer.',
            ], 422);
        }

        /*
         * Verify service.
         */
        $service = Service::find($validated['serviceId']);

        if (! $service) {
            return response()->json([
                'error' => 'Service not found.',
            ], 404);
        }

        if (! $service->is_active) {
            return response()->json([
                'error' => 'The selected service is not active.',
            ], 422);
        }

        /*
         * Resolve technician.
         */
        $technician = null;

        if (! empty($validated['technicianId'])) {
            $technician = Technician::find($validated['technicianId']);

            if (! $technician) {
                return response()->json([
                    'error' => 'Technician not found.',
                ], 404);
            }

            if ($technician->status === 'off_duty') {
                return response()->json([
                    'error' => 'The selected technician is off duty.',
                ], 422);
            }
        }

        /*
         * Prevent overlapping technician appointments.
         */
        if ($technician) {
            $conflict = $this->technicianConflict(
                $technician,
                $validated['scheduledDate'],
                $validated['scheduledTime'],
                (int) $service->duration_minutes
            );

            if ($conflict) {
                return response()->json([
                    'error' => $conflict,
                ], 409);
            }
        }

        $appointment = DB::transaction(function () use (
            $validated,
            $customer,
            $vehicle,
            $service,
            $technician
        ) {
            return Appointment::create([
                'id' => 'apt-' . Str::lower(Str::random(12)),

                'customer_id' => $customer->id,
                'vehicle_id' => $vehicle->id,
                'service_id' => $service->id,

                'additional_services' =>
                    $validated['additionalServices'] ?? null,

                'technician_id' =>
                    $technician?->id,

                'assigned_technician' =>
                    $technician?->name
                    ?? ($validated['assignedTechnician'] ?? null),

                'scheduled_date' =>
                    $validated['scheduledDate'],

                'scheduled_time' =>
                    $validated['scheduledTime'],

                'status' => 'pending',

                'payment_status' =>
                    $validated['paymentStatus'] ?? 'pending',

                'customer_notes' =>
                    $validated['customerNotes'] ?? null,

                'technician_notes' =>
                    $validated['technicianNotes'] ?? null,

                /*
                 * Always use the server-side service price.
                 */
                'total_cost' => $service->price,

                'deposit_amount' =>
                    $validated['depositAmount'] ?? 0,

                'payment_transaction_id' =>
                    $validated['paymentTransactionId'] ?? null,
            ]);
        });

        $appointment->load([
            'customer',
            'vehicle',
            'service',
            'technician',
        ]);

        return response()->json(
            new AppointmentResource($appointment),
            201
        );
    }

    /**
     * GET /api/v1/appointments/{appointment}
     */
    public function show(
        Request $request,
        Appointment $appointment
    ) {
        $this->authorizeAppointment($request, $appointment);

        $appointment->load([
            'customer',
            'vehicle',
            'service',
            'technician',
        ]);

        return new AppointmentResource($appointment);
    }

    /**
     * PUT/PATCH /api/v1/appointments/{appointment}
     *
     * PUT supports create-or-replace/upsert.
     */
    public function update(
        Request $request,
        string $appointment
    ) {
        $existingAppointment = Appointment::find($appointment);

        /*
         * PATCH requires an existing resource.
         * PUT can create the supplied ID.
         */
        if (
            ! $existingAppointment &&
            $request->isMethod('PATCH')
        ) {
            return response()->json([
                'error' => 'Resource not found.',
            ], 404);
        }

        $user = $request->user();

        /*
         * Existing appointments must be authorized.
         */
        if ($existingAppointment) {
            $this->authorizeAppointment(
                $request,
                $existingAppointment
            );
        }

        $validated = $request->validate([
            'customerId' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:customers,id',
            ],

            'vehicleId' => [
                'sometimes',
                'integer',
                'exists:customer_vehicles,id',
            ],

            'serviceId' => [
                'sometimes',
                'string',
                'exists:services,id',
            ],

            'additionalServices' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'additionalServices.*' => [
                'string',
                'max:255',
            ],

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

            'scheduledDate' => [
                'sometimes',
                'required',
                'date_format:Y-m-d',
            ],

            'scheduledTime' => [
                'sometimes',
                'required',
                'date_format:H:i',
            ],

            'status' => [
                'sometimes',
                'in:pending,confirmed,in_inspection,in_repair,quality_check,ready_for_pickup,completed,cancelled',
            ],

            'customerNotes' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'technicianNotes' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'totalCost' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'depositAmount' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'paymentStatus' => [
                'sometimes',
                'in:pending,deposit_paid,paid,refunded',
            ],

            'paymentTransactionId' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        /*
         * Resolve customer.
         */
        if ($existingAppointment) {
            $customer = $existingAppointment->customer;
        } elseif ($user->role === 'customer') {
            $customer = Customer::where(
                'user_id',
                $user->id
            )->first();

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer profile not found.',
                ], 404);
            }

            if (
                isset($validated['customerId']) &&
                (int) $validated['customerId'] !== (int) $customer->id
            ) {
                return response()->json([
                    'error' => 'You are not authorized to use this customerId.',
                ], 403);
            }
        } else {
            if (! isset($validated['customerId'])) {
                return response()->json([
                    'error' => 'customerId is required.',
                ], 422);
            }

            $customer = Customer::find(
                $validated['customerId']
            );

            if (! $customer) {
                return response()->json([
                    'error' => 'Customer not found.',
                ], 404);
            }
        }

        /*
         * Existing customer appointments cannot be reassigned
         * to another customer.
         */
        if (
            $existingAppointment &&
            isset($validated['customerId']) &&
            (int) $validated['customerId'] !== (int) $customer->id
        ) {
            return response()->json([
                'error' => 'You cannot change the appointment customer.',
            ], 403);
        }

        /*
         * Resolve vehicle.
         */
        $vehicleId =
            $validated['vehicleId']
            ?? $existingAppointment?->vehicle_id;

        if (! $vehicleId) {
            return response()->json([
                'error' => 'vehicleId is required.',
            ], 422);
        }

        $vehicle = CustomerVehicle::find($vehicleId);

        if (! $vehicle) {
            return response()->json([
                'error' => 'Vehicle not found.',
            ], 404);
        }

        if (
            (int) $vehicle->customer_id !==
            (int) $customer->id
        ) {
            return response()->json([
                'error' => 'The selected vehicle does not belong to this customer.',
            ], 422);
        }

        /*
         * Resolve service.
         */
        $serviceId =
            $validated['serviceId']
            ?? $existingAppointment?->service_id;

        if (! $serviceId) {
            return response()->json([
                'error' => 'serviceId is required.',
            ], 422);
        }

        $service = Service::find($serviceId);

        if (! $service) {
            return response()->json([
                'error' => 'Service not found.',
            ], 404);
        }

        if (! $service->is_active) {
            return response()->json([
                'error' => 'The selected service is not active.',
            ], 422);
        }

        /*
         * Resolve technician.
         */
        $technicianId = array_key_exists(
            'technicianId',
            $validated
        )
            ? $validated['technicianId']
            : $existingAppointment?->technician_id;

        $technician = null;

        if ($technicianId) {
            $technician = Technician::find($technicianId);

            if (! $technician) {
                return response()->json([
                    'error' => 'Technician not found.',
                ], 404);
            }

            if ($technician->status === 'off_duty') {
                return response()->json([
                    'error' => 'The selected technician is off duty.',
                ], 422);
            }
        }

        /*
         * Resolve date/time.
         */
        $scheduledDate =
            $validated['scheduledDate']
            ?? $existingAppointment?->scheduled_date?->format('Y-m-d');

        $scheduledTime =
            $validated['scheduledTime']
            ?? (
                $existingAppointment?->scheduled_time
                    ? substr(
                        $existingAppointment->scheduled_time,
                        0,
                        5
                    )
                    : null
            );

        if (! $scheduledDate || ! $scheduledTime) {
            return response()->json([
                'error' => 'scheduledDate and scheduledTime are required.',
            ], 422);
        }

        /*
         * Check technician conflicts.
         */
        if ($technician) {
            $conflict = $this->technicianConflict(
                $technician,
                $scheduledDate,
                $scheduledTime,
                (int) $service->duration_minutes,
                $existingAppointment?->id
            );

            if ($conflict) {
                return response()->json([
                    'error' => $conflict,
                ], 409);
            }
        }

        /*
         * Customers can edit their own appointment details,
         * but cannot alter staff-controlled workflow/payment fields.
         */
        if ($user->role === 'customer') {
            unset(
                $validated['customerId'],
                $validated['technicianId'],
                $validated['assignedTechnician'],
                $validated['technicianNotes'],
                $validated['status'],
                $validated['totalCost'],
                $validated['paymentStatus'],
                $validated['paymentTransactionId'],
                $validated['depositAmount']
            );

            $technicianId =
                $existingAppointment?->technician_id;

            $technician =
                $existingAppointment?->technician;
        }

        /*
         * Build trusted database payload.
         */
        $data = [
            'customer_id' => $customer->id,
            'vehicle_id' => $vehicle->id,
            'service_id' => $service->id,

            'scheduled_date' => $scheduledDate,
            'scheduled_time' => $scheduledTime,

            /*
             * Never trust totalCost sent by the frontend.
             */
            'total_cost' => $service->price,
        ];

        if (array_key_exists(
            'additionalServices',
            $validated
        )) {
            $data['additional_services'] =
                $validated['additionalServices'];
        }

        if ($user->role !== 'customer') {
            if (array_key_exists(
                'technicianId',
                $validated
            )) {
                $data['technician_id'] =
                    $technician?->id;

                $data['assigned_technician'] =
                    $technician?->name
                    ?? ($validated['assignedTechnician'] ?? null);
            } elseif (
                array_key_exists(
                    'assignedTechnician',
                    $validated
                )
            ) {
                $data['assigned_technician'] =
                    $validated['assignedTechnician'];
            }

            if (array_key_exists(
                'status',
                $validated
            )) {
                $data['status'] =
                    $validated['status'];
            }

            if (array_key_exists(
                'technicianNotes',
                $validated
            )) {
                $data['technician_notes'] =
                    $validated['technicianNotes'];
            }

            if (array_key_exists(
                'paymentStatus',
                $validated
            )) {
                $data['payment_status'] =
                    $validated['paymentStatus'];
            }

            if (array_key_exists(
                'depositAmount',
                $validated
            )) {
                $data['deposit_amount'] =
                    $validated['depositAmount'];
            }

            if (array_key_exists(
                'paymentTransactionId',
                $validated
            )) {
                $data['payment_transaction_id'] =
                    $validated['paymentTransactionId'];
            }
        }

        if (array_key_exists(
            'customerNotes',
            $validated
        )) {
            $data['customer_notes'] =
                $validated['customerNotes'];
        }

        /*
         * Existing appointment → update.
         */
        if ($existingAppointment) {
            $existingAppointment->update($data);

            $appointmentModel =
                $existingAppointment->fresh();

            $statusCode = 200;
        } else {
            /*
             * Missing PUT appointment → create using the
             * exact ID supplied by the frontend.
             */
            $appointmentModel = Appointment::create(
                array_merge(
                    [
                        'id' => $appointment,
                    ],
                    $data,
                    [
                        'status' =>
                            $data['status'] ?? 'pending',

                        'payment_status' =>
                            $data['payment_status'] ?? 'pending',

                        'deposit_amount' =>
                            $data['deposit_amount'] ?? 0,
                    ]
                )
            );

            $statusCode = 201;
        }

        $appointmentModel->load([
            'customer',
            'vehicle',
            'service',
            'technician',
        ]);

        return response()->json(
            new AppointmentResource($appointmentModel),
            $statusCode
        );
    }

    /**
     * PATCH /api/v1/appointments/{appointment}/status
     */
    public function updateStatus(
        Request $request,
        Appointment $appointment
    ) {
        $this->authorizeAppointment(
            $request,
            $appointment
        );

        if ($request->user()->role === 'customer') {
            return response()->json([
                'error' => 'Customers cannot change appointment status.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:pending,confirmed,in_inspection,in_repair,quality_check,ready_for_pickup,completed,cancelled',
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
            'pending' => [
                'confirmed',
                'cancelled',
            ],

            'confirmed' => [
                'in_inspection',
                'cancelled',
            ],

            'in_inspection' => [
                'in_repair',
                'quality_check',
                'cancelled',
            ],

            'in_repair' => [
                'quality_check',
                'cancelled',
            ],

            'quality_check' => [
                'ready_for_pickup',
                'in_repair',
                'cancelled',
            ],

            'ready_for_pickup' => [
                'completed',
                'cancelled',
            ],

            'completed' => [],

            'cancelled' => [],
        ];

        if (
            ! in_array(
                $newStatus,
                $allowedTransitions[$currentStatus] ?? [],
                true
            )
        ) {
            return response()->json([
                'error' =>
                    "Invalid appointment status transition from {$currentStatus} to {$newStatus}.",
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

        return new AppointmentResource(
            $appointment->fresh()
        );
    }

    /**
     * DELETE /api/v1/appointments/{appointment}
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
     * Check technician schedule for overlapping appointments.
     *
     * Returns the conflict message or null when available.
     */
    private function technicianConflict(
        Technician $technician,
        string $scheduledDate,
        string $scheduledTime,
        int $durationMinutes,
        ?string $ignoreAppointmentId = null
    ): ?string {
        $requestedStart = Carbon::createFromFormat(
            'Y-m-d H:i',
            "{$scheduledDate} {$scheduledTime}"
        );

        $requestedEnd = $requestedStart->copy()
            ->addMinutes($durationMinutes);

        $appointments = Appointment::query()
            ->where(
                'technician_id',
                $technician->id
            )
            ->where(
                'scheduled_date',
                $scheduledDate
            )
            ->whereNotIn(
                'status',
                ['cancelled']
            )
            ->when(
                $ignoreAppointmentId,
                fn ($query) =>
                    $query->where(
                        'id',
                        '!=',
                        $ignoreAppointmentId
                    )
            )
            ->get([
                'id',
                'scheduled_time',
                'service_id',
            ]);

        foreach ($appointments as $existing) {
            $existingService =
                Service::find($existing->service_id);

            $existingDuration =
                $existingService?->duration_minutes ?? 60;

            $existingStart = Carbon::createFromFormat(
                'Y-m-d H:i',
                "{$scheduledDate} " .
                substr(
                    $existing->scheduled_time,
                    0,
                    5
                )
            );

            $existingEnd = $existingStart->copy()
                ->addMinutes($existingDuration);

            $overlap =
                $requestedStart < $existingEnd &&
                $requestedEnd > $existingStart;

            if ($overlap) {
                return 'The selected technician is already booked during this time.';
            }
        }

        return null;
    }

    /**
     * Authorize access to an appointment.
     */
    private function authorizeAppointment(
        Request $request,
        Appointment $appointment
    ): void {
        $user = $request->user();

        /*
         * Staff roles can access appointments.
         */
        if (
            in_array(
                $user->role,
                ['admin', 'sales', 'technician'],
                true
            )
        ) {
            return;
        }

        /*
         * Customers can only access their own appointments.
         */
        if ($user->role === 'customer') {
            $customer = Customer::where(
                'user_id',
                $user->id
            )->first();

            if (
                ! $customer ||
                (int) $appointment->customer_id !==
                (int) $customer->id
            ) {
                abort(
                    403,
                    'You are not authorized to access this appointment.'
                );
            }

            return;
        }

        abort(
            403,
            'You are not authorized to access this appointment.'
        );
    }

}