import crypto from "crypto";

/**
 * HMAC-sign the userId so the Stripe Connect callback can verify it wasn't tampered with.
 * Prevents CSRF attacks where an attacker associates their Stripe account with another user.
 */
export function signState(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "fallback";
  const sig = crypto.createHmac("sha256", secret).update(userId).digest("hex").slice(0, 16);
  return `${userId}:${sig}`;
}

export function verifyState(state: string): string | null {
  const [userId, sig] = state.split(":");
  if (!userId || !sig) return null;
  const secret = process.env.NEXTAUTH_SECRET || "fallback";
  const expected = crypto.createHmac("sha256", secret).update(userId).digest("hex").slice(0, 16);
  if (sig !== expected) return null;
  return userId;
}
