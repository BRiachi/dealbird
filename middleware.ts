
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check for 'ref' query param (referral handle)
  const ref = request.nextUrl.searchParams.get("ref");

  if (ref) {
    // Set a cookie that expires in 30 days
    // This allows attribution even if user navigates away and comes back
    response.cookies.set("dealbird_affiliate", ref, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      httpOnly: true, // Secure, not accessible via JS
      sameSite: "lax"
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
