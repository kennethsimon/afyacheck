"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const PUBLIC_PATHS = ["/login"];

export function SessionMonitor() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (isPublic || status === "loading") return;

    if (
      status === "unauthenticated" ||
      (status === "authenticated" && !session?.user)
    ) {
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
  }, [session, status, pathname]);

  return null;
}
