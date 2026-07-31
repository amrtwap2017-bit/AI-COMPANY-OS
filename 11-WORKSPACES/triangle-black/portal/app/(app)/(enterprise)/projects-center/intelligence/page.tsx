"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n || 0).toLocaleString();
const COLORS = ["#B9924C", "#547C4D", "#A84A3D", "#B07A2A", "#5B7C8C", "#8D7443"];

export default function ProjectsIntelligencePage() {
  const router = useRouter();
  const { data: raw, isLoading } = useQuery({ queryKey: ["proj-intel"], queryFn: () => authFetch("/api/v1/projects-portal").then(r => r.json()), staleTime: 60000 });
  const projects = toArr(raw);

  const byStatus = Object.entries(projects.reduce((acc, p) => { acc[p.status || "unknown"] = (acc[p.status || "unknown"] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const avgCompletion = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.completion_pct || 0), 0) / projects.length) : 0;
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget || 0), 0);
  const overBudget = projects.filter(p => p.actual_cost > p.budget).length;
  const overdue = projects.filter(p => p.end_date && new Date(p.end_date) < new Date() && p.status !== "completed").length;
  const AXIS = { fontSize: 11, fill: "var(--color-text-3)" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div><h1 className="tb-hero-title">Projects Intelligence</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Portfolio analytics · Status distribution · Budget insights</p>
            </div>
            <button onClick={() => router.push("/projects-center")}
              style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              ← Projects
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{projects.length}</div><div className="tb-hero-kpi-label">Total Projects</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: avgCompletion >= 70 ? "#547C4D" : "#B07A2A" }}>{avgCompletion}%</div><div className="tb-hero-kpi-label">Avg Completion</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: overdue > 0 ? "#A84A3D" : "#547C4D" }}>{overdue}</div><div className="tb-hero-kpi-label">Overdue</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 14 }}>{fmtEGP(totalBudget)}</div><div className="tb-hero-kpi-label">Portfolio Budget</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="tb-section">
            <h2 className="tb-section-title">Projects by Status</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byStatus} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="tb-section">
            <h2 className="tb-section-title">Portfolio Health</h2>
            {[
              ["Total Projects", projects.length, "var(--color-text-1)"],
              ["Active", projects.filter(p => ["active", "in_progress"].includes(p.status)).length, "#5B7C8C"],
              ["Completed", projects.filter(p => p.status === "completed").length, "#547C4D"],
              ["On Hold", projects.filter(p => p.status === "on_hold").length, "#B07A2A"],
              ["Overdue", overdue, overdue > 0 ? "#A84A3D" : "#547C4D"],
              ["Avg Completion", `${avgCompletion}%`, avgCompletion >= 70 ? "#547C4D" : "#B07A2A"],
              ["Total Budget", fmtEGP(totalBudget), "#B9924C"],
            ].map(([label, value, color], i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-3)" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: color as string }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="tb-section">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 className="tb-section-title" style={{ margin: 0 }}>Top Projects by Completion</h2>
            <button onClick={() => router.push("/projects-center/list")} style={{ fontSize: 12, color: "#B9924C", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View All →</button>
          </div>
          {projects.sort((a, b) => (b.completion_pct || 0) - (a.completion_pct || 0)).slice(0, 8).map((p, i) => (
            <div key={i} onClick={() => router.push(`/projects-center/${p.id}`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 7 ? "1px solid var(--color-border)" : "none", cursor: "pointer" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
                <div style={{ flex: 1, height: 6, background: "var(--color-border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.completion_pct || 0}%`, background: (p.completion_pct || 0) >= 80 ? "#547C4D" : "#B9924C", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-2)", minWidth: 30 }}>{p.completion_pct || 0}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
