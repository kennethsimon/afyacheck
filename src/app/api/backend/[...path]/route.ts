import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getBackendApiOrigin } from "@/lib/api/origin";

/**
 * Explicit route-root -> allowed HTTP methods allowlist.
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
  reports: new Set(["GET", "POST"]),
  "audit-logs": new Set(["GET"]),
};

/**
 * Strict per-route sub-path pattern allowlist so arbitrary path probing or
 * unexpected verb+path combinations are blocked at the BFF edge.
 */
const ALLOWED_ENDPOINT_PATTERNS: Array<{ method: string; pattern: RegExp }> = [
  // Auth & Users
  { method: "GET", pattern: /^auth\/(roles|admin|admin\/[a-fA-F0-9]{24})$/ },
  { method: "POST", pattern: /^auth\/user$/ },
  { method: "PUT", pattern: /^auth\/admin\/[a-fA-F0-9]{24}$/ },
  { method: "DELETE", pattern: /^auth\/admin\/[a-fA-F0-9]{24}$/ },
  // Projects & Custom Projects
  { method: "GET", pattern: /^projects(\/[a-fA-F0-9]{24})?$/ },
  { method: "POST", pattern: /^projects$/ },
  { method: "PUT", pattern: /^projects\/edit\/[a-fA-F0-9]{24}$/ },
  { method: "DELETE", pattern: /^projects\/[a-fA-F0-9]{24}$/ },
  { method: "GET", pattern: /^custom-projects$/ },
  { method: "POST", pattern: /^custom-projects$/ },
  // Camps
  { method: "GET", pattern: /^camps(\/project\/(all|[a-fA-F0-9]{24})|\/camp\/[a-fA-F0-9]{24}|\/camp-stats\/(stats|analytics))?$/ },
  { method: "POST", pattern: /^camps$/ },
  { method: "PUT", pattern: /^camps\/[a-fA-F0-9]{24}$/ },
  // Patients & Clinical Diagnosis
  { method: "GET", pattern: /^patients(\/diagnosis(\/[a-fA-F0-9]{24})?|\/[a-fA-F0-9]{24})?$/ },
  { method: "POST", pattern: /^patients(\/diagnosis)?$/ },
  { method: "PUT", pattern: /^patients\/[a-fA-F0-9]{24}$/ },
  // Dynamic Forms
  { method: "GET", pattern: /^form-fields(\/[a-fA-F0-9]{24})?$/ },
  { method: "POST", pattern: /^form-fields$/ },
  { method: "PUT", pattern: /^form-fields\/[a-fA-F0-9]{24}$/ },
  { method: "DELETE", pattern: /^form-fields\/[a-fA-F0-9]{24}$/ },
  { method: "GET", pattern: /^form-schemas(\/[a-fA-F0-9]{24})?$/ },
  { method: "POST", pattern: /^form-schemas(\/[a-fA-F0-9]{24}\/versions)?$/ },
  { method: "PUT", pattern: /^form-schemas\/[a-fA-F0-9]{24}$/ },
  { method: "DELETE", pattern: /^form-schemas\/[a-fA-F0-9]{24}$/ },
  { method: "GET", pattern: /^form-submissions(\/[a-fA-F0-9]{24})?$/ },
  { method: "POST", pattern: /^form-submissions$/ },
  { method: "PATCH", pattern: /^form-submissions\/[a-fA-F0-9]{24}\/status$/ },
  { method: "GET", pattern: /^form-analytics\/dashboard\/[a-fA-F0-9]{24}$/ },
  { method: "POST", pattern: /^form-analytics\/generate$/ },
  // Wellness
  { method: "GET", pattern: /^questions$/ },
  { method: "POST", pattern: /^questions$/ },
  { method: "GET", pattern: /^responses(\/[a-fA-F0-9]{24})?$/ },
  { method: "POST", pattern: /^responses$/ },
  { method: "PUT", pattern: /^responses\/[a-fA-F0-9]{24}$/ },
  // Structured Reports & Async Report Jobs
  { method: "GET", pattern: /^reports\/(summary|generate|jobs|jobs\/[a-fA-F0-9]{24}|jobs\/[a-fA-F0-9]{24}\/download|patient\/[a-fA-F0-9]{24})$/ },
  { method: "POST", pattern: /^reports\/(jobs|jobs\/[a-fA-F0-9]{24}\/retry)$/ },
  // Audit Logs
  { method: "GET", pattern: /^audit-logs$/ },
];

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const MAX_JSON_BODY_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_MULTIPART_BODY_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_RESPONSE_BYTES = 50 * 1024 * 1024; // 50 MB

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

function getExpectedOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const proto = forwardedProto || req.nextUrl.protocol.replace(":", "") || "https";
    return `${proto}://${forwardedHost}`;
  }
  return req.nextUrl.origin;
}

/**
 * Strict same-origin CSRF enforcement on mutating requests.
 * Requires at least one verified same-origin browser header (`Origin`, `Referer`, or `Sec-Fetch-Site: same-origin`).
 * Mutations missing ALL of these headers are REJECTED with 403.
 */
function verifySameOriginForMutation(req: NextRequest): { ok: boolean; code?: string; message?: string } {
  const method = req.method.toUpperCase();
  if (!MUTATING_METHODS.has(method)) return { ok: true };

  const expectedOrigin = getExpectedOrigin(req);
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const fetchSite = req.headers.get("sec-fetch-site");

  if (origin) {
    if (origin !== expectedOrigin) {
      return {
        ok: false,
        code: "CSRF_ORIGIN_MISMATCH",
        message: "Cross-origin mutation blocked by CSRF policy",
      };
    }
    if (fetchSite && fetchSite !== "same-origin") {
      return {
        ok: false,
        code: "CSRF_FETCH_SITE_BLOCKED",
        message: "Cross-site mutation blocked by Fetch-Site policy",
      };
    }
    return { ok: true };
  }

  if (referer) {
    try {
      if (new URL(referer).origin === expectedOrigin) {
        if (fetchSite && fetchSite !== "same-origin") {
          return {
            ok: false,
            code: "CSRF_FETCH_SITE_BLOCKED",
            message: "Cross-site mutation blocked by Fetch-Site policy",
          };
        }
        return { ok: true };
      }
    } catch {
      return {
        ok: false,
        code: "CSRF_INVALID_REFERER",
        message: "Invalid Referer header on mutating request",
      };
    }
    return {
      ok: false,
      code: "CSRF_REFERER_MISMATCH",
      message: "Cross-origin Referer blocked by CSRF policy",
    };
  }

  if (fetchSite === "same-origin") {
    return { ok: true };
  }

  return {
    ok: false,
    code: "CSRF_ORIGIN_REQUIRED",
    message: "Missing verified same-origin header on state-changing request",
  };
}

function isEndpointAllowed(method: string, normalizedPath: string): boolean {
  return ALLOWED_ENDPOINT_PATTERNS.some(
    (entry) => entry.method === method && entry.pattern.test(normalizedPath)
  );
}

