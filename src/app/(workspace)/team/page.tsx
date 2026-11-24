"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Edit3, Loader2, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/platform/page-header";
import { MetricCard } from "@/components/platform/metric-card";
import { DataToolbar } from "@/components/platform/data-toolbar";
import { EnterpriseDataTable } from "@/components/platform/data-table";
import { ErrorState, StatusBadge } from "@/components/platform/states";
import { useDeleteUser, useUsers } from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { canManageUsers, hasPermission, PERMISSIONS } from "@/lib/permissions";
import type { UserRecord } from "@/lib/api/types";

export default function TeamPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  const usersQuery = useUsers();
  const deleteUser = useDeleteUser();

  const canView = canManageUsers(session as any);
  const canAdd = hasPermission(session as any, PERMISSIONS.ADD_USER);
  const canEdit = hasPermission(session as any, PERMISSIONS.EDIT_USER);
  const canDelete = hasPermission(session as any, PERMISSIONS.DELETE_USER);

  const users = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data?.users]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.roles?.some((r) => r.name?.toLowerCase().includes(q))
    );
  }, [users, search]);

  const activeCount = useMemo(
    () => users.filter((u) => u.active !== false).length,
    [users]
  );
  const adminCount = useMemo(
    () =>
      users.filter((u) =>
        u.roles?.some((r) => r.name?.toLowerCase() === "admin")
      ).length,
    [users]
  );

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser.mutateAsync(userToDelete._id);
      toast.success(`Removed staff member ${userToDelete.name}`);
      setUserToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete staff user"));
    }
  };

  const columns: ColumnDef<UserRecord>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Staff Member",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="font-mono text-[11px] text-muted-foreground">
              @{row.original.username}
            </div>
          </div>
        ),
      },
      {
        id: "roles",
        header: "Roles",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {(row.original.roles ?? []).map((role) => (
              <StatusBadge
                key={role._id}
                tone={role.name?.toLowerCase() === "admin" ? "info" : "neutral"}
                dot={false}
              >
                {role.name}
              </StatusBadge>
            ))}
          </div>
        ),
      },
      {
        id: "permissions",
        header: "Permissions",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs text-muted-foreground">
            {row.original.permissions?.length ?? 0} assigned
          </span>
        ),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={row.original.active !== false ? "success" : "neutral"}>
            {row.original.active !== false ? "Active" : "Inactive"}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Added",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs text-muted-foreground">
            {row.original.createdAt
              ? format(new Date(row.original.createdAt), "MMM d, yyyy")
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => {
          const isProtectedAdmin =
            row.original.username === "adminatos" ||
            row.original.username === "admin@atos.com";
          return (
            <div className="flex items-center justify-end gap-1">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/team/${row.original._id}/edit`);
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
              {canDelete && !isProtectedAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserToDelete(row.original);
                  }}
                  aria-label={`Delete ${row.original.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [canEdit, canDelete, router]
  );

  if (!canView) {
    return (
      <ErrorState
        isPermissionError
        title="Team management restricted"
        description="You do not hold user administration permissions."
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Team & Access"
        description="Manage clinicians, data entry staff, roles, camp assignments, and module permissions."
        breadcrumbs={[
          { label: "Management", href: "/overview" },
          { label: "Team & Access" },
        ]}
        actions={
          canAdd ? (
            <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/team/new">
                <UserPlus className="h-3.5 w-3.5" />
                Add Staff Member
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-3.5 sm:grid-cols-3">
        <MetricCard label="Total Staff Accounts" value={users.length} icon={Users} />
        <MetricCard label="Active Accounts" value={activeCount} icon={ShieldCheck} />
        <MetricCard label="Administrators" value={adminCount} icon={ShieldCheck} />
      </div>

      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by name, username, or role..."
      />

      <EnterpriseDataTable
        columns={columns}
        data={filteredUsers}
        isLoading={usersQuery.isLoading}
        error={usersQuery.isError ? getErrorMessage(usersQuery.error) : null}
        onRetry={() => usersQuery.refetch()}
        totalCount={filteredUsers.length}
        emptyTitle="No staff members found"
        emptyDescription="Add a clinical or data entry team member to grant workspace access."
        onRowClick={
          canEdit ? (row) => router.push(`/team/${row._id}/edit`) : undefined
        }
      />

      <Dialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Remove Staff Account?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove{" "}
              <strong className="text-foreground">{userToDelete?.name}</strong>{" "}
              (@{userToDelete?.username})? This action revokes their workspace
              access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserToDelete(null)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteUser.isPending}
              onClick={handleConfirmDelete}
              className="h-8 gap-1.5 text-xs"
            >
              {deleteUser.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
