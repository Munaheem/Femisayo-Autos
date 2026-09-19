<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use App\Services\CustomerVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    public function __construct(
        protected CustomerVaultService $vaultService
    ) {
    }

    /**
     * Get all customers.
     *
     * Staff only.
     */
    public function index(Request $request): JsonResponse
    {
        abort_unless(
            in_array(
                $request->user()->role,
                ['admin', 'sales', 'technician'],
                true
            ),
            403
        );

        $customers = Customer::with('vehicles')
            ->latest()
            ->get();

        return response()->json([
            'data' => $customers,
        ]);
    }

    /**
     * Create a customer record.
     *
     * Staff only.
     */
    public function store(Request $request): JsonResponse
    {
        abort_unless(
            in_array(
                $request->user()->role,
                ['admin', 'sales', 'technician'],
                true
            ),
            403
        );

        $validated = $request->validate([
            'userId' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:users,id',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],
            'address' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'vehicleInfo' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'encryptedVault' => [
                'sometimes',
                'nullable',
                'array',
            ],
        ]);

        $customer = DB::transaction(function () use ($validated) {

            $user = null;

            if (isset($validated['userId'])) {
                $user = User::find($validated['userId']);

                if (
                    $user
                    && $user->role !== 'customer'
                ) {
                    throw ValidationException::withMessages([
                        'userId' => [
                            'The selected user is not a customer.',
                        ],
                    ]);
                }
            }

            /*
             * If no user is supplied, create a customer login account.
             */
            if (! $user) {
                $existingUser = User::where(
                    'email',
                    $validated['email']
                )->first();

                if ($existingUser) {
                    if ($existingUser->role !== 'customer') {
                        throw ValidationException::withMessages([
                            'email' => [
                                'A non-customer user already uses this email.',
                            ],
                        ]);
                    }

                    $user = $existingUser;
                } else {
                    $user = User::create([
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'role' => 'customer',
                        'password' => Hash::make(
                            Str::random(32)
                        ),
                    ]);
                }
            }

            /*
             * Prevent duplicate customer records for one user.
             */
            $existingCustomer = Customer::where(
                'user_id',
                $user->id
            )->first();

            if ($existingCustomer) {
                throw ValidationException::withMessages([
                    'userId' => [
                        'A customer record already exists for this user.',
                    ],
                ]);
            }

            return Customer::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'vehicle_info' =>
                    $validated['vehicleInfo'] ?? null,
                'encrypted_vault' =>
                    $validated['encryptedVault'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Customer created successfully.',
            'data' => $customer->fresh(),
        ], 201);
    }

    /**
     * Get a single customer.
     *
     * Customers can only access their own record.
     */
    public function show(
        Request $request,
        Customer $customer
    ): JsonResponse {
        $user = $request->user();

        if (
            $user->role === 'customer'
            && $customer->user_id !== $user->id
        ) {
            return response()->json([
                'error' => 'You are not authorized to access this customer.',
            ], 403);
        }

        return response()->json([
            'data' => $customer->load('vehicles'),
        ]);
    }

    /**
     * Update or upsert a customer record.
     *
     * PUT supports update-or-create.
     * PATCH remains update-only.
     */
    public function update(
        Request $request,
        string $customer
    ): JsonResponse {
        $user = $request->user();

        /*
         * Manually resolve the customer so PUT can create the
         * record when the requested ID does not yet exist.
         */
        $customerModel = Customer::find($customer);

        /*
         * PATCH must remain update-only.
         * If the customer does not exist, return 404.
         */
        if (! $customerModel) {
            if ($request->isMethod('PATCH')) {
                return response()->json([
                    'error' => 'Resource not found.',
                ], 404);
            }

            /*
             * PUT upsert requires enough information to create
             * a customer record.
             */
            $validated = $request->validate([
                'userId' => [
                    'sometimes',
                    'nullable',
                    'integer',
                    'exists:users,id',
                ],
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'email' => [
                    'required',
                    'email',
                    'max:255',
                ],
                'phone' => [
                    'nullable',
                    'string',
                    'max:30',
                ],
                'address' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],
                'vehicleInfo' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],
                'encryptedVault' => [
                    'sometimes',
                    'nullable',
                    'array',
                ],
            ]);

            $customerModel = DB::transaction(
                function () use ($validated, $customer) {
                    $user = null;

                    if (isset($validated['userId'])) {
                        $user = User::find($validated['userId']);

                        if (
                            $user
                            && $user->role !== 'customer'
                        ) {
                            throw ValidationException::withMessages([
                                'userId' => [
                                    'The selected user is not a customer.',
                                ],
                            ]);
                        }
                    }

                    /*
                     * If no user is supplied, find an existing
                     * customer account by email or create one.
                     */
                    if (! $user) {
                        $existingUser = User::where(
                            'email',
                            $validated['email']
                        )->first();

                        if ($existingUser) {
                            if ($existingUser->role !== 'customer') {
                                throw ValidationException::withMessages([
                                    'email' => [
                                        'A non-customer user already uses this email.',
                                    ],
                                ]);
                            }

                            $user = $existingUser;
                        } else {
                            $user = User::create([
                                'name' => $validated['name'],
                                'email' => $validated['email'],
                                'role' => 'customer',
                                'password' => Hash::make(
                                    Str::random(32)
                                ),
                            ]);
                        }
                    }

                    /*
                     * Prevent the same user from being attached
                     * to another customer record.
                     */
                    $existingCustomer = Customer::where(
                        'user_id',
                        $user->id
                    )->first();

                    if ($existingCustomer) {
                        throw ValidationException::withMessages([
                            'userId' => [
                                'A customer record already exists for this user.',
                            ],
                        ]);
                    }

                    return Customer::create([
                        'id' => $customer,
                        'user_id' => $user->id,
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
                        'address' => $validated['address'] ?? null,
                        'vehicle_info' =>
                            $validated['vehicleInfo'] ?? null,
                        'encrypted_vault' =>
                            $validated['encryptedVault'] ?? null,
                    ]);
                }
            );

            return response()->json([
                'message' => 'Customer created successfully.',
                'data' => $customerModel->fresh(),
            ], 201);
        }

        /*
         * Existing customer:
         * enforce ownership for customer accounts.
         */
        if (
            $user->role === 'customer'
            && $customerModel->user_id !== $user->id
        ) {
            abort(403);
        }

        $validated = $request->validate([
            'userId' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:users,id',
            ],
            'name' => [
                'sometimes',
                'string',
                'max:255',
            ],
            'email' => [
                'sometimes',
                'email',
                'max:255',
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:30',
            ],
            'address' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
            'vehicleInfo' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
            'encryptedVault' => [
                'sometimes',
                'nullable',
                'array',
            ],
        ]);

        /*
         * Customers cannot reassign their record to another user.
         */
        if (
            $user->role === 'customer'
            && array_key_exists('userId', $validated)
            && (int) $validated['userId'] !== (int) $user->id
        ) {
            abort(403);
        }

        /*
         * Prevent reassignment of an existing customer record.
         */
        if (array_key_exists('userId', $validated)) {
            $requestedUserId = $validated['userId'];

            if (
                $requestedUserId !== null
                && (int) $requestedUserId !== (int) $customerModel->user_id
            ) {
                throw ValidationException::withMessages([
                    'userId' => [
                        'The customer record cannot be reassigned to another user.',
                    ],
                ]);
            }
        }

        $mapped = [];

        $fieldMap = [
            'name' => 'name',
            'email' => 'email',
            'phone' => 'phone',
            'address' => 'address',
            'vehicleInfo' => 'vehicle_info',
            'encryptedVault' => 'encrypted_vault',
        ];

        foreach ($fieldMap as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $mapped[$column] = $validated[$input];
            }
        }

        $customerModel->update($mapped);

        return response()->json([
            'message' => 'Customer updated successfully.',
            'data' => $customerModel->fresh(),
        ]);
    }

    /**
     * Delete a customer.
     *
     * Administrators only.
     */
    public function destroy(
        Request $request,
        Customer $customer
    ): JsonResponse {
        abort_unless(
            $request->user()->role === 'admin',
            403
        );

        $customer->delete();

        return response()->json(null, 204);
    }
}