// app/api/analyze/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Gemini Vision AI — auto-discovers the best available model at runtime.
// No hardcoded model names that can go stale.
//
// Required env var (Vercel → Settings → Environment Variables):
//   GEMINI_API_KEY=AIzaSy...
//
// Get a FREE key at: https://aistudio.google.com/app/apikey
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

// ── Step 1: Ask Google which models are actually available for this key ───────
async function getAvailableFlashModel(apiKey: string): Promise<string | null> {
  try {
    const res  = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (!res.ok) return null;

    const models: string[] = (data.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => (m.name as string).replace("models/", ""));

    // Preference order — newest first
    const preferred = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-001",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-pro-latest",
      "gemini-1.5-pro",
    ];

    for (const p of preferred) {
      if (models.some(m => m === p || m.startsWith(p))) return p;
    }

    // Fall back to any flash model
    const flash = models.find(m => m.includes("flash"));
    if (flash) return flash;

    // Fall back to any model
    return models[0] ?? null;
  } catch {
    return null;
  }
}

// ── Step 2: Call Gemini with the discovered model ─────────────────────────────
async function callGeminiVision(
  apiKey:   string,
  model:    string,
  prompt:   string,
  mimeType: string,
  base64:   string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: prompt },
        ],
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 900 },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text.trim()) throw new Error("Gemini returned an empty response");

  return text;
}

// ── Fallback response when AI is unavailable ──────────────────────────────────
function fallback(reason: string) {
  return {
    verdict:    "UNKNOWN",
    confidence: 60,
    level:      "MEDIUM",
    fake:       false,
    whatISee:   "AI analysis unavailable",
    summary:    "Video received. AI analysis failed — alert forwarded for manual review.",
    checks: {
      imageAnalysis:  { passed: true,  detail: "Frame was captured successfully" },
      gpsConsistency: { passed: true,  detail: "GPS coordinates recorded" },
      patternMatch:   { passed: false, detail: `AI unavailable: ${reason}` },
    },
    _fallbackReason: reason,
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { frameDataUrl, incidentType, gpsLat, gpsLng, gpsAccuracy, notes } = await req.json();

    if (!frameDataUrl) {
      return NextResponse.json({ error: "No video frame provided" }, { status: 400 });
    }

    // ── Check API key ─────────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[analyze] GEMINI_API_KEY is not set");
      return NextResponse.json(
        fallback("GEMINI_API_KEY environment variable is not set on the server")
      );
    }

    // ── Discover the right model ──────────────────────────────────────────
    const model = await getAvailableFlashModel(apiKey);
    if (!model) {
      console.error("[analyze] No usable Gemini model found for this API key");
      return NextResponse.json(
        fallback("No compatible Gemini model found — check your API key at aistudio.google.com")
      );
    }

    console.log(`[analyze] Using model: ${model}`);

    // ── Parse the image data URL ──────────────────────────────────────────
    const mimeMatch = frameDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType  = mimeMatch?.[1] ?? "image/jpeg";
    const base64    = frameDataUrl.replace(/^data:[^;]+;base64,/, "");

    // ── Build the prompt ──────────────────────────────────────────────────
    const gpsText = gpsLat
      ? `${Number(gpsLat).toFixed(5)}° N, ${Number(gpsLng).toFixed(5)}° E (±${gpsAccuracy ?? "?"}m)`
      : "not available";

    const prompt = `You are an emergency verification AI for QuickAlert, a real-time emergency reporting app.

Reported incident type: "${incidentType}"
GPS location: ${gpsText}
Reporter notes: ${notes || "none"}

Look at this image (a frame extracted from a 10-second emergency video) and answer:
Does this image show evidence of "${incidentType}" or any emergency?

Respond ONLY with valid JSON — no markdown, no code fences, no extra text:

{
  "verdict": "YES",
  "confidence": 85,
  "level": "HIGH",
  "fake": false,
  "whatISee": "describe exactly what you see in the image",
  "summary": "1-2 sentence verdict and reasoning",
  "checks": {
    "imageAnalysis": {
      "passed": true,
      "detail": "what you see relevant to the reported incident"
    },
    "gpsConsistency": {
      "passed": ${!!gpsLat},
      "detail": "${gpsLat ? `GPS recorded: ${Number(gpsLat).toFixed(4)}° N, ${Number(gpsLng).toFixed(4)}° E` : "GPS not available"}"
    },
    "patternMatch": {
      "passed": true,
      "detail": "does the visual match the reported type"
    }
  }
}

Rules:
- verdict must be "YES" (emergency visible), "NO" (no emergency), or "UNKNOWN" (unclear)
- confidence: 0-100 integer
- level: "HIGH" if confidence >= 75, "MEDIUM" if 40-74, "LOW" if below 40
- fake: true only if clearly staged or unrelated scene
- If image is dark, blurry, or unclear — say so in whatISee and use UNKNOWN verdict`;

    // ── Call Gemini ───────────────────────────────────────────────────────
    const rawText = await callGeminiVision(apiKey, model, prompt, mimeType, base64);

    // Strip any accidental markdown fences
    const cleaned = rawText
      .replace(/^```json\s*/im, "")
      .replace(/^```\s*/im,    "")
      .replace(/\s*```\s*$/im, "")
      .trim();

    // Find the JSON object even if there's extra text around it
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini response did not contain valid JSON");

    const parsed = JSON.parse(jsonMatch[0]);

    // Normalise fields
    parsed.confidence = Math.min(100, Math.max(0, Math.round(Number(parsed.confidence) || 60)));
    if (!["LOW","MEDIUM","HIGH"].includes(parsed.level)) {
      parsed.level = parsed.confidence >= 75 ? "HIGH" : parsed.confidence >= 40 ? "MEDIUM" : "LOW";
    }
    if (!["YES","NO","UNKNOWN"].includes(parsed.verdict)) {
      parsed.verdict = "UNKNOWN";
    }

    console.log(`[analyze] ✓ verdict=${parsed.verdict} conf=${parsed.confidence} model=${model}`);
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error("[analyze] Error:", err.message);
    return NextResponse.json(fallback(err.message ?? "unknown error"));
  }
}