import { NextRequest, NextResponse } from "next/server";

// --- Rate Limiter ---
const RATE_LIMIT = 60;
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

// --- Allowed languages ---
const ALLOWED_LANGS: Record<string, string> = {
  "pt-BR": "Brazilian Portuguese",
  es: "Spanish",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  fr: "French",
  de: "German",
  it: "Italian",
  tr: "Turkish",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
  th: "Thai",
  vi: "Vietnamese",
  pl: "Polish",
  nl: "Dutch",
};

const ALLOWED_ORIGINS = [
  "https://talka-app.vercel.app",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (process.env.NODE_ENV === "development" && origin.startsWith("http://localhost:")) return true;
  return ALLOWED_ORIGINS.some(allowed => origin === allowed);
}

const MAX_TEXT_LENGTH = 1000;

export async function POST(req: NextRequest) {
  try {
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

    const { text, targetLang, context } = body as {
      text?: unknown;
      targetLang?: unknown;
      context?: unknown;
    };

    // 4. Validate text
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `text must be ${MAX_TEXT_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // 5. Validate targetLang
    if (!targetLang || typeof targetLang !== "string") {
      return NextResponse.json(
        { error: "targetLang is required" },
        { status: 400 }
      );
    }

    const languageName = ALLOWED_LANGS[targetLang];
    if (!languageName) {
      return NextResponse.json(
        { error: "Unsupported target language" },
        { status: 400 }
      );
    }

    // 6. Validate context (optional)
    const validContexts = ["definition", "example", "grammar"] as const;
    type Context = (typeof validContexts)[number];
    const safeContext: Context | null =
      typeof context === "string" &&
      validContexts.includes(context as Context)
        ? (context as Context)
        : null;

    // 7. Check API key
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Translation service unavailable" },
        { status: 500 }
      );
    }

    // 8. Build system prompt
    let systemPrompt = `You are a translator. Translate the following English text to ${languageName}. Keep it natural and concise. Only return the translation, nothing else.`;

    if (safeContext === "definition") {
      systemPrompt += " This is a word definition.";
    } else if (safeContext === "example") {
      systemPrompt += " This is an example sentence.";
    } else if (safeContext === "grammar") {
      systemPrompt += " This is a grammar explanation.";
    }

    // 9. Call xAI chat API
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini-fast",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      await res.text();
      return NextResponse.json(
        { error: "Translation failed" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const translation = data?.choices?.[0]?.message?.content?.trim();

    if (!translation) {
      return NextResponse.json(
        { error: "Translation failed" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { translation },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
