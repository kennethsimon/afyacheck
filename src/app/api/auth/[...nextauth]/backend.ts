import axios from "axios";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { getBackendApiOrigin } from "@/lib/api/origin";

async function getServerBackendToken(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const rawCookie =
      cookieStore.get("__Secure-next-auth.session-token")?.value ||
      cookieStore.get("next-auth.session-token")?.value;

    if (!rawCookie || !process.env.NEXTAUTH_SECRET) {
      return null;
    }

    const decoded = await decode({
      token: rawCookie,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!decoded || (decoded as any).expired) {
      return null;
    }

    return typeof (decoded as any).backendToken === "string"
      ? ((decoded as any).backendToken as string)
      : null;
  } catch {
    return null;
  }
}

const backend = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

backend.interceptors.request.use(
  async (config) => {
    if (!config.baseURL) {
      config.baseURL = getBackendApiOrigin();
    }
    const token = await getServerBackendToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

backend.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default backend;
