/**
 * Client-side AES-256-GCM encryption using Web Crypto API
 * Keys NEVER leave the browser
 */

// Derive AES key from passphrase using PBKDF2
export async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 200000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plaintext
export async function encrypt(plaintext, passphrase, salt = 'anonshield_salt') {
  const key = await deriveKey(passphrase, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const cipherArray = new Uint8Array(cipherBuffer);
  const authTag = cipherArray.slice(-16);
  return {
    encryptedData: btoa(String.fromCharCode(...cipherArray)),
    iv: btoa(String.fromCharCode(...iv)),
    authTag: btoa(String.fromCharCode(...authTag))
  };
}

// Decrypt ciphertext
export async function decrypt(encryptedData, iv, passphrase, salt = 'anonshield_salt') {
  const key = await deriveKey(passphrase, salt);
  const cipherArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivArray }, key, cipherArray);
  return new TextDecoder().decode(decryptedBuffer);
}

// Generate SHA-256 hash (for public key hashing)
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random hex string (simulates ED25519 keypair generation)
export function generateKeyPair() {
  const privateKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const publicKey = `ed25519:${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('')}`;
  return { privateKey, publicKey };
}
