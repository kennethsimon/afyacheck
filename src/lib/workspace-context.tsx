"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getUserAssignedCampId, isAdminSession } from "@/lib/permissions";

interface WorkspaceContextValue {
  projectId: string;
  campId: string;
  setProjectId: (id: string) => void;
  setCampId: (id: string) => void;
  setContext: (projectId: string, campId: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  hydrated: boolean;
}

const STORAGE_PROJECT_KEY = "afyacheck.activeProjectId";
const STORAGE_CAMP_KEY = "afyacheck.activeCampId";
const STORAGE_SIDEBAR_KEY = "afyacheck.sidebarCollapsed";

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [projectId, setProjectIdState] = useState<string>("all");
  const [campId, setCampIdState] = useState<string>("all");
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(false);
  const [commandOpen, setCommandOpen] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Hydrate persisted workspace & sidebar preferences on mount
  useEffect(() => {
    try {
      const savedProject = window.localStorage.getItem(STORAGE_PROJECT_KEY);
      const savedCamp = window.localStorage.getItem(STORAGE_CAMP_KEY);
      const savedSidebar = window.localStorage.getItem(STORAGE_SIDEBAR_KEY);

      if (savedProject) setProjectIdState(savedProject);
      if (savedCamp) setCampIdState(savedCamp);
      if (savedSidebar === "true") setSidebarCollapsedState(true);
    } catch {
      // Ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Sync URL-encoded projectId/campId when navigating inside project/camp/dashboard routes
  useEffect(() => {
    if (!pathname) return;

    const dashboardMatch = pathname.match(/^\/dashboard\/([^/]+)\/([^/]+)/);
    if (dashboardMatch) {
      const [, urlProject, urlCamp] = dashboardMatch;
      setProjectIdState(urlProject);
      setCampIdState(urlCamp);
      try {
        window.localStorage.setItem(STORAGE_PROJECT_KEY, urlProject);
        window.localStorage.setItem(STORAGE_CAMP_KEY, urlCamp);
      } catch {}
      return;
    }

    const projectCampMatch = pathname.match(
      /^\/projects\/([^/]+)\/camps\/([^/]+)/
    );
    if (projectCampMatch && projectCampMatch[2] !== "new") {
      const [, urlProject, urlCamp] = projectCampMatch;
      setProjectIdState(urlProject);
      setCampIdState(urlCamp);
      try {
        window.localStorage.setItem(STORAGE_PROJECT_KEY, urlProject);
        window.localStorage.setItem(STORAGE_CAMP_KEY, urlCamp);
      } catch {}
      return;
    }

    const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
    if (projectMatch && projectMatch[1] !== "new") {
      const urlProject = projectMatch[1];
      setProjectIdState(urlProject);
      try {
        window.localStorage.setItem(STORAGE_PROJECT_KEY, urlProject);
      } catch {}
    }
  }, [pathname]);

  // If non-admin user has an assigned camp and no camp is chosen yet, default to assigned camp
  useEffect(() => {
    if (!hydrated || !session?.user) return;
    if (!isAdminSession(session as any)) {
      const assignedCamp = getUserAssignedCampId(session as any);
      if (assignedCamp && campId === "all") {
        setCampIdState(assignedCamp);
        try {
          window.localStorage.setItem(STORAGE_CAMP_KEY, assignedCamp);
        } catch {}
      }
    }
  }, [hydrated, session, campId]);

  // Global Cmd/Ctrl + K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const setProjectId = useCallback((id: string) => {
    const next = id || "all";
    setProjectIdState(next);
    setCampIdState("all");
    try {
      window.localStorage.setItem(STORAGE_PROJECT_KEY, next);
      window.localStorage.setItem(STORAGE_CAMP_KEY, "all");
    } catch {}
  }, []);

  const setCampId = useCallback((id: string) => {
    const next = id || "all";
    setCampIdState(next);
    try {
      window.localStorage.setItem(STORAGE_CAMP_KEY, next);
    } catch {}
  }, []);

  const setContext = useCallback((nextProjectId: string, nextCampId: string) => {
    const p = nextProjectId || "all";
    const c = nextCampId || "all";
    setProjectIdState(p);
    setCampIdState(c);
    try {
      window.localStorage.setItem(STORAGE_PROJECT_KEY, p);
      window.localStorage.setItem(STORAGE_CAMP_KEY, c);
    } catch {}
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      window.localStorage.setItem(STORAGE_SIDEBAR_KEY, String(collapsed));
    } catch {}
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_SIDEBAR_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      projectId,
      campId,
      setProjectId,
      setCampId,
      setContext,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      commandOpen,
      setCommandOpen,
      hydrated,
    }),
    [
      projectId,
      campId,
      setProjectId,
      setCampId,
      setContext,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      commandOpen,
      hydrated,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return ctx;
}
