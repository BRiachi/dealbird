import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

const authMiddleware = async () => {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");
    return { userId: session.user.id };
};

export const ourFileRouter = {
    productFile: f({
        pdf: { maxFileSize: "32MB" },
        text: { maxFileSize: "32MB" },
        image: { maxFileSize: "32MB" },
        blob: { maxFileSize: "32MB" },
    })
        .middleware(authMiddleware)
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("File upload complete for userId:", metadata.userId, file.url);
            return { uploadedBy: metadata.userId };
        }),

    courseVideo: f({
        video: { maxFileSize: "2GB", maxFileCount: 1 },
    })
        .middleware(authMiddleware)
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Video upload complete for userId:", metadata.userId, file.url);
            return { uploadedBy: metadata.userId };
        }),

    avatar: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
    })
        .middleware(authMiddleware)
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
