const failedAttempts = new Map<string, { count: number; blockedUntil: number }>();

export function checkPinAttempt(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = failedAttempts.get(ip);

  if (entry && entry.blockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
  }

  return { allowed: true };
}

export function recordFailedPin(ip: string) {
  const now = Date.now();
  const entry = failedAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  entry.count++;
  // Exponential backoff: 30s, 60s, 120s, 240s, etc. (max 1 hour)
  const backoffMs = Math.min(30000 * Math.pow(2, entry.count - 1), 3600000);
  entry.blockedUntil = now + backoffMs;
  failedAttempts.set(ip, entry);
}

export function clearFailedPin(ip: string) {
  failedAttempts.delete(ip);
}
