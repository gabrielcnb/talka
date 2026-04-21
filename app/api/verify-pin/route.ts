import { NextRequest, NextResponse } from "next/server";
import { checkPinAttempt, recordFailedPin, clearFailedPin } from "@/app/lib/pin-guard";

export async function POST(req: NextRequest) {
  const ip =
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const attempt = checkPinAttempt(ip);
  if (!attempt.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(attempt.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pin } = body as { pin?: unknown };

  if (!pin || typeof pin !== "string") {
    return NextResponse.json({ error: "PIN required" }, { status: 400 });
  }

  if (pin !== process.env.APP_PIN) {
    recordFailedPin(ip);
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  clearFailedPin(ip);
  return NextResponse.json({ valid: true });
}
