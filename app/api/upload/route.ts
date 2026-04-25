import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { data, folder = "quickalert" } = await req.json();

    const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET not set in .env.local" },
        { status: 500 }
      );
    }

    const form = new FormData();
    form.append("file", data);
    form.append("upload_preset", uploadPreset);
    form.append("folder", folder);

    const res    = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
    const result = await res.json();

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });

    return NextResponse.json({
      url:      result.secure_url,
      publicId: result.public_id,
      width:    result.width,
      height:   result.height,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}