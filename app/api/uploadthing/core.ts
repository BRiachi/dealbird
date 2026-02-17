import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
    productFile: f({
        pdf: { maxFileSize: "32MB" },
        text: { maxFileSize: "32MB" },
        image: { maxFileSize: "32MB" },
        blob: { maxFileSize: "32MB" } // generic
    })
        .middleware(async () => {
            const session = await getServerSession(authOptions);
            if (!session) throw new Error("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
