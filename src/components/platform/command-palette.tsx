"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Activity,
  BarChart3,
  FileSpreadsheet,
  FolderKanban,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  Plus,
  Settings,
  Stethoscope,
  UserPlus,
  Users,
  Wand2,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useWorkspace } from "@/lib/workspace-context";
import { useCamps, useProjects } from "@/lib/api/hooks";
import {
  canAccessClinical,
  canManageCamps,
  canManageProjects,
  canManageUsers,
  canRegisterPatient,
  isAdminSession,
} from "@/lib/permissions";

export function CommandPalette() {
  const router = useRouter();
  const { data: session } = useSession();
  const { commandOpen, setCommandOpen, setProjectId, setContext } = useWorkspace();

  const { data: projectsData } = useProjects();
  const { data: campsData } = useCamps("all");

  const projects = useMemo(
    () => projectsData?.projects ?? [],
    [projectsData?.projects]
  );
  const camps = useMemo(() => campsData?.camps ?? [], [campsData?.camps]);

  const isAdmin = isAdminSession(session as any);
  const allowProjects = canManageProjects(session as any);
  const allowCamps = canManageCamps(session as any);
  const allowPatients = canRegisterPatient(session as any);
  const allowClinical = canAccessClinical(session as any);
  const allowUsers = canManageUsers(session as any);

  const navigate = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Jump to workspace, project, camp, or action..." />
      <CommandList>
        <CommandEmpty>No matching workspaces, records, or actions.</CommandEmpty>

        <CommandGroup heading="Workspace">
          <CommandItem onSelect={() => navigate("/overview")}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Overview</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/projects")}>
            <FolderKanban className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/camps")}>
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Camps</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/patients")}>
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Patients Register</span>
          </CommandItem>
          {allowClinical && (
            <CommandItem onSelect={() => navigate("/clinical")}>
              <Stethoscope className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Clinical Screening Workspace</span>
            </CommandItem>
          )}
          <CommandItem onSelect={() => navigate("/wellness")}>
            <HeartPulse className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Wellness & Mental Health</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/analytics")}>
            <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/reports")}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Reports</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {allowPatients && (
            <CommandItem onSelect={() => navigate("/patients/new")}>
              <UserPlus className="mr-2 h-4 w-4 text-primary" />
              <span>Register New Patient</span>
              <CommandShortcut>P N</CommandShortcut>
            </CommandItem>
          )}
          {allowClinical && (
            <CommandItem onSelect={() => navigate("/clinical")}>
              <Activity className="mr-2 h-4 w-4 text-primary" />
              <span>Start Clinical Screening</span>
            </CommandItem>
          )}
          {allowProjects && (
            <CommandItem onSelect={() => navigate("/projects/new")}>
              <Plus className="mr-2 h-4 w-4 text-primary" />
              <span>Create Health Project</span>
            </CommandItem>
          )}
          {allowCamps && (
            <CommandItem onSelect={() => navigate("/camps?create=1")}>
              <Plus className="mr-2 h-4 w-4 text-primary" />
              <span>Create Health Camp</span>
            </CommandItem>
          )}
          {isAdmin && (
            <CommandItem onSelect={() => navigate("/form-templates")}>
              <Wand2 className="mr-2 h-4 w-4 text-primary" />
              <span>Open Form Builder & Templates</span>
            </CommandItem>
          )}
        </CommandGroup>

        {(isAdmin || allowUsers) && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Management">
              {isAdmin && (
                <CommandItem onSelect={() => navigate("/form-templates")}>
                  <Wand2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Form Templates</span>
                </CommandItem>
              )}
              {allowUsers && (
                <CommandItem onSelect={() => navigate("/team")}>
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Team & Access</span>
                </CommandItem>
              )}
              <CommandItem onSelect={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {projects.slice(0, 8).map((project) => (
                <CommandItem
                  key={project._id}
                  onSelect={() => {
                    setProjectId(project._id);
                    navigate(`/projects/${project._id}`);
                  }}
                >
                  <FolderKanban className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {camps.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Camps">
              {camps.slice(0, 8).map((camp) => {
                const parentId =
                  typeof camp.project === "string"
                    ? camp.project
                    : camp.project?._id || camp.projectDetails?.[0]?._id || "all";
                return (
                  <CommandItem
                    key={camp._id}
                    onSelect={() => {
                      setContext(parentId, camp._id);
                      navigate(`/projects/${parentId}/camps/${camp._id}`);
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{camp.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
