import ImageKit from "imagekit";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_API_KEY;
const privateKey = process.env.NEXT_PRIVATE_IMAGEKIT_API_KEY;
const urlEndpoint = process.env.URL_ENDPOINT_IMAGEKIT;

const imagekit =
  publicKey && privateKey && urlEndpoint
    ? new ImageKit({ publicKey, privateKey, urlEndpoint })
    : null;

// Max file size: 5 MB decoded
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Allowed MIME types for upload
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

export async function POST(req: NextRequest) {
  try {
    // 2.3 — Auth guard: require a valid Clerk session
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!imagekit) {
      return NextResponse.json(
        { error: "ImageKit is not configured on server." },
        { status: 500 }
      );
    }

    const { file, fileName } = await req.json();

    if (!file || !fileName) {
      return NextResponse.json(
        { error: "Missing file or fileName." },
        { status: 400 }
      );
    }

    // 2.9 — Server-side file type validation from base64 data URI
    // Expected format: "data:<mime>;base64,<data>"
    const mimeMatch = (file as string).match(/^data:([^;]+);base64,/);
    if (!mimeMatch) {
      return NextResponse.json(
        { error: "Invalid file format. Must be a base64 data URI." },
        { status: 400 }
      );
    }

    const mimeType = mimeMatch[1];
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: `File type "${mimeType}" is not allowed. Only images are accepted.` },
        { status: 415 }
      );
    }

    // 2.9 — Server-side file size validation
    // base64 encoded size ≈ actual size * 4/3
    const base64Data = (file as string).split(",")[1] ?? "";
    const estimatedBytes = Math.ceil((base64Data.length * 3) / 4);
    if (estimatedBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 5 MB size limit." },
        { status: 413 }
      );
    }

    const result = await imagekit.upload({
      file,
      fileName: `${user.id}/${fileName}`, // scope uploads per user
      isPublished: true,
    });

    return NextResponse.json(
      { url: result.url, fileId: result.fileId, name: result.name },
      { status: 200 }
    );
  } catch (error) {
    console.error("ImageKit upload failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
