import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getBackendApiOrigin } from "@/lib/api/origin";

const ALLOWED_ROOT_SEGMENTS = new Set([
  "auth",
  "projects",
  "custom-projects",
  "camps",
  "patients",
  "form-fields",
  "form-schemas",
  "form-submissions",
  "form-analytics",
  "questions",
  "responses",
  "documents",
]);

function stripSensitiveFields(payload: unknown): unknown {
  if (Array.isArray(payload)) {
    return payload.map(stripSensitiveFields);
  }
  if (payload && typeof payload === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (key === "password" || key === "salt") {
        continue;
      }
      clean[key] = stripSensitiveFields(value);
    }
    return clean;
  }
  return payload;
}

async function proxyRequest(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || (token as any).expired || !(token as any)._id) {
    return NextResponse.json(
      { status: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const segments = context.params?.path || [];
  const rootSegment = segments[0];
  if (!rootSegment || !ALLOWED_ROOT_SEGMENTS.has(rootSegment)) {
    return NextResponse.json(
      { status: false, message: "Requested API resource is not permitted" },
      { status: 403 }
    );
  }

  // Prevent path traversal segments
  if (segments.some((s) => s === ".." || s === "." || s.includes("\\"))) {
    return NextResponse.json(
      { status: false, message: "Invalid resource path" },
      { status: 400 }
    );
  }

  let origin: string;
  try {
    origin = getBackendApiOrigin();
  } catch (err: any) {
    return NextResponse.json(
      { status: false, message: err?.message || "Backend API origin unavailable" },
      { status: 503 }
    );
  }

  const targetPath = segments.map((seg) => encodeURIComponent(seg)).join("/");
  const search = req.nextUrl.search || "";
  const targetUrl = `${origin}/${targetPath}${search}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const backendToken = (token as any).backendToken;
  if (typeof backendToken === "string" && backendToken.length > 0) {
    headers.Authorization = `Bearer ${backendToken}`;
  }

  const method = req.method.toUpperCase();
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const contentType = req.headers.get("content-type");
    if (contentType) {
      headers["Content-Type"] = contentType;
    } else {
      headers["Content-Type"] = "application/json";
    }
    body = await req.text();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body: body && body.length > 0 ? body : undefined,
      cache: "no-store",
      signal: controller.signal,
    });

    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await upstream.json();
      const sanitized =
        rootSegment === "auth" ? stripSensitiveFields(json) : json;
      return NextResponse.json(sanitized, {
        status: upstream.status,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType || "text/plain",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    const isAbort = error?.name === "AbortError";
    return NextResponse.json(
      {
        status: false,
        message: isAbort
          ? "Backend request timed out"
          : "Unable to reach the AfyaCheck backend service",
      },
      { status: isAbort ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeout);
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
