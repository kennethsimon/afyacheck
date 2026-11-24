import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getBackendApiOrigin } from "@/lib/api/origin";

/**
 * Explicit route-root -> allowed HTTP methods allowlist.
 * Prevents unexpected verb forwarding or arbitrary path probing.
 */
const ALLOWED_ROUTE_METHODS: Record<string, Set<string>> = {
  auth: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  projects: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  "custom-projects": new Set(["GET", "POST", "PUT", "DELETE"]),
  camps: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  patients: new Set(["GET", "POST", "PUT", "PATCH"]),
  "form-fields": new Set(["GET", "POST", "PUT", "DELETE"]),
  "form-schemas": new Set(["GET", "POST", "PUT", "DELETE"]),
  "form-submissions": new Set(["GET", "POST", "PATCH"]),
  "form-analytics": new Set(["GET", "POST"]),
  questions: new Set(["GET", "POST", "PUT", "DELETE"]),
  responses: new Set(["GET", "POST", "PUT"]),
  documents: new Set(["GET", "POST"]),
  reports: new Set(["GET", "POST"]),
  "audit-logs": new Set(["GET"]),
};

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function stripSensitiveFields(payload: unknown): unknown {
  if (Array.isArray(payload)) {
    return payload.map(stripSensitiveFields);
  }
  if (payload && typeof payload === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      payload as Record<string, unknown>
    )) {
      if (key === "password" || key === "salt" || key === "passwordReset") {
        continue;
      }
      clean[key] = stripSensitiveFields(value);
    }
    return clean;
  }
  return payload;
}

/**
 * Same-origin CSRF check on mutating requests (Origin / Referer vs Host).
 */
function verifySameOriginForMutation(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  if (!MUTATING_METHODS.has(method)) return true;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const expectedOrigin = req.nextUrl.origin;

  if (origin) {
    return origin === expectedOrigin;
  }
  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin;
    } catch {
      return false;
    }
  }
  // Allow non-browser same-host calls only when Fetch-Site is explicitly same-origin/none
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }
  return true;
}

async function proxyRequest(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  const method = req.method.toUpperCase();

  // 1. CSRF / Origin enforcement for state-changing requests
  if (!verifySameOriginForMutation(req)) {
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: "Cross-origin mutation blocked by CSRF policy",
      },
      { status: 403 }
    );
  }

  // 2. Mandatory authenticated NextAuth JWT + valid backend JWT
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || (token as any).expired || !(token as any)._id) {
    return NextResponse.json(
      { status: false, success: false, message: "Authentication required" },
      { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  const backendToken = (token as any).backendToken;
  if (typeof backendToken !== "string" || backendToken.trim().length === 0) {
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: "Session credentials expired. Please sign in again.",
      },
      { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  // 3. Explicit route-root + HTTP verb allowlist & traversal prevention
  const segments = context.params?.path || [];
  const rootSegment = segments[0];
  const allowedVerbs = rootSegment ? ALLOWED_ROUTE_METHODS[rootSegment] : undefined;
  if (!rootSegment || !allowedVerbs) {
    return NextResponse.json(
      { status: false, success: false, message: "Requested API resource is not permitted" },
      { status: 403 }
    );
  }
  if (!allowedVerbs.has(method)) {
    return NextResponse.json(
      { status: false, success: false, message: `HTTP method ${method} is not allowed on /${rootSegment}` },
      { status: 405 }
    );
  }

  if (
    segments.some(
      (s) => s === ".." || s === "." || s.includes("\\") || s.includes("%2e")
    )
  ) {
    return NextResponse.json(
      { status: false, success: false, message: "Invalid resource path" },
      { status: 400 }
    );
  }

  let origin: string;
  try {
    origin = getBackendApiOrigin();
  } catch (err: any) {
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: err?.message || "Backend API origin unavailable",
      },
      { status: 503 }
    );
  }

  const targetPath = segments.map((seg) => encodeURIComponent(seg)).join("/");
  const search = req.nextUrl.search || "";
  const targetUrl = `${origin}/${targetPath}${search}`;

  const headers: Record<string, string> = {
    Accept: req.headers.get("accept") || "application/json",
    Authorization: `Bearer ${backendToken}`,
  };

  const requestId = req.headers.get("x-request-id");
  if (requestId) {
    headers["X-Request-Id"] = requestId;
  }

  // 4. Preserve binary / multipart / JSON request bodies without UTF-8 corruption
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const contentType = req.headers.get("content-type");
    headers["Content-Type"] = contentType || "application/json";
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 0) {
      body = buf;
    }
  }

  // 5. Bounded timeout + client cancellation propagation
  const controller = new AbortController();
  const timeoutMs = rootSegment === "reports" ? 60000 : 30000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const onClientAbort = () => controller.abort();
  req.signal?.addEventListener("abort", onClientAbort, { once: true });

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const contentType = upstream.headers.get("content-type") || "";
    const baseResponseHeaders: Record<string, string> = {
      "Cache-Control": "no-store, private, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    };

    const disposition = upstream.headers.get("content-disposition");
    if (disposition) {
      baseResponseHeaders["Content-Disposition"] = disposition;
    }
    const upstreamReqId = upstream.headers.get("x-request-id");
    if (upstreamReqId) {
      baseResponseHeaders["X-Request-Id"] = upstreamReqId;
    }

    if (contentType.includes("application/json")) {
      const json = await upstream.json();
      const sanitized =
        rootSegment === "auth" ? stripSensitiveFields(json) : json;
      return NextResponse.json(sanitized, {
        status: upstream.status,
        headers: baseResponseHeaders,
      });
    }

    // Binary-safe pass-through for PDF, Excel (.xlsx), CSV, images, etc.
    const binaryBody = await upstream.arrayBuffer();
    return new NextResponse(binaryBody, {
      status: upstream.status,
      headers: {
        ...baseResponseHeaders,
        "Content-Type": contentType || "application/octet-stream",
      },
    });
  } catch (error: any) {
    const isAbort = error?.name === "AbortError";
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: isAbort
          ? "Backend request timed out or was cancelled"
          : "Unable to reach the AfyaCheck backend service",
      },
      {
        status: isAbort ? 504 : 502,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } finally {
    clearTimeout(timeout);
    req.signal?.removeEventListener("abort", onClientAbort);
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyRequest(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyRequest(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyRequest(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyRequest(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyRequest(req, context);
}
