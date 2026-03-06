import crypto from "crypto";

const WORKER_SECRET = process.env.RAILWAY_WORKER_SECRET || "";

/**
 * Sign a payload with HMAC-SHA256 for secure communication between
 * the Next.js app and the Railway worker.
 */
export function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", WORKER_SECRET)
    .update(payload)
    .digest("hex");
}

/**
 * Verify an incoming request's HMAC signature.
 * Returns true if the signature matches.
 */
export function verifySignature(
  payload: string,
  signature: string
): boolean {
  if (!WORKER_SECRET || WORKER_SECRET.length < 16) {
    console.error("RAILWAY_WORKER_SECRET is not set or too short");
    return false;
  }
  const expected = signPayload(payload);
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}
