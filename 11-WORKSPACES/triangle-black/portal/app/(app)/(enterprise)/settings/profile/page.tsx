"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";

const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt = new Date(d); if (dt.getFullYear() < 1990) return "—"; return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
};

const ROLE_COLORS = {
  admin: "#B9924C", manager: "#B07A2A", agent: "#5B7C8C",
  engineer: "#547C4D", finance: "#8D7443", viewer: "#6D5F53"
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const [editPwd, setEditPwd] = useState(false);
  const [pwd, setPwd] = useState({ current: "", new_: "", confirm: "" });
  const [pwdErrors, setPwdErrors] = useState({});

  const { data: me } = useQuery({
    queryKey: ["profile-me"],
    queryFn: () => authFetch("/api/v1/me").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: auditRaw } = useQuery({
    queryKey: ["profile-audit"],
    queryFn: () => authFetch("/api/v1/platform/summary").then(r => r.json()),
    staleTime: 60000,
  });

  const rc = ROLE_COLORS[me?.role || user?.role] || "#6D5F53";
  const initials = (user?.name || me?.name || "TB").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const displayName = user?.name || me?.name || "User";
  const displayEmail = user?.email || me?.email || "—";
  const displayRole = me?.role || user?.role || "—";

  // ── PASSWORD CHANGE MUTATION ──────────────────────────────
  const changePwdMut = useMutation({
    mutationFn: (payload) =>
      authFetch("/api/v1/secure/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json()),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Password changed successfully");
        setPwd({ current: "", new_: "", confirm: "" });
        setPwdErrors({});
        setEditPwd(false);
      } else {
        toast.error(data?.detail || "Password change failed");
        if (data?.detail?.toLowerCase().includes("current")) {
          setPwdErrors({ current: "Current password is incorrect" });
        }
      }
    },
    onError: () => toast.error("Network error — please try again"),
  });

  const handlePasswordChange = () => {
    const e = {};
    if (!pwd.current) e.current = "Current password is required";
    if (!pwd.new_) e.new_ = "New password is required";
    else if (pwd.new_.length < 8) e.new_ = "Minimum 8 characters";
    if (!pwd.confirm) e.confirm = "Please confirm new password";
    else if (pwd.new_ !== pwd.confirm) e.confirm = "Passwords do not match";
    if (Object.keys(e).length) { setPwdErrors(e); return; }
    changePwdMut.mutate({ current_password: pwd.current, new_password: pwd.new_ });
  };

  const handleLogout = () => {
    logout?.();
    router.push("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Avatar */}
              <div style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                background: `linear-gradient(135deg, ${rc}60, ${rc})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 900, color: "#181614",
                border: `2px solid ${rc}40`
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#B9924C", marginBottom: 4 }}>
                  My Profile
                </div>
                <h1 className="tb-hero-title">{displayName}</h1>
                <div style={{ display: "flex", gap: 12, marginTop: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-2)" }}>{displayEmail}</span>
                  <span style={{
                    padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: `${rc}18`, color: rc, border: `1px solid ${rc}30`
                  }}>
                    {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(168,74,61,0.12)", border: "1px solid rgba(168,74,61,0.3)",
                color: "#A84A3D", borderRadius: 8,
                padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700,
                whiteSpace: "nowrap"
              }}
            >
              Sign Out
            </button>
          </div>
          <div className="tb-hero-kpis">
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ fontSize: 14 }}>{me?.id?.slice(0, 8) || "—"}</div>
              <div className="tb-hero-kpi-label">User ID</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ fontSize: 14, color: rc }}>{displayRole}</div>
              <div className="tb-hero-kpi-label">Role</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ fontSize: 14 }}>{fmtDate(me?.created_at)}</div>
              <div className="tb-hero-kpi-label">Member Since</div>
            </div>
            <div className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{ fontSize: 12, color: "#547C4D" }}>Active</div>
              <div className="tb-hero-kpi-label">Account Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="tb-canvas">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

          {/* ── LEFT: ACCOUNT INFO ──────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Profile Info */}
            <div className="tb-section">
              <h2 className="tb-section-title">Account Information</h2>
              {[
                ["Full Name",    displayName],
                ["Email",        displayEmail],
                ["Role",         displayRole],
                ["Hotel ID",     me?.hotel_id || "—"],
                ["User ID",      me?.id || "—"],
                ["Member Since", fmtDate(me?.created_at)],
                ["Last Updated", fmtDate(me?.updated_at)],
              ].map(([label, value], i, arr) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "9px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none"
                }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-3)" }}>{label}</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-1)", fontWeight: 500, textAlign: "right", maxWidth: "60%", wordBreak: "break-all" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="tb-section">
              <h2 className="tb-section-title">Quick Navigation</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "User Management", icon: "👥", path: "/settings/users", role: "admin" },
                  { label: "Audit Trail", icon: "🔍", path: "/administration/audit" },
                  { label: "My Work Orders", icon: "🔧", path: "/operations/work-orders" },
                  { label: "Time Tracking", icon: "⏱", path: "/operations/time-tracking" },
                  { label: "Dashboard", icon: "📊", path: "/workspace" },
                ].map((a, i) => (
                  <button key={i} onClick={() => router.push(a.path)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      background: "var(--color-surface-alt)", border: "1px solid var(--color-border)",
                      color: "var(--color-text-2)", fontSize: 13, fontWeight: 500, textAlign: "left", width: "100%"
                    }}>
                    <span>{a.icon}</span><span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: SECURITY ──────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Password Change */}
            <div className="tb-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 className="tb-section-title" style={{ margin: 0 }}>Security</h2>
                {!editPwd && (
                  <button
                    onClick={() => setEditPwd(true)}
                    style={{
                      background: "linear-gradient(135deg,#8F6F3D,#B9924C)",
                      color: "#181614", border: "none", borderRadius: 8,
                      padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    Change Password
                  </button>
                )}
              </div>

              {!editPwd ? (
                <div style={{ padding: "16px", background: "var(--color-surface-alt)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>🔒</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-1)" }}>Password Protected</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                        Click Change Password to update your credentials
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Current Password */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                      Current Password <span style={{ color: "#A84A3D" }}>*</span>
                    </label>
                    <input
                      type="password"
                      value={pwd.current}
                      onChange={e => { setPwd(p => ({ ...p, current: e.target.value })); if (pwdErrors.current) setPwdErrors(er => { const n = { ...er }; delete n.current; return n; }); }}
                      placeholder="Enter current password"
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                        border: `1px solid ${pwdErrors.current ? "#A84A3D" : "var(--color-border)"}`,
                        background: "var(--color-surface)", color: "var(--color-text-1)", boxSizing: "border-box"
                      }}
                    />
                    {pwdErrors.current && <p style={{ fontSize: 12, color: "#A84A3D", marginTop: 4 }}>{pwdErrors.current}</p>}
                  </div>

                  {/* New Password */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                      New Password <span style={{ color: "#A84A3D" }}>*</span>
                    </label>
                    <input
                      type="password"
                      value={pwd.new_}
                      onChange={e => { setPwd(p => ({ ...p, new_: e.target.value })); if (pwdErrors.new_) setPwdErrors(er => { const n = { ...er }; delete n.new_; return n; }); }}
                      placeholder="Minimum 8 characters"
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                        border: `1px solid ${pwdErrors.new_ ? "#A84A3D" : "var(--color-border)"}`,
                        background: "var(--color-surface)", color: "var(--color-text-1)", boxSizing: "border-box"
                      }}
                    />
                    {pwdErrors.new_ && <p style={{ fontSize: 12, color: "#A84A3D", marginTop: 4 }}>{pwdErrors.new_}</p>}
                    {pwd.new_ && pwd.new_.length >= 8 && !pwdErrors.new_ && (
                      <p style={{ fontSize: 12, color: "#547C4D", marginTop: 4 }}>✓ Strong enough</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 6 }}>
                      Confirm New Password <span style={{ color: "#A84A3D" }}>*</span>
                    </label>
                    <input
                      type="password"
                      value={pwd.confirm}
                      onChange={e => { setPwd(p => ({ ...p, confirm: e.target.value })); if (pwdErrors.confirm) setPwdErrors(er => { const n = { ...er }; delete n.confirm; return n; }); }}
                      placeholder="Repeat new password"
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                        border: `1px solid ${pwdErrors.confirm ? "#A84A3D" : pwd.confirm && pwd.confirm === pwd.new_ ? "#547C4D" : "var(--color-border)"}`,
                        background: "var(--color-surface)", color: "var(--color-text-1)", boxSizing: "border-box"
                      }}
                    />
                    {pwdErrors.confirm && <p style={{ fontSize: 12, color: "#A84A3D", marginTop: 4 }}>{pwdErrors.confirm}</p>}
                    {pwd.confirm && pwd.confirm === pwd.new_ && !pwdErrors.confirm && (
                      <p style={{ fontSize: 12, color: "#547C4D", marginTop: 4 }}>✓ Passwords match</p>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => { setEditPwd(false); setPwd({ current: "", new_: "", confirm: "" }); setPwdErrors({}); }}
                      style={{ flex: 1, padding: "10px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", fontWeight: 600 }}>
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      disabled={changePwdMut.isLoading}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        cursor: changePwdMut.isLoading ? "not-allowed" : "pointer",
                        background: changePwdMut.isLoading ? "var(--color-border)" : "linear-gradient(135deg,#8F6F3D,#B9924C)",
                        color: "#181614", border: "none"
                      }}>
                      {changePwdMut.isLoading ? "Saving..." : "Update Password"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="tb-section">
              <h2 className="tb-section-title">Session</h2>
              <p style={{ fontSize: 13, color: "var(--color-text-3)", marginBottom: 16 }}>
                Sign out from all active sessions on this device.
              </p>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%", padding: "10px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(168,74,61,0.08)", border: "1px solid rgba(168,74,61,0.25)",
                  color: "#A84A3D", fontWeight: 700, fontSize: 13
                }}>
                Sign Out
              </button>
            </div>

            {/* Platform Info */}
            <div className="tb-section">
              <h2 className="tb-section-title">Platform</h2>
              {[
                ["Version",   "2.0.0-sprint311"],
                ["Platform",  "Triangle Black Enterprise MEP"],
                ["Environment", "Production"],
              ].map(([label, value], i, arr) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none"
                }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-3)" }}>{label}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-2)", fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
