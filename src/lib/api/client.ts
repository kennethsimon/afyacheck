export class ApiError extends Error {
  status: number;
  details?: string;
  isAuthError: boolean;
  isNetworkError: boolean;

  constructor(
    message: string,
    opts?: {
      status?: number;
      details?: string;
      isAuthError?: boolean;
      isNetworkError?: boolean;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status ?? 500;
    this.details = opts?.details;
    this.isAuthError = opts?.isAuthError ?? this.status === 401;
    this.isNetworkError = opts?.isNetworkError ?? false;
  }
}

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export function serializeQueryParams(
  params?: Record<string, QueryParamValue>
): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    searchParams.set(key, String(value));
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, QueryParamValue>;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Browser-safe API client targeting the same-origin `/api/backend/*` BFF boundary.
 * Never exposes raw backend tokens in browser memory and never logs PHI.
 */
export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const query = serializeQueryParams(options.params);
  const url = `/api/backend${cleanPath}${query}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: "no-store",
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw err;
    }
    throw new ApiError("Network error while communicating with AfyaCheck API.", {
      status: 0,
      isNetworkError: true,
    });
  }

  let payload: any = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  } else {
    const text = await response.text().catch(() => "");
    payload = text ? { message: text } : null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.details ||
      (response.status === 401
        ? "Your session has expired. Please sign in again."
        : response.status === 403
        ? "You do not have permission to perform this action."
        : response.status === 404
        ? "The requested resource was not found."
        : `Request failed with status ${response.status}.`);

    throw new ApiError(message, {
      status: response.status,
      details: typeof payload?.details === "string" ? payload.details : undefined,
      isAuthError: response.status === 401,
    });
  }

  if (
    payload &&
    typeof payload === "object" &&
    (payload.status === false || payload.status === 0 || payload.status === "error")
  ) {
    throw new ApiError(payload.message || "Operation could not be completed.", {
      status: response.status,
      details: typeof payload.details === "string" ? payload.details : undefined,
    });
  }

  return payload as T;
}

export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred."): string {
  if (error instanceof ApiError) return error.details ? `${error.message} (${error.details})` : error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
