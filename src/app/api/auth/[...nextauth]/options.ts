import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getBackendApiOrigin } from "@/lib/api/origin";

const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 hours

export interface SessionRole {
  _id: string;
  name: string;
  active: boolean;
}

export interface SessionPermission {
  _id: string;
  name: string;
  active: boolean;
}

export interface SessionCampRef {
  _id: string;
  name?: string;
  project?: string;
}

export interface SessionUser {
  _id: string;
  id?: string;
  name: string;
  username: string;
  active: boolean;
  roles: SessionRole[];
  permissions: SessionPermission[];
  camp: SessionCampRef | string | null;
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const origin = getBackendApiOrigin();
          const response = await fetch(`${origin}/auth/login`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials.username.trim(),
              password: credentials.password,
            }),
            cache: "no-store",
          });

          if (!response.ok) {
            return null;
          }

          const resp = await response.json();
          if (resp?.data?.user && (resp.status === 1 || resp.status === true)) {
            return {
              id: resp.data.user._id,
              user: resp.data.user,
              backendToken: resp.data.token,
            } as any;
          }

          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as any;
        const userRecord = u.user || {};
        return {
          ...token,
          _id: userRecord._id,
          name: userRecord.name,
          username: userRecord.username,
          active: Boolean(userRecord.active),
          roles: Array.isArray(userRecord.roles) ? userRecord.roles : [],
          permissions: Array.isArray(userRecord.permissions)
            ? userRecord.permissions
            : [],
          camp: userRecord.camp ?? null,
          backendToken: u.backendToken || null,
          issuedAt: Math.floor(Date.now() / 1000),
          expired: false,
        };
      }

      if (typeof token.issuedAt === "number") {
        const now = Math.floor(Date.now() / 1000);
        if (now - token.issuedAt > SESSION_MAX_AGE_SECONDS) {
          return { ...token, expired: true, backendToken: null };
        }
      }

      return token;
    },
    session: ({ session, token }) => {
      if ((token as any).expired || !token._id) {
        return {
          ...session,
          user: null,
        } as any;
      }

      // Intentionally omit raw `backendToken` from the browser-visible session.
      // Authenticated browser requests traverse `/api/backend/*`, which reads
      // `backendToken` server-side from the encrypted HttpOnly JWT cookie.
      return {
        ...session,
        user: {
          _id: String(token._id),
          id: String(token._id),
          name: String(token.name || ""),
          username: String(token.username || ""),
          active: Boolean(token.active),
          roles: (token.roles as SessionRole[]) || [],
          permissions: (token.permissions as SessionPermission[]) || [],
          camp: (token.camp as SessionCampRef | string | null) ?? null,
        } satisfies SessionUser,
      } as any;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
