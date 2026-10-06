import "server-only";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (password: string, salt: Buffer, keylen: number, options?: { N?: number; r?: number; p?: number; maxmem?: number }) => Promise<Buffer>;

/**
 * §190 — session management is not hand-rolled cryptography, but password
 * storage must be explicit: scrypt with per-user salt and constant-time compare.
 * Parameters follow current OWASP guidance for scrypt (N=2^17, r=8, p=1).
 */
const N = 1 << 17;
const R = 8;
const P = 1;
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: 256 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const derived = await scrypt(password, salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 256 * 1024 * 1024,
  });
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/** Minimum policy enforced at registration; surfaced to the user, not silently applied. */
export const PASSWORD_POLICY = {
  minLength: 12,
  describe: "At least 12 characters. Length matters more than symbol variety.",
};

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_POLICY.minLength) return `Password must be at least ${PASSWORD_POLICY.minLength} characters.`;
  if (/^(.)\1+$/.test(password)) return "Password cannot be a single repeated character.";
  return null;
}
