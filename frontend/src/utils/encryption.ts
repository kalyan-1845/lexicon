/**
 * Web Crypto API client-side PBKDF2 + AES-GCM encryption/decryption utilities
 */

// Helper to convert a string to an array buffer
function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer;
}

// Helper to convert an array buffer to a string
function bufferToString(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

// Helper to convert byte array to Base64
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to byte array
function base64ToBytes(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives an AES-GCM crypto key from a passphrase and salt
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    stringToBuffer(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a string using PBKDF2 + AES-GCM with a user passphrase
 * Output format: Base64(salt [16 bytes] + iv [12 bytes] + ciphertext)
 */
export async function encryptText(plainText: string, passphrase: string): Promise<string> {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv.buffer as ArrayBuffer,
      },
      key,
      stringToBuffer(plainText)
    );

    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(salt.length + iv.length + encryptedBytes.length);

    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedBytes, salt.length + iv.length);

    return bytesToBase64(combined);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Decrypts a base64 encoded string using a user passphrase
 */
export async function decryptText(encryptedBase64: string, passphrase: string): Promise<string> {
  try {
    const combined = base64ToBytes(encryptedBase64);
    
    if (combined.length < 28) {
      throw new Error("Invalid encrypted payload size");
    }

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const key = await deriveKey(passphrase, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv.buffer as ArrayBuffer,
      },
      key,
      ciphertext.buffer as ArrayBuffer
    );

    return bufferToString(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Decryption failed. Please check your passphrase.");
  }
}
