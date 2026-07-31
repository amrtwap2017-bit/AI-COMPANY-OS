"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

export default function OperationsCommandPage() {
  const router = useRouter();

  const { data: dispatch, isLoading: loadD } = useQuery({ queryKey: ["cmd-dispatch"], queryFn: () => authFetch("/api/v1/dispatch/board").then(r => r.json()), staleTime: 30000, refetchInterval: 60000 });
  const { data: sla, isLoading: loadS } = useQuery({ queryKey: ["cmd-sla"], queryFn: () => authFetch("/api/v1/sla/dashboard").then(r => r.json()), staleTime: 60000 });
  const { data: rawWOs } = useQuery({ queryKey: ["cmd-wos"], queryFn: () => authFetch("/api/v1/work-orders/?limit=50").then(r => r.json()), staleTime: 30000 });

  const board = dispatch?.board || {};
  const counts = dispatch?.counts || {};
  const techs = toArr(dispatch?.technicians);
  const wos = toArr(rawWOs).filter(w => !w.deleted_at);
  const open = wos.filter(w => w.status === "open");
  const inProg = wos.filter(w => w.status === "in_progress");
  const critical = wos.filter(w => w.priority === "critical" && w.status !== "completed");
  const overall = sla?.overall || {};
  const breaches = toArr(sla?.active_breaches);
  const isLoading = loadD || loadS;

  const ACTIONS = [
    { label: "Work Orders", icon: "🔧", path: "/operations/work-orders", count: wos.length, color: "#5B7C8C" },
    { label: "Dispatch Board", icon: "📋", path: "/operations/dispatch", count: inProg.length, color: "#B07A2A" },
    { label: "Service Requests", icon: "🎫", path: "/operations/service-requests", color: "#547C4D" },
    { label: "SLA Review", icon: "📊", path: "/operations/sla-review", count: breaches.length, color: breaches.length > 0 ? "#A84A3D" : "#547C4D" },
    { label: "Time Tracking", icon: "⏱", path: "/operations/time-tracking", color: "#8D7443" },
    { label: "Technicians", icon: "👷", path: "/operations/technicians", count: techs.filter(t => t.is_active).length, color: "#547C4D" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Operations Command</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Live operations overview · Quick actions · Team status</p>
            </div>
            <button onClick={() => router.push("/workspace/my-day")}
              style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              My Day →
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi" onClick={() => router.push("/operations/work-orders")} style={{ cursor: "pointer" }}>
                <div className="tb-hero-kpi-value">{open.length}</div><div className="tb-hero-kpi-label">Open WOs</div>
              </div>
              <div className="tb-hero-kpi" onClick={() => router.push("/operations/dispatch")} style={{ cursor: "pointer" }}>
                <div className="tb-hero-kpi-value" style={{ color: "#B07A2A" }}>{inProg.length}</div><div className="tb-hero-kpi-label">In Progress</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: critical.length > 0 ? "#A84A3D" : "#547C4D" }}>{critical.length}</div><div className="tb-hero-kpi-label">Critical</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: (overall.compliance_rate || 0) >= 80 ? "#547C4D" : "#A84A3D" }}>
                  {Math.round(overall.compliance_rate || 0)}%
                </div>
                <div className="tb-hero-kpi-label">SLA Rate</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {critical.length > 0 && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(168,74,61,0.08)", border: "1px solid rgba(168,74,61,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span>🚨</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#A84A3D" }}>{critical.length} critical work orders need immediate attention</span>
              <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>{critical.slice(0, 3).map(w => w.title).join(" · ")}</div>
            </div>
            <button onClick={() => router.push("/operations/work-orders")}
              style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(168,74,61,0.12)", border: "1px solid rgba(168,74,61,0.3)", color: "#A84A3D" }}>
              View →
            </button>
          </div>
        )}

        {/* Quick Action Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {ACTIONS.map((a, i) => (
            <button key={i} onClick={() => router.push(a.path)}
              style={{ padding: "16px 18px", borderRadius: 12, cursor: "pointer", textAlign: "left", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-1)" }}>{a.label}</div>
                {a.count !== undefined && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: a.color, marginTop: 2 }}>{a.count} active</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Technician Status */}
        <div className="tb-section">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="tb-section-title" style={{ margin: 0 }}>Field Team Status</h2>
            <button onClick={() => router.push("/operations/dispatch")}
              style={{ fontSize: 13, color: "#B9924C", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Full Dispatch →
            </button>
          </div>
          {techs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>No technician data available</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {techs.slice(0, 12).map((t, i) => {
                const load = t.current_work_orders || 0;
                const max = t.max_work_orders || 10;
                const pct = Math.min(100, Math.round(load / max * 100));
                return (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: t.is_active ? "linear-gradient(135deg,#8F6F3D,#B9924C)" : "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#181614" }}>
                        {(t.name || "?")[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                        <div style={{ fontSize: 10, color: t.is_active ? "#547C4D" : "#A84A3D", fontWeight: 600 }}>{t.is_active ? "Active" : "Offline"}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-2)" }}>{load}/{max}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 90 ? "#A84A3D" : pct >= 70 ? "#B07A2A" : "#547C4D", borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
