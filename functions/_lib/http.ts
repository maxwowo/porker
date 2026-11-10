export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function errorJson(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, status);
}

export function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  if (originUrl.origin === new URL(request.url).origin) return true;

  return (
    originUrl.hostname === "localhost" ||
    originUrl.hostname === "127.0.0.1" ||
    originUrl.hostname === "[::1]" ||
    originUrl.hostname === "::1"
  );
}
