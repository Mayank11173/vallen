export async function onRequest(context) {
  const { request, env, next } = context;
  const password = env.SITE_PASSWORD;

  if (!password) {
    return new Response("Missing SITE_PASSWORD secret.", { status: 500 });
  }

  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Basic ")) {
    try {
      const raw = auth.slice(6);
      const decoded = atob(raw);
      const parts = decoded.split(":");
      const providedPassword = parts.slice(1).join(":");
      if (providedPassword === password) {
        return await next();
      }
    } catch {
      // fall through to 401
    }
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Mayank ❤ Gunjan", charset="UTF-8"',
    },
  });
}

