/**
 * AES-GCM 256-bit Client-side Web Cryptography Engine
 * Enforces privacy compliance (GDPR/CCPA/PCI-DSS) for sensitive customer records:
 * (Driver's License, Full VIN, Tax ID, and stored billing identifiers)
 */

const MASTER_VAULT_PASSPHRASE = 'APEX-AUTO-SECURE-MASTER-KEY-2025';
const SALT_STRING = 'APEX-AUTO-PRIVACY-SALT-0941';

async function deriveKey(passphrase = MASTER_VAULT_PASSPHRASE): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(SALT_STRING),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export interface SensitiveCustomerPayload {
  fullVin: string;
  driverLicenseNumber: string;
  taxIdOrSSN: string;
  emergencyContact: string;
  paymentToken?: string;
  insurancePolicyNumber?: string;
}

export async function encryptSensitiveData(
  data: SensitiveCustomerPayload,
  customPassphrase?: string
) {
  try {
    const key = await deriveKey(customPassphrase);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encodedData
    );

    const maskedPreview = {
      vinLast4: data.fullVin ? `•••••••••••••${data.fullVin.slice(-4)}` : 'N/A',
      licenseMasked: data.driverLicenseNumber 
        ? `••••${data.driverLicenseNumber.slice(-4)}` 
        : '••••••••',
      taxIdMasked: data.taxIdOrSSN 
        ? `•••-••-${data.taxIdOrSSN.slice(-4)}` 
        : '•••-••-••••'
    };

    return {
      iv: arrayBufferToBase64(iv),
      ciphertext: arrayBufferToBase64(encryptedBuffer),
      algorithm: 'AES-GCM-256',
      maskedPreview
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive customer data');
  }
}

export async function decryptSensitiveData(
  vault: { iv: string; ciphertext: string },
  customPassphrase?: string
): Promise<SensitiveCustomerPayload> {
  try {
    const key = await deriveKey(customPassphrase);
    const iv = new Uint8Array(base64ToArrayBuffer(vault.iv));
    const ciphertext = base64ToArrayBuffer(vault.ciphertext);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      ciphertext
    );

    const decodedString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decodedString) as SensitiveCustomerPayload;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption authorization failed. Invalid security key.');
  }
}
