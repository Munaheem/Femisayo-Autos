<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CustomerGarageTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_view_own_garage_without_encrypted_vault(): void
    {
        $user = User::create([
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'role' => 'customer',
            'password' => 'password',
        ]);

        $customerId = DB::table('customers')->insertGetId([
            'user_id' => $user->id,
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'phone' => '08000000000',
            'address' => 'Test Address',
            'vehicle_info' => '2024 Toyota Camry',
            'total_spent' => 0,
            'loyalty_points' => 0,
            'tier' => 'Silver',
            'encrypted_vault' => json_encode([
                'version' => 2,
                'algorithm' => 'AES-256-GCM',
                'iv' => base64_encode(random_bytes(12)),
                'ciphertext' => base64_encode(random_bytes(32)),
                'tag' => base64_encode(random_bytes(16)),
            ]),
            'encrypted_vault_key' => 'server-side-secret-key',
        ]);

        $response = $this
            ->actingAs($user, 'sanctum')
            ->getJson("/api/v1/customers/{$customerId}/garage");

        $response
            ->assertOk()
            ->assertJsonPath('data.customer.id', $customerId)
            ->assertJsonPath('data.customer.name', 'Test Customer')
            ->assertJsonMissingPath('data.customer.encrypted_vault')
            ->assertJsonMissingPath('data.customer.encrypted_vault_key');
    }

    public function test_customer_cannot_view_another_customers_garage(): void
    {
        $user = User::create([
            'name' => 'Customer One',
            'email' => 'customer1@test.com',
            'role' => 'customer',
            'password' => 'password',
        ]);

        $otherUser = User::create([
            'name' => 'Customer Two',
            'email' => 'customer2@test.com',
            'role' => 'customer',
            'password' => 'password',
        ]);

        $customerId = DB::table('customers')->insertGetId([
            'user_id' => $otherUser->id,
            'name' => 'Customer Two',
            'email' => 'customer2@test.com',
            'phone' => '08000000001',
            'address' => 'Test Address',
            'vehicle_info' => '2023 Honda Accord',
            'total_spent' => 0,
            'loyalty_points' => 0,
            'tier' => 'Silver',
        ]);

        $response = $this
            ->actingAs($user, 'sanctum')
            ->getJson("/api/v1/customers/{$customerId}/garage");

        $response
            ->assertForbidden()
             ->assertJson([
                'error' => 'You are not authorized to access this garage.',
            ]);
    }
}