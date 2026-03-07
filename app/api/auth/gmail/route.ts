import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGmailAuthUrl, handleGmailCallback, verifyGmailState } from "@/lib/gmail";

/**
 * GET /api/auth/gmail — OAuth callback from Google
 * Receives authorization code and saves tokens to EmailAccount.
 * Verifies HMAC-signed state parameter to prevent CSRF.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?gmail=error&reason=${error}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?gmail=error&reason=missing_params`
    );
  }

  // Verify HMAC-signed state to prevent CSRF
  const userId = verifyGmailState(state);
  if (!userId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?gmail=error&reason=invalid_state`
    );
  }

  try {
    const email = await handleGmailCallback(code, userId);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?gmail=success&email=${encodeURIComponent(email)}`
    );
  } catch (err: any) {
    console.error("Gmail OAuth callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?gmail=error&reason=callback_failed`
    );
  }
}

/**
 * POST /api/auth/gmail — Initiate Gmail OAuth flow
 * Returns the OAuth URL to redirect the user to.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = getGmailAuthUrl(session.user.id);
  return NextResponse.json({ url });
}
