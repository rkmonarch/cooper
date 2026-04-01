import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED  = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File))
    return NextResponse.json({ error: "file field is required." }, { status: 400 });

  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF are supported." }, { status: 400 });

  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "File must be under 4 MB." }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "cooper-listings", resource_type: "image" },
            (err, res) => {
              if (err || !res) return reject(err ?? new Error("Upload failed."));
              resolve({ secure_url: res.secure_url, public_id: res.public_id });
            },
          )
          .end(buffer);
      },
    );

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (err) {
    console.error("[upload-image]", err);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}
