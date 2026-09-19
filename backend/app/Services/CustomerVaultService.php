<?php

namespace App\Services;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

class CustomerVaultService
{
    /**
     * Encrypt the client-side vault before database storage.
     */
    public function encrypt(?array $vault): ?array
    {
        if ($vault === null) {
            return null;
        }

        return [
            'version' => 1,
            'encrypted' => Crypt::encryptString(
                json_encode($vault, JSON_THROW_ON_ERROR)
            ),
        ];
    }

    /**
     * Decrypt a server-protected vault.
     *
     * Returns null when the vault cannot be decrypted.
     */
    public function decrypt(?array $vault): ?array
    {
        if (
            ! is_array($vault)
            || ! isset($vault['encrypted'])
        ) {
            return $vault;
        }

        try {
            return json_decode(
                Crypt::decryptString($vault['encrypted']),
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        } catch (DecryptException|\JsonException) {
            return null;
        }
    }
}