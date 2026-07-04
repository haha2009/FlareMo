/**
 * Single-user access password hashing.
 *
 * Format: $s$<base64-salt>$<base64-hash>
 * Algorithm: PBKDF2-HMAC-SHA256, 100_000 iterations.
 *
 * PBKDF2 is a Web Crypto API primitive — no extra dependencies, deterministic across runtimes,
 * and adequate for single-user low-throughput login.
 */

const ITERATIONS = 100_000;
const HASH_BITS = 256;
const SALT_BYTES = 16;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveBits(password: string, salt: Uint8Array, bits: number): Promise<Uint8Array> {
  const passBytes = new TextEncoder().encode(password);
  const key = await crypto.subtle.importKey(
    "raw",
    passBytes.buffer.slice(passBytes.byteOffset, passBytes.byteOffset + passBytes.byteLength) as ArrayBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const saltBuf = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const buffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBuf, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    bits,
  );
  return new Uint8Array(buffer);
}

export async function hashPassword(password: string, email: string): Promise<string> {
  // Mix email into the password (cheap peppering without server-side secret).
  const mixed = `${email.toLowerCase()}:${password}`;
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(mixed, salt, HASH_BITS);
  return `$s$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string, email: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[1] !== "s") return false;
  const saltB64 = parts[2];
  const expectedB64 = parts[3];
  if (!saltB64 || !expectedB64) return false;
  try {
    const salt = base64ToBytes(saltB64);
    const expected = base64ToBytes(expectedB64);
    const mixed = `${email.toLowerCase()}:${password}`;
    const actual = await deriveBits(mixed, salt, expected.length * 8);
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) {
      const a = actual[i] as number;
      const e = expected[i] as number;
      diff |= a ^ e;
    }
    return diff === 0;
  } catch {
    return false;
  }
}
