"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

export default function OperationsWorkbenchPage() {
  const router = useRouter();
  const { data: rawWOs, isLoading } = useQuery({ queryKey: ["wb-wos"], queryFn: () => authFetch("/api/v1/work-orders/?limit=50").then(r => r.json()), staleTime: 30000, refetchInterval: 60000 });
  const { data: dispatch } = useQuery({ queryKey: ["wb-dispatch"], queryFn: () => authFetch("/api/v1/dispatch/board").then(r => r.json()), staleTime: 30000 });
  const { data: sla } = useQuery({ queryKey: ["wb-sla"], queryFn: () => authFetch("/api/v1/sla/dashboard").then(r => r.json()), staleTime: 60000 });

  const wos = toArr(rawWOs).filter(w => !w.deleted_at);
  const open = wos.filter(w => w.status === "open");
  const inProg = wos.filter(w => w.status === "in_progress");
  const overdue = wos.filter(w => w.due_date && new Date(w.due_date) < new Date() && w.status !== "completed");
  const critical = wos.filter(w => w.priority === "critical" && w.status !== "completed");
  const techs = toArr(dispatch?.technicians);
  const activeTechs = techs.filter(t => (t.current_work_orders || 0) > 0);
  const overall = sla?.overall || {};

  const SECTIONS = [
    { title: "Open Work Orders", items: open.slice(0, 5), path: "/operations/work-orders", color: "#5B7C8C", icon: "🔧" },
    { title: "In Progress", items: inProg.slice(0, 5), path: "/operations/dispatch", color: "#B07A2A", icon: "⚡" },
    { title: "Overdue", items: overdue.slice(0, 5), path: "/operations/work-orders", color: "#A84A3D", icon: "🚨" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Operations Workbench</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Live operations summary · Team · SLA at a glance</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => router.push("/operations/command")}
                style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Command →
              </button>
              <button onClick={() => router.push("/operations")}
                style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                ← Operations
              </button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi" onClick={() => router.push("/operations/work-orders")} style={{ cursor: "pointer" }}>
                <div className="tb-hero-kpi-value">{open.length}</div><div className="tb-hero-kpi-label">Open</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#B07A2A" }}>{inProg.length}</div><div className="tb-hero-kpi-label">In Progress</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: overdue.length > 0 ? "#A84A3D" : "#547C4D" }}>{overdue.length}</div><div className="tb-hero-kpi-label">Overdue</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: (overall.compliance_rate || 0) >= 80 ? "#547C4D" : "#A84A3D" }}>
                  {Math.round(overall.compliance_rate || 0)}%
                </div>
                <div className="tb-hero-kpi-label">SLA</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          {/* WO Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {SECTIONS.map(({ title, items, path, color, icon }) => (
              <div key={title} className="tb-section">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-1)", margin: 0 }}>{icon} {title} ({items.length})</h2>
                  <button onClick={() => router.push(path)} style={{ fontSize: 12, color: "#B9924C", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
                </div>
                {items.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>No items</p>
                ) : items.map((w, i) => (
                  <div key={i} onClick={() => router.push(`/operations/work-orders/${w.id}`)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < items.length - 1 ? "1px solid var(--color-border)" : "none", cursor: "pointer" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title || "Untitled"}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>{fmtDate(w.due_date)}</div>
                    </div>
                    <StatusBadge status={w.priority || "medium"} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Active Technicians */}
            <div className="tb-section">
              <h2 className="tb-section-title">Active Technicians ({activeTechs.length})</h2>
              {activeTechs.slice(0, 8).map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < Math.min(activeTechs.length, 8) - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-1)" }}>{t.name?.split(" ")[0] || "—"}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#B9924C" }}>{t.current_work_orders || 0} WO</span>
                </div>
              ))}
              {activeTechs.length === 0 && <p style={{ fontSize: 13, color: "var(--color-text-3)" }}>No active technicians</p>}
              <button onClick={() => router.push("/operations/dispatch")}
                style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", color: "var(--color-text-2)" }}>
                Full Dispatch Board →
              </button>
            </div>

            {/* Quick Links */}
            <div className="tb-section">
              <h2 className="tb-section-title">Quick Actions</h2>
              {[
                { label: "+ New Work Order", path: "/operations/work-orders/new", primary: true },
                { label: "Bulk Operations", path: "/operations/bulk" },
                { label: "SLA Review", path: "/operations/sla-review" },
                { label: "Schedule", path: "/operations/schedule" },
                { label: "Time Tracking", path: "/operations/time-tracking" },
              ].map((a, i) => (
                <button key={i} onClick={() => router.push(a.path)}
                  style={{ display: "block", width: "100%", padding: "9px 12px", borderRadius: 8, marginBottom: 6, cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: a.primary ? 700 : 600,
                    background: a.primary ? "linear-gradient(135deg,#8F6F3D,#B9924C)" : "var(--color-surface-alt)",
                    border: a.primary ? "none" : "1px solid var(--color-border)",
                    color: a.primary ? "#181614" : "var(--color-text-2)" }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
