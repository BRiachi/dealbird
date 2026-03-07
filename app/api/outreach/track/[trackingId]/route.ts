import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

/**
 * GET /api/outreach/track/[trackingId] — Open tracking pixel
 * Returns a 1x1 transparent GIF and records the open.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  // Record the open asynchronously (don't block the response)
  prisma.outreachEmail
    .update({
      where: { trackingId: params.trackingId },
      data: {
        openCount: { increment: 1 },
        openedAt: new Date(),
        status: "opened",
      },
    })
    .then(async (email) => {
      // Update campaign open count
      await prisma.outreachCampaign.update({
        where: { id: email.campaignId },
        data: { openCount: { increment: 1 } },
      });
    })
    .catch(() => {
      // Silently ignore — tracking ID might not exist
    });

  return new NextResponse(TRACKING_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
