"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime()) || dt.getFullYear() < 1990) return "—";
    return dt.toLocaleDateString("en-GB");
  } catch { return "—"; }
};
const ROLE_COLORS = {
  admin: "#F87171",
  manager: "#FBBF24",
  agent: "#60A5FA",
  engineer: "#34D399",
  finance: "#A78BFA",
  viewer: "#94A3B8",
  client: "#FB923C",
};

export default function UserManagementPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [newRole, setNewRole] = useState("");

  const { data: raw, isLoading } = useQuery(
    ["platform-users"],
    () => authFetch("/api/v1/users/").then((r) => r.json()),
    { staleTime: 30000 }
  );
  const users = toArr(raw);

  const updateRole = useMutation({
    mutationFn: ({ userId, role }) =>
      authFetch(`/api/v1/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries(["platform-users"]);
      setEditingId(null);
      setNewRole("");
    },
  });

  const roles = ["admin", "manager", "agent", "engineer", "finance", "viewer"];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1A0A2E 100%)" }}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Settings</div>
          <h1 className="tb-hero-title">User Management</h1>
          <p className="tb-hero-description">{users.length} platform users · Role-based access control</p>
          <div className="tb-grid-4 mt-6">
            {[
              { label: "Total Users", value: users.length, color: "#F1F5F9" },
              { label: "Admins", value: users.filter((u) => u.role === "admin").length, color: "#F87171" },
              { label: "Managers", value: users.filter((u) => u.role === "manager").length, color: "#FBBF24" },
              { label: "Active", value: users.filter((u) => u.is_active).length, color: "#34D399" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: k.color }}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Platform Users</div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {users.map((u, i) => {
                const rc = ROLE_COLORS[u.role] || "#94A3B8";
                const isEditing = editingId === u.id;
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-base-alt border border-transparent hover:border-border transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: rc + "20", color: rc }}>
                      {(u.name || u.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-primary truncate">{u.name || "—"}</div>
                      <div className="text-xs text-tertiary truncate">{u.email} · Joined {fmtDate(u.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <select
                            value={newRole || u.role}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="tb-input text-xs py-1 px-2"
                            style={{ width: 120 }}
                          >
                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <button
                            onClick={() => updateRole.mutate({ userId: u.id, role: newRole || u.role })}
                            className="tb-btn-primary"
                            style={{ fontSize: "0.7rem", padding: "4px 10px" }}
                          >Save</button>
                          <button
                            onClick={() => { setEditingId(null); setNewRole(""); }}
                            className="tb-btn-secondary"
                            style={{ fontSize: "0.7rem", padding: "4px 10px" }}
                          >Cancel</button>
                        </>
                      ) : (
                        <>
                          <span className="tb-badge" style={{ background: rc + "18", color: rc, border: "1px solid " + rc + "30", fontSize: "0.55rem" }}>
                            {u.role}
                          </span>
                          <span className="tb-badge" style={{ background: u.is_active ? "#34D39918" : "#F8717118", color: u.is_active ? "#34D399" : "#F87171", fontSize: "0.5rem" }}>
                            {u.is_active ? "active" : "inactive"}
                          </span>
                          <button
                            onClick={() => { setEditingId(u.id); setNewRole(u.role); }}
                            className="text-xs text-brand hover:text-white transition-colors"
                          >Edit role</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="tb-section mt-4">
          <div className="tb-section-title">Role Permissions</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {[
              { role: "admin", desc: "Full access — all modules, user management, security audit", color: "#F87171" },
              { role: "manager", desc: "Approve WOs, contracts, invoices — view all data", color: "#FBBF24" },
              { role: "agent", desc: "Create and edit WOs, service requests, procurement", color: "#60A5FA" },
              { role: "engineer", desc: "Log time, update WO status, view assigned work", color: "#34D399" },
              { role: "finance", desc: "View and process invoices, financial reports", color: "#A78BFA" },
              { role: "viewer", desc: "Read-only access to all modules", color: "#94A3B8" },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-base-alt">
                <span className="tb-badge flex-shrink-0" style={{ background: r.color + "18", color: r.color, border: "1px solid " + r.color + "30" }}>{r.role}</span>
                <div className="text-xs text-tertiary">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
