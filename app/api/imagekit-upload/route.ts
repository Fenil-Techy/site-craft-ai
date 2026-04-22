import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_API_KEY;
const privateKey = process.env.NEXT_PRIVATE_IMAGEKIT_API_KEY;
const urlEndpoint = process.env.URL_ENDPOINT_IMAGEKIT;

const imagekit =
  publicKey && privateKey && urlEndpoint
    ? new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
      })
    : null;

export async function POST(req: NextRequest) {
  try {
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

    const result = await imagekit.upload({
      file,
      fileName,
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
