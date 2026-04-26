// app/api/upload/route.ts
// .env.local:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
//   CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset   (must allow video)

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { data, resourceType = "video", folder = "quickalert" } = await req.json();

    const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET not set in .env.local" },
        { status: 500 }
      );
    }

    const form = new FormData();
    form.append("file", data);               // base64 data URI  or  blob URL
    form.append("upload_preset", uploadPreset);
    form.append("folder", folder);

    // resource_type must be "video" for video files
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const res    = await fetch(endpoint, { method: "POST", body: form });
    const result = await res.json();

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });

    return NextResponse.json({
      url:          result.secure_url,
      publicId:     result.public_id,
      duration:     result.duration,    // seconds (video only)
      width:        result.width,
      height:       result.height,
      resourceType: result.resource_type,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}