<?php

namespace App\Services;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use RuntimeException;

class CustomerVaultService
{
    /**
     * Generate a unique 256-bit encryption key for a customer.
     */
    public function generateKey(): string
    {
        return base64_encode(random_bytes(32));
    }

    /**
     * Encrypt a customer's unique vault key using the application's
     * master encryption key.
     */
    public function protectKey(string $key): string
    {
        return Crypt::encryptString($key);
    }

    /**
     * Recover the customer's unique vault key.
     */
    public function unprotectKey(string $protectedKey): string
    {
        try {
            return Crypt::decryptString($protectedKey);
        } catch (DecryptException $e) {
            throw new RuntimeException(
                'Unable to decrypt the customer vault key.',
                0,
                $e
            );
        }
    }

    /**
     * Encrypt the existing frontend vault payload using the
     * customer's unique encryption key.
     *
     * The frontend vault structure is preserved.
     */
    public function encrypt(
        ?array $vault,
        string $customerKey
    ): ?array {
        if ($vault === null) {
            return null;
        }

        $key = base64_decode($customerKey, true);

        if ($key === false || strlen($key) !== 32) {
            throw new RuntimeException(
                'Invalid customer vault encryption key.'
            );
        }

        $plaintext = json_encode(
            $vault,
            JSON_THROW_ON_ERROR
        );

        $iv = random_bytes(12);

        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($ciphertext === false) {
            throw new RuntimeException(
                'Unable to encrypt customer vault.'
            );
        }

        return [
            'version' => 2,
            'algorithm' => 'AES-256-GCM',
            'iv' => base64_encode($iv),
            'ciphertext' => base64_encode($ciphertext),
            'tag' => base64_encode($tag),
        ];
    }

    /**
     * Decrypt a server-protected customer vault.
     */
    public function decrypt(
        ?array $vault,
        string $customerKey
    ): ?array {
        if ($vault === null) {
            return null;
        }

        /*
         * Support the original frontend vault format.
         *
         * This allows existing customer records to continue working
         * while they are migrated to the server-protected format.
         */
        if (
            ! isset($vault['version'])
            || (int) $vault['version'] < 2
        ) {
            return $vault;
        }

        if (
            ! isset(
                $vault['iv'],
                $vault['ciphertext'],
                $vault['tag']
            )
        ) {
            throw new RuntimeException(
                'Invalid encrypted customer vault.'
            );
        }

        $key = base64_decode($customerKey, true);

        if ($key === false || strlen($key) !== 32) {
            throw new RuntimeException(
                'Invalid customer vault encryption key.'
            );
        }

        $iv = base64_decode(
            $vault['iv'],
            true
        );

        $ciphertext = base64_decode(
            $vault['ciphertext'],
            true
        );

        $tag = base64_decode(
            $vault['tag'],
            true
        );

        if (
            $iv === false
            || $ciphertext === false
            || $tag === false
        ) {
            throw new RuntimeException(
                'Invalid encrypted customer vault encoding.'
            );
        }

        $plaintext = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            throw new RuntimeException(
                'Unable to decrypt customer vault.'
            );
        }

        return json_decode(
            $plaintext,
            true,
            512,
            JSON_THROW_ON_ERROR
        );
    }
}