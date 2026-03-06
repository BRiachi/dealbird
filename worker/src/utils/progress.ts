import { prisma } from "../services/database";

type ScanStatus =
  | "queued"
  | "scraping"
  | "analyzing"
  | "researching"
  | "generating"
  | "completed"
  | "failed";

/**
 * Update a BrandScan's progress in the database.
 * The dashboard polls this to show real-time progress to the creator.
 */
export async function updateProgress(
  scanId: string,
  status: ScanStatus,
  progress: number,
  progressMsg?: string
) {
  await prisma.brandScan.update({
    where: { id: scanId },
    data: {
      status,
      progress,
      progressMsg,
      ...(status === "completed" ? { completedAt: new Date() } : {}),
      ...(status === "scraping" && progress === 0
        ? { startedAt: new Date() }
        : {}),
    },
  });
}

/**
 * Mark a scan as failed with an error message.
 */
export async function markFailed(scanId: string, error: string) {
  await prisma.brandScan.update({
    where: { id: scanId },
    data: {
      status: "failed",
      error,
      completedAt: new Date(),
    },
  });
}
