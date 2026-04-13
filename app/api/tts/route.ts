import { NextRequest, NextResponse } from "next/server";

// --- Rate Limiter ---
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitResult(ip: string): { allowed: boolean } {
  const now = Date.now();

  // Clean up expired entries
  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  });

  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear();
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return { allowed: false };
  }

  return { allowed: true };
}

// --- Voice allowlist ---
const ALLOWED_VOICES = ["eve", "ara", "rex", "sal", "leo"] as const;
const DEFAULT_VOICE = "rex";

const ALLOWED_ORIGINS = [
  "https://talka-app.vercel.app",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (process.env.NODE_ENV === "development" && origin.startsWith("http://localhost:")) return true;
  return ALLOWED_ORIGINS.some(allowed => origin === allowed);
}

export async function POST(req: NextRequest) {
  // 1. Origin / Referer check
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!isAllowedOrigin(requestOrigin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Rate limiting
  const ip =
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const { allowed } = getRateLimitResult(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  // 3. Parse body safely
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, voice } = body as { text?: unknown; voice?: unknown };

  // 4. Validate text
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ error: "Text too long (max 500 chars)" }, { status: 400 });
  }

  // 5. Validate voice against allowlist
  const safeVoice =
    typeof voice === "string" && ALLOWED_VOICES.includes(voice as any)
      ? voice
      : DEFAULT_VOICE;

  // 6. Check API key
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TTS service unavailable" },
      { status: 500 }
    );
  }

  // 7. Call xAI TTS
  const res = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice_id: safeVoice,
      language: "en",
    }),
  });

  if (!res.ok) {
    // Consume response but don't leak details to client
    await res.text();
    return NextResponse.json(
      { error: "TTS generation failed" },
      { status: 502 }
    );
  }

  const audioBuffer = await res.arrayBuffer();

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
