"use client";

import { useEffect, useState } from "react";
import { BarChart3, RefreshCw, Brain, MessageSquare, Zap, Database } from "lucide-react";

const AI  = "http://localhost:8001/api/v1/ai";
const TB  = "http://localhost:8030/api/v1";

async function getSummary()    { try { const r = await fetch(`${AI}/analytics/summary`);    return r.ok ? r.json() : {}; } catch { return {}; } }
async function getTimeline()   { try { const r = await fetch(`${AI}/analytics/timeline?limit=10`); return r.ok ? r.json() : {}; } catch { return {}; } }
async function getTBLeads()    { try { const r = await fetch(`${TB}/leads/`);                return r.ok ? r.json() : []; } catch { return []; } }
async function getTBWorkOrders(){ try { const r = await fetch(`${TB}/work-orders/`);         return r.ok ? r.json() : []; } catch { return []; } }

export default function AnalyticsPage() {
  const [summary,   setSummary]   = useState<any>({});
  const [timeline,  setTimeline]  = useState<any[]>([]);
  const [leads,     setLeads]     = useState<any[]>([]);
  const [workOrders,setWorkOrders]= useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    const [s, t, l, w] = await Promise.all([
      getSummary(), getTimeline(), getTBLeads(), getTBWorkOrders()
    ]);
    setSummary(s);
    setTimeline(t.events ?? []);
    setLeads(Array.isArray(l) ? l : []);
    setWorkOrders(Array.isArray(w) ? w : []);
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
      <p style={{ color: "#94a3b8" }}>Loading analytics…</p>
    </div>
  );

  const qualifiedLeads = leads.filter((l: any) => l.status === "qualified").length;
  const completedWOs   = workOrders.filter((w: any) => w.status === "completed").length;
  const convRate       = leads.length > 0 ? Math.round(qualifiedLeads / leads.length * 100) : 0;
  const woRate         = workOrders.length > 0 ? Math.round(completedWOs / workOrders.length * 100) : 0;

  const Stat = ({ icon, label, value, sub, color }: any) => (
    <div style={{
      background: "#0f172a", border: "1px solid #1e293b",
      borderTop: `3px solid ${color}`,
      borderRadius: 12, padding: "16px 20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: 32, maxWidth: 1200, color: "#f1f5f9" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>📊 Analytics</h1>
          <p style={{ color: "#64748b", marginTop: 4 }}>AI Engine + Triangle Black · Real data only</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", background: "#1e293b",
            border: "1px solid #334155", borderRadius: 8,
            color: "#94a3b8", cursor: "pointer", fontSize: 13,
          }}>
          <RefreshCw style={{ width: 14, height: 14, animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* AI Engine KPIs */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginBottom: 12,
          textTransform: "uppercase", letterSpacing: 1 }}>🤖 AI Engine</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          <Stat icon="🤖" label="Agents"        value={summary.total_agents ?? 0}         sub={`${summary.active_agents ?? 0} active`} color="#6366f1" />
          <Stat icon="✅" label="Tasks"          value={summary.total_tasks ?? 0}           sub={`${summary.tasks_completed ?? 0} done · ${summary.tasks_pending ?? 0} pending`} color="#16a34a" />
          <Stat icon="⚙️" label="Workflows"     value={summary.total_workflows ?? 0}       sub="sessions run" color="#2563eb" />
          <Stat icon="💬" label="Conversations"  value={summary.total_conversations ?? 0}   sub="chat sessions" color="#0891b2" />
          <Stat icon="🧠" label="Memories"       value={summary.total_memories ?? 0}        sub="agent memory" color="#8b5cf6" />
          <Stat icon="📚" label="Knowledge"      value={summary.total_knowledge_docs ?? 0}  sub="docs + skills" color="#ec4899" />
          <Stat icon="🔍" label="Reflections"    value={summary.total_reflections ?? 0}     sub="quality reviews" color="#f59e0b" />
          <Stat icon="📡" label="Events"         value={summary.total_events ?? 0}          sub="platform events" color="#06b6d4" />
        </div>
      </div>

      {/* Task Breakdown */}
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, padding: 20, marginBottom: 20,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>📋 Task Status Breakdown</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Pending",   value: summary.tasks_pending   ?? 0, color: "#d97706", bg: "#fef9c3" },
            { label: "Running",   value: summary.tasks_running   ?? 0, color: "#2563eb", bg: "#dbeafe" },
            { label: "Completed", value: summary.tasks_completed ?? 0, color: "#16a34a", bg: "#dcfce7" },
            { label: "Failed",    value: summary.tasks_failed    ?? 0, color: "#dc2626", bg: "#fee2e2" },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 8, padding: "8px 16px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
          {/* Progress bar */}
          {(summary.total_tasks ?? 0) > 0 && (
            <div style={{ width: "100%", marginTop: 8 }}>
              <div style={{ height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden", display: "flex" }}>
                {[
                  { v: summary.tasks_completed, c: "#16a34a" },
                  { v: summary.tasks_running,   c: "#2563eb" },
                  { v: summary.tasks_pending,   c: "#d97706" },
                  { v: summary.tasks_failed,    c: "#dc2626" },
                ].map((s, i) => (
                  <div key={i} style={{
                    width: `${((s.v ?? 0) / (summary.total_tasks ?? 1)) * 100}%`,
                    background: s.c, height: "100%",
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                {Math.round(((summary.tasks_completed ?? 0) / (summary.total_tasks ?? 1)) * 100)}% completion rate
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TB KPIs + Timeline side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Triangle Black KPIs */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>🏨 Triangle Black KPIs</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Total Leads",      value: leads.length,      icon: "👥", color: "#3b82f6" },
              { label: "Qualified Leads",  value: qualifiedLeads,    icon: "✅", color: "#16a34a" },
              { label: "Conversion Rate",  value: `${convRate}%`,    icon: "📈", color: "#d97706" },
              { label: "Work Orders",      value: workOrders.length, icon: "🔧", color: "#8b5cf6" },
              { label: "WO Completion",    value: `${woRate}%`,      icon: "✔️", color: "#06b6d4" },
            ].map(kpi => (
              <div key={kpi.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#1e293b", borderRadius: 8, padding: "10px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{kpi.icon}</span>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{kpi.label}</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: kpi.color }}>{kpi.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events Timeline */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>📡 Recent Platform Events</div>
          {timeline.length === 0 ? (
            <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: 24 }}>
              No events yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {timeline.slice(0, 8).map((e: any, i: number) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  borderBottom: "1px solid #1e293b", paddingBottom: 8,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#6366f1", marginTop: 5, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                      {e.event_type ?? e.type ?? "event"}
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>
                      {String(e.created_at ?? e.ts ?? "").slice(0, 16).replace("T", " ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
