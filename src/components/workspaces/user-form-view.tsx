"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/platform/page-header";
import {
  SectionedForm,
  StickyFormActions,
} from "@/components/platform/record-detail-layout";
import { ErrorState, LoadingSkeleton } from "@/components/platform/states";
import {
  useCamps,
  useCreateUser,
  useRolesAndPermissions,
  useUpdateUser,
  useUser,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { UserCreateSchema, UserUpdateSchema } from "@/types/schemas";

export function UserFormView({ userId }: { userId?: string }) {
  const isEdit = Boolean(userId);
  const router = useRouter();

  const userQuery = useUser(userId);
  const rolesQuery = useRolesAndPermissions();
  const campsQuery = useCamps("all");
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(userId || "new");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [camp, setCamp] = useState<string>("none");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const u = userQuery.data;
    if (!u) return;
    setName(u.name || "");
    setUsername(u.username || "");
    const cid = typeof u.camp === "string" ? u.camp : u.camp?._id || "none";
    setCamp(cid);
    setSelectedRoles((u.roles ?? []).map((r) => r._id));
    setSelectedPermissions((u.permissions ?? []).map((p) => p._id));
    setActive(u.active !== false);
  }, [userQuery.data]);

  const toggleItem = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    id: string
  ) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const payload = {
      name,
      username,
      password: password || undefined,
      camp: camp === "none" ? undefined : camp,
      roles: selectedRoles,
      permissions: selectedPermissions,
      active,
    };

    const schema = isEdit ? UserUpdateSchema : UserCreateSchema;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form");
        nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      toast.error("Please resolve the highlighted validation errors.");
      return;
    }

    try {
      if (isEdit && userId) {
        await updateUser.mutateAsync({
          name: parsed.data.name,
          username: parsed.data.username,
          ...(parsed.data.password ? { password: parsed.data.password } : {}),
          camp: parsed.data.camp,
          roles: parsed.data.roles,
          permissions: parsed.data.permissions,
          active,
        });
        toast.success("Staff account updated");
      } else {
        await createUser.mutateAsync({
          name: parsed.data.name,
          username: parsed.data.username,
          password: parsed.data.password!,
          camp: parsed.data.camp,
          roles: parsed.data.roles,
          permissions: parsed.data.permissions,
        });
        toast.success("Staff account created");
      }
      router.push("/team");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save staff account"));
    }
  };

  if ((isEdit && userQuery.isLoading) || rolesQuery.isLoading) {
    return <LoadingSkeleton variant="form" rows={6} />;
  }

  if (isEdit && userQuery.isError) {
    return (
      <ErrorState
        description={getErrorMessage(userQuery.error)}
        onRetry={() => userQuery.refetch()}
      />
    );
  }

  const roles = rolesQuery.data?.roles ?? [];
  const permissions = rolesQuery.data?.permissions ?? [];
  const camps = campsQuery.data?.camps ?? [];
  const saving = createUser.isPending || updateUser.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PageHeader
        title={isEdit ? `Edit ${name || "Staff Member"}` : "Add Staff Member"}
        description="Assign credentials, camp scope, roles, and granular clinical permissions."
        breadcrumbs={[
          { label: "Management", href: "/overview" },
          { label: "Team & Access", href: "/team" },
          { label: isEdit ? "Edit Staff" : "Add Staff" },
        ]}
        actions={
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/team">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Team
            </Link>
          </Button>
        }
      />

      <SectionedForm title="1. Account Credentials & Camp Scope">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Amina Juma"
              className="h-9 bg-background text-sm"
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="amina.juma"
              className="h-9 bg-background text-sm"
            />
            {fieldErrors.username && (
              <p className="text-xs text-destructive">{fieldErrors.username}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              {isEdit ? "New Password (leave blank to keep current)" : "Password"}{" "}
              {!isEdit && <span className="text-destructive">*</span>}
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "••••••••" : "Minimum 6 characters"}
              className="h-9 bg-background text-sm"
            />
            {fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Assigned Health Camp (Optional)</Label>
            <Select value={camp} onValueChange={setCamp}>
              <SelectTrigger className="h-9 bg-background text-sm">
                <SelectValue placeholder="All camps (unrestricted)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific camp</SelectItem>
                {camps.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3 sm:col-span-2">
              <div>
                <div className="text-xs font-medium text-foreground">
                  Account Active
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Inactive users cannot sign in to AfyaCheck.
                </div>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          )}
        </div>
      </SectionedForm>

      <SectionedForm
        title="2. Roles & Clinical Permissions"
        description="Control module access and step-level clinical editing rights."
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              Roles <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-3">
              {roles.map((r) => (
                <label
                  key={r._id}
                  className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium"
                >
                  <Checkbox
                    checked={selectedRoles.includes(r._id)}
                    onCheckedChange={() =>
                      toggleItem(selectedRoles, setSelectedRoles, r._id)
                    }
                  />
                  <span>{r.name}</span>
                </label>
              ))}
            </div>
            {fieldErrors.roles && (
              <p className="text-xs text-destructive">{fieldErrors.roles}</p>
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Permissions <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] text-primary"
                onClick={() =>
                  setSelectedPermissions(
                    selectedPermissions.length === permissions.length
                      ? []
                      : permissions.map((p) => p._id)
                  )
                }
              >
                {selectedPermissions.length === permissions.length
                  ? "Clear all"
                  : "Select all"}
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {permissions.map((p) => (
                <label
                  key={p._id}
                  className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs"
                >
                  <Checkbox
                    checked={selectedPermissions.includes(p._id)}
                    onCheckedChange={() =>
                      toggleItem(selectedPermissions, setSelectedPermissions, p._id)
                    }
                  />
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
            {fieldErrors.permissions && (
              <p className="text-xs text-destructive">
                {fieldErrors.permissions}
              </p>
            )}
          </div>
        </div>
      </SectionedForm>

      <StickyFormActions>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href="/team">Cancel</Link>
        </Button>
        <Button type="submit" size="sm" disabled={saving} className="h-8 gap-1.5 text-xs">
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isEdit ? "Save Changes" : "Create Account"}
        </Button>
      </StickyFormActions>
    </form>
  );
}
