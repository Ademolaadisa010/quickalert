import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // allow up to 60s for large video uploads

export async function POST(req: NextRequest) {
  try {
    const { data, resourceType = "video", folder = "quickalert/videos" } = await req.json();

    if (!data) {
      return NextResponse.json({ error: "No file data provided" }, { status: 400 });
    }

    const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        {
          error:
            "Missing environment variables. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and " +
            "CLOUDINARY_UPLOAD_PRESET to .env.local",
        },
        { status: 500 }
      );
    }

    const form = new FormData();
    // form.append("file", data);       
    const cleanedData = data.replace(/;codecs=[^;]+/, "");
    form.append("file", cleanedData);
    form.append("upload_preset", uploadPreset);
    form.append("folder", folder);
    // Optional: tag every upload so you can find them in the Cloudinary dashboard
    form.append("tags", "quickalert,emergency");

    // resource_type must be "video" for .webm / .mp4 files
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const res = await fetch(endpoint, {
      method: "POST",
      body: form,
    });

    const result = await res.json();

    if (result.error) {
      console.error("[Cloudinary error]", result.error);
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({
      url:          result.secure_url,
      publicId:     result.public_id,
      duration:     result.duration   ?? null,   // seconds — video only
      width:        result.width      ?? null,
      height:       result.height     ?? null,
      resourceType: result.resource_type,
    });
  } catch (e: any) {
    console.error("[Upload route error]", e);
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 });
  }
}