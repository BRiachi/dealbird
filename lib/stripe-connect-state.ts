import crypto from "crypto";

/**
 * HMAC-sign the userId so the Stripe Connect callback can verify it wasn't tampered with.
 * Prevents CSRF attacks where an attacker associates their Stripe account with another user.
 */
export function signState(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for state signing");
  const sig = crypto.createHmac("sha256", secret).update(userId).digest("hex").slice(0, 16);
  return `${userId}:${sig}`;
}

export function verifyState(state: string): string | null {
  const [userId, sig] = state.split(":");
  if (!userId || !sig) return null;
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  const expected = crypto.createHmac("sha256", secret).update(userId).digest("hex").slice(0, 16);
  if (sig.length !== expected.length) return null;
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  return userId;
}
