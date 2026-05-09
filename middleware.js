const REALM = "LOEM";

function next() {
  return new Response(null, {
    headers: {
      "x-middleware-next": "1",
    },
  });
}

function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

function getCredentials(request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(authorization.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export default function middleware(request) {
  const { pathname } = new URL(request.url);
  if (pathname === "/_vercel" || pathname.startsWith("/_vercel/")) {
    return next();
  }

  if (process.env.SITE_AUTH_ENABLED !== "true") {
    return next();
  }

  const expectedUsername = process.env.SITE_USERNAME || "admin";
  const expectedPassword = process.env.SITE_PASSWORD;

  if (!expectedPassword) {
    return new Response("SITE_PASSWORD is not configured.", { status: 500 });
  }

  const credentials = getCredentials(request);
  if (
    credentials?.username !== expectedUsername ||
    credentials.password !== expectedPassword
  ) {
    return unauthorized();
  }

  return next();
}

export const config = {
  matcher: "/((?!_vercel(?:/.*)?$).*)",
};
