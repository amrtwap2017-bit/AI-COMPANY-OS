"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, DataTable, LoadingState,
  EmptyState, AlertBanner, StatusBadge, Avatar,
  Pagination, StatusFilterTabs,
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { tokenManager } from "@/lib/auth/token-manager";
import { fmtDate } from "@/lib/design-tokens";
import { toast } from "@/lib/toast";
import { RefreshCw, Plus, UserPlus, Shield } from "lucide-react";

const ROLES = ["admin", "manager", "engineer", "technician", "viewer"];

const STATUS_TABS = [
  { value: "all",    label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

async function apiCall(path: string, method = "GET", body?: any) {
  const token = tokenManager.getToken();
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "HTTP " + res.status);
  }
  return res.json().catch(() => ({}));
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize]         = useState(20);
  const [createOpen, setCreateOpen]     = useState(false);
  const [creating, setCreating]         = useState(false);
  const [newUser, setNewUser]           = useState({
    name: "", email: "", password: "", role: "manager",
  });
  const [formError, setFormError]       = useState("");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn:  () => apiCall("/api/v1/actions/users")
                     .then(d => Array.isArray(d) ? d : d?.users || d?.items || []),
    staleTime: 30_000,
  });

  const preFiltered = statusFilter === "active"
    ? data.filter((u: any) => u.is_active !== false)
    : statusFilter === "inactive"
    ? data.filter((u: any) => u.is_active === false)
    : data;

  const { query, setQuery, filtered } = useSearch(preFiltered, ["name", "email", "role"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, pageSize);

  const tabs = STATUS_TABS.map(t => ({
    ...t,
    count: t.value === "all" ? data.length
           : t.value === "active" ? data.filter((u: any) => u.is_active !== false).length
           : data.filter((u: any) => u.is_active === false).length,
  }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser.name.trim())     { setFormError("Name is required"); return; }
    if (!newUser.email.trim())    { setFormError("Email is required"); return; }
    if (!newUser.password.trim()) { setFormError("Password is required"); return; }
    if (newUser.password.length < 8) { setFormError("Password must be at least 8 characters"); return; }
    setCreating(true);
    setFormError("");
    try {
      await apiCall("/api/v1/actions/users", "POST", newUser);
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created: " + newUser.name);
      setCreateOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "manager" });
    } catch (e: any) {
      setFormError(e.message || "Failed to create user");
      toast.error(e.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  const columns = [
    { key: "name", label: "User",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" online={row.is_active !== false} />
          <div>
            <p className="font-semibold text-sm text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      )},
    { key: "role", label: "Role",
      render: (row: any) => (
        <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold capitalize">
          <Shield className="w-3 h-3" />
          {row.role || "viewer"}
        </span>
      )},
    { key: "is_active", label: "Status",
      render: (row: any) => (
        <StatusBadge status={row.is_active !== false ? "active" : "inactive"} dot />
      )},
    { key: "created_at", label: "Joined",
      render: (row: any) => (
        <span className="text-xs text-slate-400">{fmtDate(row.created_at)}</span>
      )},
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="User Management"
        subtitle={data.length + " platform users"}
        badge="ADMIN"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { refetch(); toast.success("Refreshed"); }}
              disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
            </button>
            <Button
              variant="primary"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => setCreateOpen(true)}
            >
              Add User
            </Button>
          </div>
        }
      />

      {isError && (
        <AlertBanner type="error"
          title={error instanceof Error ? error.message : "Failed to load users"}
          description="The users API endpoint may not be configured. Check /api/v1/actions/users"
        />
      )}

      <StatusFilterTabs
        tabs={tabs}
        active={statusFilter}
        onChange={v => { setStatusFilter(v); goToPage(1); }}
      />

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search users..." }}
        resultCount={filtered.length}
        totalCount={data.length}
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={6} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="👤"
            title={isError ? "Users API not available" : "No users found"}
            description={isError ? "Contact your system administrator" : "Add your first user"}
            action={
              !isError && (
                <Button
                  variant="primary"
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={() => setCreateOpen(true)}
                >
                  Add User
                </Button>
              )
            }
          />
        ) : (
          <DataTable columns={columns} data={items} />
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPage={goToPage}
        total={filtered.length}
        pageSize={pageSize}
        onPageSize={s => { setPageSize(s); goToPage(1); }}
      />

      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setFormError(""); }}
        title="Add New User"
        description="Create a new platform user account"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={creating}
              icon={<UserPlus className="w-4 h-4" />}
              onClick={handleCreate as any}
            >
              Create User
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <AlertBanner type="error" title={formError} />}
          <Input
            label="Full Name"
            required
            placeholder="Mohamed Hassan"
            value={newUser.name}
            onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
          />
          <Input
            type="email"
            label="Email Address"
            required
            placeholder="m.hassan@triangleblack.com"
            value={newUser.email}
            onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
          />
          <Input
            type="password"
            label="Password"
            required
            placeholder="Minimum 8 characters"
            value={newUser.password}
            onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select
              value={newUser.role}
              onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
              className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
            >
              {ROLES.map(r => (
                <option key={r} value={r} className="capitalize">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
