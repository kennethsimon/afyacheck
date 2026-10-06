"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function SessionMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only monitor on protected routes (dashboard)
    if (!pathname || (!pathname.startsWith("/dashboard") && pathname !== "/login")) {
      return;
    }

    // If session is loading, wait
    if (status === "loading") {
      return;
    }

    // If session is null/unauthenticated and we're on a protected route, redirect to login
    if (status === "unauthenticated" && pathname.startsWith("/dashboard")) {
      // Only show toast if we haven't already shown it (prevent multiple toasts)
      const hasShownToast = sessionStorage.getItem("session-expired-toast-shown");
      if (!hasShownToast) {
        toast.error("Your session has expired. Please log in again.", {
          description: "You have been logged out for security reasons.",
          duration: 5000,
        });
        sessionStorage.setItem("session-expired-toast-shown", "true");
      }
      
      // Sign out and redirect
      signOut({
        callbackUrl: "/login",
        redirect: true,
      });
      return;
    }

    // Check if session exists but user data is missing (expired/invalid session)
    if (status === "authenticated" && (!session || !session.user)) {
      const hasShownToast = sessionStorage.getItem("session-expired-toast-shown");
      if (!hasShownToast) {
        toast.error("Your session has expired. Please log in again.", {
          description: "You have been logged out for security reasons.",
          duration: 5000,
        });
        sessionStorage.setItem("session-expired-toast-shown", "true");
      }
      
      signOut({
        callbackUrl: "/login",
        redirect: true,
      });
      return;
    }

    // Clear the toast flag if session is valid
    if (status === "authenticated" && session && session.user) {
      sessionStorage.removeItem("session-expired-toast-shown");
    }
  }, [session, status, pathname, router]);

  return null; // This component doesn't render anything
}

