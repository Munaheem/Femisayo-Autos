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
     *
     * Staff can see all appointments.
     * Customers can only see their own appointments.
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
            ->latest('scheduled_date')
            ->latest('scheduled_time');

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

            $query->where(
                'customer_id',
                $customer->id
            );
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
                'nullable',
                'string',
                'exists:technicians,id',
            ],

            'assignedTechnician' => [
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
                'nullable',
                'string',
                'max:5000',
            ],

            'technicianNotes' => [
                'nullable',
                'string',
                'max:5000',
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
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        /*
         * Determine customer.
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
         * Verify vehicle belongs to customer.
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
         * Get active service.
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
         * Validate technician.
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
             * Duration-aware conflict check.
             */
            $requestedStart = Carbon::createFromFormat(
                'Y-m-d H:i',
                $validated['scheduledDate']
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
                    'scheduled_date',
                    $validated['scheduledDate']
                )
                ->whereNotIn(
                    'status',
                    ['cancelled']
                )
                ->get();

            foreach ($existingAppointments as $existingAppointment) {
                $existingStart = Carbon::createFromFormat(
                    'Y-m-d H:i',
                    $existingAppointment->scheduled_date->format('Y-m-d')
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
         * Create appointment atomically.
         *
         * Service price remains server-controlled.
         */
        $appointment = DB::transaction(
            function () use (
                $validated,
                $customer,
                $service,
                $technician
            ) {
                return Appointment::create([
                    'id' => 'apt-' . uniqid(),

                    'customer_id' =>
                        $customer->id,

                    'vehicle_id' =>
                        $validated['vehicleId'],

                    'service_id' =>
                        $service->id,

                    'additional_services' =>
                        $validated['additionalServices']
                        ?? null,

                    'technician_id' =>
                        $technician?->id,

                    'assigned_technician' =>
                        $technician?->name
                        ?? $validated['assignedTechnician']
                        ?? null,

                    'scheduled_date' =>
                        $validated['scheduledDate'],

                    'scheduled_time' =>
                        $validated['scheduledTime'],

                    'status' =>
                        'pending',

                    'payment_status' =>
                        $validated['paymentStatus']
                        ?? 'pending',

                    'customer_notes' =>
                        $validated['customerNotes']
                        ?? null,

                    'technician_notes' =>
                        $validated['technicianNotes']
                        ?? null,

                    'total_cost' =>
                        $service->price,

                    'deposit_amount' =>
                        $validated['depositAmount']
                        ?? 0,

                    'payment_transaction_id' =>
                        $validated['paymentTransactionId']
                        ?? null,
                ]);
            }
        );

        $appointment->load([
            'customer',
            'vehicle',
            'service',
            'technician',
        ]);

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

            'scheduledDate' => [
                'sometimes',
                'date_format:Y-m-d',
            ],

            'scheduledTime' => [
                'sometimes',
                'date_format:H:i',
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

            'customerNotes' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],

            'technicianNotes' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],

            'paymentStatus' => [
                'sometimes',
                'in:pending,deposit_paid,paid,refunded',
            ],

            'depositAmount' => [
                'sometimes',
                'numeric',
                'min:0',
            ],

            'paymentTransactionId' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        /*
         * Technician reassignment.
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
         * Determine new date and time.
         */
        $newDate = array_key_exists(
            'scheduledDate',
            $validated
        )
            ? $validated['scheduledDate']
            : $appointment->scheduled_date->format('Y-m-d');

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
         * Duration-aware conflict check.
         */
        $technicianId =
            $appointment->technician_id;

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

            $existingAppointments = Appointment::with('service')
                ->where(
                    'technician_id',
                    $technicianId
                )
                ->whereDate(
                    'scheduled_date',
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
                    $existingAppointment
                        ->scheduled_date
                        ->format('Y-m-d')
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
         * Map request fields.
         */
        if (array_key_exists(
            'scheduledDate',
            $validated
        )) {
            $appointment->scheduled_date =
                $validated['scheduledDate'];
        }

        if (array_key_exists(
            'scheduledTime',
            $validated
        )) {
            $appointment->scheduled_time =
                $validated['scheduledTime'];
        }

        if (array_key_exists(
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
            'additionalServices',
            $validated
        )) {
            $appointment->additional_services =
                $validated['additionalServices'];
        }

        if (array_key_exists(
            'customerNotes',
            $validated
        )) {
            $appointment->customer_notes =
                $validated['customerNotes'];
        }

        if (array_key_exists(
            'technicianNotes',
            $validated
        )) {
            $appointment->technician_notes =
                $validated['technicianNotes'];
        }

        if (array_key_exists(
            'paymentStatus',
            $validated
        )) {
            $appointment->payment_status =
                $validated['paymentStatus'];
        }

        if (array_key_exists(
            'depositAmount',
            $validated
        )) {
            $appointment->deposit_amount =
                $validated['depositAmount'];
        }

        if (array_key_exists(
            'paymentTransactionId',
            $validated
        )) {
            $appointment->payment_transaction_id =
                $validated['paymentTransactionId'];
        }

        $appointment->save();

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
     */
    public function updateStatus(
        Request $request,
        Appointment $appointment
    ) {
        $user = $request->user();

        if ($user->role === 'customer') {
            return response()->json([
                'error' =>
                    'Customers cannot change appointment status.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:pending,confirmed,in_inspection,in_repair,quality_check,ready_for_pickup,completed,cancelled',
            ],
        ]);

        $currentStatus =
            $appointment->status;

        $newStatus =
            $validated['status'];

        if ($currentStatus === $newStatus) {
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

        /*
         * Appointment workflow.
         */
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

        return new AppointmentResource(
            $appointment
        );
    }

    /**
     * Cancel/delete an appointment.
     *
     * DELETE acts as cancellation so appointment history
     * is preserved.
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
     * Ensure customers can only access their own appointments.
     */
    private function authorizeAppointment(
        Request $request,
        Appointment $appointment
    ): void {
        $user = $request->user();

        /*
         * Staff/admin can access appointments.
         */
        if ($user->role !== 'customer') {
            return;
        }

        $customer = Customer::where(
            'user_id',
            $user->id
        )->first();

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