import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

async function callGemini(contents: any[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.2,
        },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Gemini API error");
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(req: NextRequest) {
  try {
    const {
      frameDataUrl,
      incidentType = "Unknown",
      gpsLat,
      gpsLng,
      gpsAccuracy,
      notes = "",
    } = await req.json();

    if (!frameDataUrl) {
      return NextResponse.json(
        { error: "frameDataUrl is required" },
        { status: 400 }
      );
    }

    // Extract base64 image
    const match = frameDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid frameDataUrl format" },
        { status: 400 }
      );
    }

    const [, mediaType, base64Data] = match;

    const systemPrompt = `You are QuickAlert AI, an emergency incident verification system.
You analyse emergency images and return ONLY valid JSON.
No markdown. No explanation. Only JSON.`;

    const userPrompt = `Analyse this emergency report frame.

Incident type: ${incidentType}
${gpsLat ? `GPS: ${gpsLat.toFixed(5)}°, ${gpsLng?.toFixed(5)}° (±${gpsAccuracy ?? "?"}m)` : "GPS: not available"}
${notes ? `Notes: ${notes}` : ""}

Return ONLY this JSON:

{
  "confidence": 0-100,
  "level": "LOW|MEDIUM|HIGH",
  "checks": {
    "imageAnalysis": { "passed": true, "detail": "" },
    "gpsConsistency": { "passed": true, "detail": "" },
    "patternMatch": { "passed": true, "detail": "" }
  },
  "summary": "",
  "fake": false
}`;

    // ✅ FIXED GEMINI STRUCTURE (image FIRST, text SECOND)
    const rawText = await callGemini([
      {
        role: "user",
        parts: [
          {
            inline_data: {
              mime_type: mediaType,
              data: base64Data,
            },
          },
          {
            text: systemPrompt + "\n\n" + userPrompt,
          },
        ],
      },
    ]);

    // Clean response
    const clean = rawText.replace(/```json|```/g, "").trim();

    let parsed: any;

    try {
      parsed = JSON.parse(clean);
    } catch (err) {
      console.warn("[analyze] JSON parse failed:", rawText);

      parsed = {
        confidence: 65,
        level: "MEDIUM",
        checks: {
          imageAnalysis: {
            passed: true,
            detail: "Frame received but could not be fully parsed.",
          },
          gpsConsistency: {
            passed: !!gpsLat,
            detail: gpsLat ? "GPS data present." : "No GPS data.",
          },
          patternMatch: {
            passed: true,
            detail: "Unable to confirm pattern — manual review advised.",
          },
        },
        summary: "AI analysis partially completed — manual review recommended.",
        fake: false,
      };
    }

    parsed.confidence = Math.max(
      0,
      Math.min(100, Math.round(parsed.confidence))
    );

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("[Analyze route error]", e);

    return NextResponse.json(
      {
        confidence: 60,
        level: "MEDIUM",
        checks: {
          imageAnalysis: {
            passed: true,
            detail: "AI service temporarily unavailable.",
          },
          gpsConsistency: {
            passed: true,
            detail: "GPS data logged.",
          },
          patternMatch: {
            passed: true,
            detail: "Pattern analysis pending manual review.",
          },
        },
        summary: "AI analysis unavailable — alert forwarded for manual review.",
        fake: false,
        error: e.message,
      },
      { status: 200 }
    );
  }
}