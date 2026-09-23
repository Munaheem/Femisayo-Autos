<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CustomerVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Customer;
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
        $this->authorizeStaff($request);

        $customers = $this->customerClass()::with('vehicles')
            ->latest()
            ->get();

        $customers->each(
            fn (Customer $customer) =>
                $this->prepareVaultForResponse($customer)
        );

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
        $this->authorizeStaff($request);

        $validated = $this->validateCustomerData($request);

        $customer = DB::transaction(function () use ($validated) {
            $user = $this->resolveOrCreateCustomerUser($validated);

            $this->ensureUserDoesNotAlreadyHaveCustomer($user);

            $vaultKey = $this->vaultService->generateKey();

            $customer = $this->customerClass()::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'vehicle_info' => $validated['vehicleInfo'] ?? null,
                'encrypted_vault' => $this->encryptIncomingVault(
                    $validated['encryptedVault'] ?? null,
                    $vaultKey
                ),
                'encrypted_vault_key' => $this->vaultService->protectKey(
                    $vaultKey
                ),
            ]);

            return $customer;
        });

        $customer->load('vehicles');

        $this->prepareVaultForResponse($customer);

        return response()->json([
            'message' => 'Customer created successfully.',
            'data' => $customer,
        ], 201);
    }

   
    public function show(
        Request $request,
        Customer $customer
    ): JsonResponse {
        $this->authorizeCustomerAccess($request, $customer);

        $customer->load('vehicles');

        $this->prepareVaultForResponse($customer);

        return response()->json([
            'data' => $customer,
        ]);
    }

    
    public function update(
        Request $request,
        string $customer
    ): JsonResponse {
        $user = $request->user();

        $customerModel = $this->customerClass()::find($customer);

        /*
         * PATCH must remain update-only.
         */
        if (! $customerModel && $request->isMethod('PATCH')) {
            return response()->json([
                'error' => 'Resource not found.',
            ], 404);
        }

        /*
         * PUT upsert.
         */
        if (! $customerModel) {
            $this->authorizeStaff($request);

            $validated = $this->validateCustomerData(
                $request,
                true
            );

            $customerModel = DB::transaction(
                function () use ($validated, $customer) {
                    $user = $this->resolveOrCreateCustomerUser(
                        $validated
                    );

                    $this->ensureUserDoesNotAlreadyHaveCustomer($user);

                    $vaultKey = $this->vaultService->generateKey();

                    return $this->customerClass()::create([
                        'id' => $customer,
                        'user_id' => $user->id,
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
                        'address' => $validated['address'] ?? null,
                        'vehicle_info' =>
                            $validated['vehicleInfo'] ?? null,
                        'encrypted_vault' =>
                            $this->encryptIncomingVault(
                                $validated['encryptedVault'] ?? null,
                                $vaultKey
                            ),
                        'encrypted_vault_key' =>
                            $this->vaultService->protectKey(
                                $vaultKey
                            ),
                    ]);
                }
            );

            $customerModel->load('vehicles');

            $this->prepareVaultForResponse($customerModel);

            return response()->json([
                'message' => 'Customer created successfully.',
                'data' => $customerModel,
            ], 201);
        }

        /*
         * Existing customer.
         *
         * Customers may update only their own record.
         */
        if (
            $user->role === 'customer'
            && (int) $customerModel->user_id !== (int) $user->id
        ) {
            return response()->json([
                'error' => 'You are not authorized to update this customer.',
            ], 403);
        }

        /*
         * Staff may update customer records.
         * Customers may update their own records.
         */
        $validated = $this->validateCustomerData(
            $request,
            false
        );

        /*
         * Customers cannot reassign their record.
         */
        if (
            $user->role === 'customer'
            && array_key_exists('userId', $validated)
            && $validated['userId'] !== null
            && (int) $validated['userId'] !== (int) $user->id
        ) {
            return response()->json([
                'error' => 'You cannot reassign your customer record.',
            ], 403);
        }

        /*
         * Existing customer records cannot be reassigned.
         */
        if (array_key_exists('userId', $validated)) {
            $requestedUserId = $validated['userId'];

            if (
                $requestedUserId !== null
                && (int) $requestedUserId !==
                    (int) $customerModel->user_id
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
        ];

        foreach ($fieldMap as $input => $column) {
            if (array_key_exists($input, $validated)) {
                $mapped[$column] = $validated[$input];
            }
        }

        /*
         * Handle vault updates.
         */
        if (array_key_exists('encryptedVault', $validated)) {
            if ($validated['encryptedVault'] === null) {
                $mapped['encrypted_vault'] = null;
            } else {
                $vaultKey = $this->getOrCreateVaultKey(
                    $customerModel,
                    $mapped
                );

                $mapped['encrypted_vault'] =
                    $this->vaultService->encrypt(
                        $validated['encryptedVault'],
                        $vaultKey
                    );
            }
        }

        $customerModel->update($mapped);

        $customerModel = $customerModel->fresh([
            'vehicles',
        ]);

        $this->prepareVaultForResponse($customerModel);

        return response()->json([
            'message' => 'Customer updated successfully.',
            'data' => $customerModel,
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

        DB::transaction(function () use ($customer) {
            $customer->delete();
        });

        return response()->json(null, 204);
    }

    /**
     * Validate customer input.
     */
    protected function validateCustomerData(
        Request $request,
        bool $creating = false
    ): array {
        $nameRules = $creating
            ? ['required', 'string', 'max:255']
            : ['sometimes', 'string', 'max:255'];

        $emailRules = $creating
            ? ['required', 'email', 'max:255']
            : ['sometimes', 'email', 'max:255'];

        return $request->validate([
            'userId' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'name' => $nameRules,

            'email' => $emailRules,

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
    }

    /**
     * Resolve an existing customer user or create one.
     */
    protected function resolveOrCreateCustomerUser(
        array $validated
    ): User {
        $user = null;

        if (
            array_key_exists('userId', $validated)
            && $validated['userId'] !== null
        ) {
            $user = User::find($validated['userId']);

            if (! $user) {
                throw ValidationException::withMessages([
                    'userId' => [
                        'The selected user does not exist.',
                    ],
                ]);
            }

            if ($user->role !== 'customer') {
                throw ValidationException::withMessages([
                    'userId' => [
                        'The selected user is not a customer.',
                    ],
                ]);
            }

            return $user;
        }

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

            return $existingUser;
        }

        return User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => 'customer',
            'password' => Hash::make(
                Str::random(32)
            ),
        ]);
    }

    /**
     * Ensure one user cannot own multiple customer records.
     */
    protected function ensureUserDoesNotAlreadyHaveCustomer(
        User $user
    ): void {
        $existingCustomer = $this->customerClass()::where(
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
    }

    /**
     * Encrypt the incoming frontend vault.
     */
    protected function encryptIncomingVault(
        ?array $encryptedVault,
        string $vaultKey
    ): ?array {
        if ($encryptedVault === null) {
            return null;
        }

        return $this->vaultService->encrypt(
            $encryptedVault,
            $vaultKey
        );
    }

    /**
     * Get the existing vault key or create one for a legacy customer.
     */
    protected function getOrCreateVaultKey(
        Customer $customer,
        array &$mapped
    ): string {
        if ($customer->encrypted_vault_key) {
            return $this->vaultService->unprotectKey(
                $customer->encrypted_vault_key
            );
        }

        $vaultKey = $this->vaultService->generateKey();

        $mapped['encrypted_vault_key'] =
            $this->vaultService->protectKey(
                $vaultKey
            );

        return $vaultKey;
    }

    /**
     * Authorize staff access.
     */
    protected function authorizeStaff(
        Request $request
    ): void {
        abort_unless(
            in_array(
                $request->user()->role,
                [
                    'admin',
                    'sales',
                    'technician',
                ],
                true
            ),
            403
        );
    }

    /**
     * Authorize access to a specific customer.
     */
    protected function authorizeCustomerAccess(
        Request $request,
        Customer $customer
    ): void {
        $user = $request->user();

        if (
            $user->role === 'customer'
            && (int) $customer->user_id !== (int) $user->id
        ) {
            abort(403, 'You are not authorized to access this customer.');
        }
    }

    /**
     * Convert the server-protected vault back into the
     * original frontend vault format for an authorized response.
     *
     * The server encryption key is NEVER included.
     */
    protected function prepareVaultForResponse(
        Customer $customer
    ): Customer {
        if (
            ! $customer->encrypted_vault
            || ! $customer->encrypted_vault_key
        ) {
            $customer->makeHidden([
                'encrypted_vault_key',
            ]);

            return $customer;
        }

        try {
            $vaultKey = $this->vaultService->unprotectKey(
                $customer->encrypted_vault_key
            );

            $decryptedVault = $this->vaultService->decrypt(
                $customer->encrypted_vault,
                $vaultKey
            );

            $customer->setAttribute(
                'encrypted_vault',
                $decryptedVault
            );
        } catch (\Throwable $e) {
            /*
             * Never expose encryption internals.
             */
            $customer->setAttribute(
                'encrypted_vault',
                null
            );
        }

        $customer->makeHidden([
            'encrypted_vault_key',
        ]);

        return $customer;
    }

    /**
     * Resolve the customer model without requiring the IDE to index the
     * application's model class in this controller.
     */
    protected function customerClass(): string
    {
        return 'App\\Models\\Customer';
    }
}
