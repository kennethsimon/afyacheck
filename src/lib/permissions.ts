import type { SessionUser } from "@/app/api/auth/[...nextauth]/options";

/**
 * Exact permission names seeded by `atosclone/src/services/auth.ts`.
 */
export const PERMISSIONS = {
  ADD_USER: "Add user",
  EDIT_USER: "Edit user",
  DELETE_USER: "Delete user",
  CREATE_PROJECT: "Create project",
  EDIT_PROJECT: "Edit project",
  DELETE_PROJECT: "Delete project",
  CREATE_CAMP: "Create camp",
  EDIT_CAMP: "Edit camp",
  DELETE_CAMP: "Delete camp",
  EDIT_PATIENT_INFO: "Edit patient info step",
  EDIT_SCREENING: "Edit screening questions step",
  EDIT_CLINICAL: "Edit clinical findings step",
  EDIT_DOCTOR_COMMENTS: "Edit doctor comments step",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

type SessionLike = { user?: Partial<SessionUser> | null } | null | undefined;

export function isAdminSession(session: SessionLike): boolean {
  const roles = session?.user?.roles;
  if (!Array.isArray(roles)) return false;
  return roles.some(
    (role) => role?.name?.toLowerCase() === "admin" && role?.active !== false
  );
}

export function getUserPermissionNames(session: SessionLike): string[] {
  const permissions = session?.user?.permissions;
  if (!Array.isArray(permissions)) return [];
  return permissions
    .filter((p) => p && p.active !== false && typeof p.name === "string")
    .map((p) => p.name);
}

export function hasPermission(
  session: SessionLike,
  permission: PermissionName | string
): boolean {
  if (isAdminSession(session)) return true;
  return getUserPermissionNames(session).includes(permission);
}

export function hasAnyPermission(
  session: SessionLike,
  permissions: (PermissionName | string)[]
): boolean {
  if (isAdminSession(session)) return true;
  const userPerms = getUserPermissionNames(session);
  return permissions.some((p) => userPerms.includes(p));
}

export function canManageUsers(session: SessionLike): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.ADD_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
  ]);
}

export function canManageProjects(session: SessionLike): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.DELETE_PROJECT,
  ]);
}

export function canManageCamps(session: SessionLike): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.CREATE_CAMP,
    PERMISSIONS.EDIT_CAMP,
    PERMISSIONS.DELETE_CAMP,
  ]);
}

export function canAccessClinical(session: SessionLike): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.EDIT_SCREENING,
    PERMISSIONS.EDIT_CLINICAL,
    PERMISSIONS.EDIT_DOCTOR_COMMENTS,
  ]);
}

export function canRegisterPatient(session: SessionLike): boolean {
  return hasPermission(session, PERMISSIONS.EDIT_PATIENT_INFO);
}

export function getUserRoleLabel(session: SessionLike): string {
  const roles = session?.user?.roles;
  if (!Array.isArray(roles) || roles.length === 0) return "Staff";
  const activeRoles = roles.filter((r) => r?.active !== false && r?.name);
  if (activeRoles.length === 0) return "Staff";
  return activeRoles.map((r) => r.name).join(", ");
}

export function getUserAssignedCampId(session: SessionLike): string | null {
  const camp = session?.user?.camp;
  if (!camp) return null;
  if (typeof camp === "string") return camp;
  return camp._id || null;
}
