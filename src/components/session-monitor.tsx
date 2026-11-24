"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const PUBLIC_PATHS = ["/login"];

export function SessionMonitor() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId =
      status === "authenticated" && session?.user
        ? String((session.user as any)._id || (session.user as any).id || session.user.email || "")
        : null;

    // Purge all cached clinical & analytics data immediately on logout or account switch
    if (lastUserIdRef.current && lastUserIdRef.current !== currentUserId) {
      queryClient.clear();
    }
    if (status === "unauthenticated") {
      queryClient.clear();
    }
    lastUserIdRef.current = currentUserId;
  }, [session, status, queryClient]);

  useEffect(() => {
    if (!pathname) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (isPublic || status === "loading") return;

    if (
      status === "unauthenticated" ||
      (status === "authenticated" && !session?.user)
    ) {
      queryClient.clear();
      const key = "afyacheck.sessionExpiredToast";
      if (!sessionStorage.getItem(key)) {
        toast.error("Your session has expired. Please sign in again.");
        sessionStorage.setItem(key, "1");
      }
      signOut({ callbackUrl: "/login", redirect: true });
      return;
    }

    if (status === "authenticated" && session?.user) {
      sessionStorage.removeItem("afyacheck.sessionExpiredToast");
    }
  }, [session, status, pathname, queryClient]);

  return null;
}
