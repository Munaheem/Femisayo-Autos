<?php
namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
class AuthService
{
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => 'customer',
                'password' => $data['password'],
            ]);

            $customer = Customer::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'vehicle_info' => $data['vehicleInfo'] ?? null,
                'total_spent' => 0,
                'loyalty_points' => 0,
                'tier' => 'Silver',
                'encrypted_vault' => null,
            ]);

            $token = $user->createToken(
                'femisayo-autos'
            )->plainTextToken;

            return [
                'user' => $user,
                'customer' => $customer,
                'token' => $token,
            ];
        });
    }

    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Remove old tokens when logging in again.
        $user->tokens()->delete();

        $token = $user->createToken('femisayo-autos')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }
    }
}