async function proxyRequest(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  const method = req.method.toUpperCase();
  const noStoreHeaders = {
    "Cache-Control": "no-store, private, max-age=0",
    Pragma: "no-cache",
    "X-Content-Type-Options": "nosniff",
  };

  // 1. Strict CSRF / Origin enforcement for state-changing requests
  const csrfCheck = verifySameOriginForMutation(req);
  if (!csrfCheck.ok) {
    return NextResponse.json(
      {
        status: false,
        success: false,
        code: csrfCheck.code,
        message: csrfCheck.message || "Cross-origin mutation blocked by CSRF policy",
      },
      { status: 403, headers: noStoreHeaders }
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
      { status: 401, headers: noStoreHeaders }
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
      { status: 401, headers: noStoreHeaders }
    );
  }

  // 3. Path traversal prevention + route-root/verb/endpoint-pattern allowlist
  const segments = context.params?.path || [];
  if (
    segments.length === 0 ||
    segments.some(
      (s) =>
        !s ||
        s === ".." ||
        s === "." ||
        s.includes("\\") ||
        s.toLowerCase().includes("%2e") ||
        s.includes("\0")
    )
  ) {
    return NextResponse.json(
      { status: false, success: false, message: "Invalid resource path" },
      { status: 400, headers: noStoreHeaders }
    );
  }

  const rootSegment = segments[0];
  const allowedVerbs = ALLOWED_ROUTE_METHODS[rootSegment];
  if (!allowedVerbs) {
    return NextResponse.json(
      { status: false, success: false, message: "Requested API resource is not permitted" },
      { status: 403, headers: noStoreHeaders }
    );
  }
  if (!allowedVerbs.has(method)) {
    return NextResponse.json(
      { status: false, success: false, message: `HTTP method ${method} is not allowed on /${rootSegment}` },
      { status: 405, headers: noStoreHeaders }
    );
  }

  const normalizedPath = segments.join("/");
  if (!isEndpointAllowed(method, normalizedPath)) {
    return NextResponse.json(
      { status: false, success: false, message: "Requested API endpoint pattern is not permitted" },
      { status: 403, headers: noStoreHeaders }
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
      { status: 503, headers: noStoreHeaders }
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

  // 4. Enforce explicit request size limits (2MB JSON / 10MB multipart) without UTF-8 corruption
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const contentType = req.headers.get("content-type") || "application/json";
    const isMultipart = contentType.toLowerCase().includes("multipart/form-data");
    const maxBytes = isMultipart ? MAX_MULTIPART_BODY_BYTES : MAX_JSON_BODY_BYTES;

    const declaredLength = Number(req.headers.get("content-length") || "0");
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      return NextResponse.json(
        {
          status: false,
          success: false,
          code: "PAYLOAD_TOO_LARGE",
          message: `Request payload exceeds maximum allowed size of ${Math.round(maxBytes / (1024 * 1024))}MB`,
        },
        { status: 413, headers: noStoreHeaders }
      );
    }

    headers["Content-Type"] = contentType;
    const buf = await req.arrayBuffer();
    if (buf.byteLength > maxBytes) {
      return NextResponse.json(
        {
          status: false,
          success: false,
          code: "PAYLOAD_TOO_LARGE",
          message: `Request payload exceeds maximum allowed size of ${Math.round(maxBytes / (1024 * 1024))}MB`,
        },
        { status: 413, headers: noStoreHeaders }
      );
    }
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
      ...noStoreHeaders,
    };

    const disposition = upstream.headers.get("content-disposition");
    if (disposition) {
      baseResponseHeaders["Content-Disposition"] = disposition;
    }
    const upstreamReqId = upstream.headers.get("x-request-id");
    if (upstreamReqId) {
      baseResponseHeaders["X-Request-Id"] = upstreamReqId;
    }

    // Handle 204 / 205 / 304 empty responses cleanly
    if (upstream.status === 204 || upstream.status === 205 || upstream.status === 304) {
      return new NextResponse(null, {
        status: upstream.status,
        headers: baseResponseHeaders,
      });
    }

    const upstreamLen = Number(upstream.headers.get("content-length") || "0");
    if (Number.isFinite(upstreamLen) && upstreamLen > MAX_RESPONSE_BYTES) {
      return NextResponse.json(
        {
          status: false,
          success: false,
          code: "RESPONSE_TOO_LARGE",
          message: "Upstream response exceeded proxy memory safety limit",
        },
        { status: 502, headers: noStoreHeaders }
      );
    }

    if (contentType.includes("application/json")) {
      const rawText = await upstream.text();
      if (!rawText || rawText.trim().length === 0) {
        return new NextResponse(null, {
          status: upstream.status,
          headers: baseResponseHeaders,
        });
      }
      try {
        const json = JSON.parse(rawText);
        const sanitized =
          rootSegment === "auth" ? stripSensitiveFields(json) : json;
        return NextResponse.json(sanitized, {
          status: upstream.status,
          headers: baseResponseHeaders,
        });
      } catch {
        return new NextResponse(rawText, {
          status: upstream.status,
          headers: {
            ...baseResponseHeaders,
            "Content-Type": contentType,
          },
        });
      }
    }

    // Binary-safe pass-through for PDF, Excel (.xlsx), CSV, images, etc.
    const binaryBody = await upstream.arrayBuffer();
    if (binaryBody.byteLength > MAX_RESPONSE_BYTES) {
      return NextResponse.json(
        {
          status: false,
          success: false,
          code: "RESPONSE_TOO_LARGE",
          message: "Upstream binary payload exceeded proxy safety limit",
        },
        { status: 502, headers: noStoreHeaders }
      );
    }
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
        headers: noStoreHeaders,
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
