/**
 * Single configurable origin for the AfyaCheck backend API (`atosclone`).
 * Server-side code prefers `BACKEND_API_URL` and falls back to `NEXT_PUBLIC_BACKEND_API`.
 */
export function getBackendApiOrigin(): string {
  const raw =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API ||
    "";

  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) {
    throw new Error(
      "Backend API origin is not configured. Set BACKEND_API_URL or NEXT_PUBLIC_BACKEND_API."
    );
  }
  return trimmed;
}

export function isBackendConfigured(): boolean {
  const raw =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API ||
    "";
  return raw.trim().length > 0;
}
