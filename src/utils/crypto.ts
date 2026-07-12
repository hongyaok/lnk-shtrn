/**
 * Cryptography utilities for Encrypted Burn Notes.
 * Uses Web Crypto API (crypto.subtle) for zero-knowledge AES-GCM encryption.
 */

const SALT_STRING = "lnk-shrtn-salt"; // A static salt is fine here since it's combined with a high-entropy URL payload
const ITERATIONS = 100000;

function getSalt(): Uint8Array {
  return new TextEncoder().encode(SALT_STRING);
}

async function deriveKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password) as any,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: getSalt() as any,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptNote(text: string, password: string): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
  const key = await deriveKey(password);
  const ivArray = new Uint8Array(12);
  const iv = crypto.getRandomValues(ivArray as any) as Uint8Array;
  const encoder = new TextEncoder();
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    key,
    encoder.encode(text) as any
  );

  return {
    iv,
    ciphertext: new Uint8Array(encryptedBuffer)
  };
}

export async function decryptNote(iv: Uint8Array, ciphertext: Uint8Array, password: string): Promise<string | null> {
  try {
    const key = await deriveKey(password);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      ciphertext as any
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    // Expected to fail if the password is wrong
    return null;
  }
}
