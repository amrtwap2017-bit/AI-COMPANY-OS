"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;

export default function WorkspacePage() {
  const router = useRouter();
  const [runningAuto, setRunningAuto] = useState(false);
  const [autoResult, setAutoResult] = useState(null);

  const { data: twin }      = useQuery(["ws-twin"],   () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash }      = useQuery(["ws-dash"],   () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()), { refetchInterval: 60000 });
  const { data: woRaw }     = useQuery(["ws-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: notifRaw }  = useQuery(["ws-notifs"], () => authFetch("/api/v1/notifications/").then(r=>r.json()));
  const { data: pmRaw }     = useQuery(["ws-pms"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: autoStatus, refetch: refetchAuto } = useQuery(["ws-auto"], () => authFetch("/api/v1/automation/status").then(r=>r.json()));

  const wos    = toArr(woRaw);
  const notifs = toArr(notifRaw);
  const pms    = toArr(pmRaw);
  const d      = dash || {};
  const score  = twin?.health_score ?? 0;
  const now    = new Date();

  const pending       = autoStatus?.pending_actions || {};
  const totalPending  = Object.values(pending).reduce((s, v) => s + Number(v), 0);
  const unreadNotifs  = notifs.filter(n => !n.is_read);
  const criticalWOs   = wos.filter(w => w.priority === "critical" && w.status !== "completed");
  const openWOs       = wos.filter(w => w.status === "open");
  const overduePMs    = pms.filter(p => p.next_due_ts && new Date(p.next_due_ts) < now);
  const completedWOs  = wos.filter(w => w.status === "completed");
  const compRate      = wos.length > 0 ? Math.round(completedWOs.length / wos.length * 100) : 0;
  const collRate      = (d.finance?.total_invoices||0) > 0 ? Math.round((d.finance?.paid||0)/(d.finance?.total_invoices||1)*100) : 0;

  const scoreGrade = score >= 98 ? "A+" : score >= 95 ? "A" : score >= 90 ? "A-" : "B+";
  const scoreGlow  = score >= 95 ? "shadow-emerald-500/20" : "shadow-amber-500/20";
  const scoreText  = score >= 95 ? "text-emerald-400" : "text-amber-400";

  const runAutomation = async () => {
    setRunningAuto(true);
    try {
      const res = await authFetch("/api/v1/automation/run", { method: "POST" });
      setAutoResult(await res.json());
      refetchAuto();
    } finally { setRunningAuto(false); }
  };

  const urgentItems = [
    ...criticalWOs.map(w => ({ type:"Critical WO", title:w.title, path:`/operations/work-orders/${w.id}`, color:"red" })),
    ...overduePMs.slice(0,2).map(p => ({ type:"Overdue PM", title:p.title, path:"/maintenance/pm-plans", color:"amber" })),
  ].slice(0, 6);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }} className="px-8 py-8">
        <div className="max-w-content mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span style={{ color: "rgba(148,163,184,0.8)", fontSize:"0.6875rem", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                  Triangle Black — Platform Live
                </span>
              </div>
              <h1 style={{ fontSize:"2.25rem", fontWeight:900, color:"#F1F5F9", letterSpacing:"-0.025em", lineHeight:1.1 }}>
                Platform Command Center
              </h1>
              <p style={{ color:"rgba(148,163,184,0.7)", fontSize:"0.875rem", marginTop:"6px" }}>
                {new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
              </p>
            </div>

            {/* Twin Score — Luxury badge */}
            <div className="flex items-center gap-4">
              {totalPending > 0 && (
                <button onClick={runAutomation} disabled={runningAuto}
                  style={{
                    background: runningAuto ? "rgba(107,114,128,0.3)" : "rgba(180,83,9,0.15)",
                    border: `1px solid ${runningAuto ? "rgba(107,114,128,0.3)" : "rgba(180,83,9,0.4)"}`,
                    color: runningAuto ? "#6B7280" : "#FCD34D",
                    borderRadius:"12px", padding:"10px 20px",
                    fontSize:"0.8125rem", fontWeight:700,
                    transition:"all 150ms ease", cursor: runningAuto ? "not-allowed" : "pointer"
                  }}>
                  {runningAuto ? "⏳ Running..." : `⚡ Run Automation (${totalPending})`}
                </button>
              )}

              {/* Twin score ring */}
              <div style={{
                background: score >= 95 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                border: `1px solid ${score >= 95 ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
                borderRadius:"16px", padding:"16px 24px", textAlign:"center",
                boxShadow: score >= 95 ? "0 0 24px rgba(16,185,129,0.12)" : "0 0 24px rgba(245,158,11,0.12)"
              }}>
                <div style={{ fontSize:"2.5rem", fontWeight:900, lineHeight:1, color: score >= 95 ? "#34D399" : "#FCD34D" }}>
                  {score}
                </div>
                <div style={{ fontSize:"0.625rem", color:"rgba(148,163,184,0.7)", marginTop:"4px", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  Digital Twin
                </div>
                <div style={{ fontSize:"0.6875rem", fontWeight:700, color: score >= 95 ? "#34D399" : "#FCD34D", marginTop:"2px" }}>
                  Grade {scoreGrade}
                </div>
              </div>
            </div>
          </div>

          {/* ── INLINE KPI STRIP ──────────────────────────── */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-8">
            {[
              { label:"Open WOs",        value:openWOs.length,            color:"#60A5FA", path:"/operations/work-orders" },
              { label:"Critical",        value:criticalWOs.length,        color:criticalWOs.length>0?"#F87171":"#34D399", path:"/executive/exceptions" },
              { label:"PM Overdue",      value:overduePMs.length,         color:overduePMs.length>0?"#FBBF24":"#34D399", path:"/maintenance/pm-plans" },
              { label:"Unread Alerts",   value:unreadNotifs.length,       color:"#A78BFA", path:"/inbox" },
              { label:"Contracts",       value:d.commercial?.active_contracts??0, color:"#34D399", path:"/commercial/contracts" },
              { label:"WO Complete",     value:`${compRate}%`,            color:compRate>=80?"#34D399":"#FBBF24", path:"/analytics/scorecards" },
              { label:"Collection",      value:`${collRate}%`,            color:collRate>=85?"#34D399":"#FBBF24", path:"/invoices" },
              { label:"Technicians",     value:d.platform?.technicians??25, color:"#F59E0B", path:"/operations/technicians" },
            ].map((k,i) => (
              <button key={i} onClick={() => router.push(k.path)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius:"12px", padding:"12px 8px",
                  textAlign:"center", cursor:"pointer",
                  transition:"all 150ms ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <div style={{ fontSize:"1.375rem", fontWeight:900, color:k.color, lineHeight:1 }}>{k.value}</div>
                <div style={{ fontSize:"0.625rem", color:"rgba(148,163,184,0.6)", marginTop:"4px", textTransform:"uppercase", letterSpacing:"0.05em" }}>{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="max-w-content mx-auto px-8 py-8 space-y-6">

        {/* Automation success */}
        {autoResult && (
          <div style={{ background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:"16px", padding:"16px 20px" }}
            className="flex items-center gap-4">
            <div className="text-2xl">✅</div>
            <div>
              <div style={{ fontWeight:700, color:"#34D399", fontSize:"0.875rem" }}>
                Automation Complete — {autoResult.total_actions} actions taken
              </div>
              <div style={{ fontSize:"0.75rem", color:"rgba(148,163,184,0.7)", marginTop:"2px" }}>
                {autoResult.wf01_pm_to_wo?.created?.length||0} PM→WO · {autoResult.wf02_contract_renewals?.notified?.length||0} renewals · {autoResult.wf03_stock_auto_pr?.created?.length||0} auto-PRs
              </div>
            </div>
          </div>
        )}

        {/* ── 3-COLUMN GRID ─────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT — Urgent + Automation */}
          <div className="space-y-4">

            {/* Urgent items */}
            <div style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:"20px", padding:"24px" }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--color-text-3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px" }}>
                    Attention Required
                  </div>
                  <div style={{ fontSize:"1rem", fontWeight:700, color:"var(--color-text-1)" }}>Urgent Items</div>
                </div>
                <button onClick={() => router.push("/executive/exceptions")}
                  style={{ fontSize:"0.75rem", color:"var(--color-brand)", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>
                  View all →
                </button>
              </div>

              {urgentItems.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px 0" }}>
                  <div style={{ fontSize:"2.5rem", marginBottom:"12px" }}>✅</div>
                  <div style={{ fontSize:"0.875rem", color:"var(--color-text-2)" }}>All clear — no urgent items</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {urgentItems.map((item, i) => (
                    <button key={i} onClick={() => router.push(item.path)}
                      className="w-full text-left"
                      style={{
                        background: item.color==="red" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                        border: `1px solid ${item.color==="red" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
                        borderRadius:"12px", padding:"12px 14px",
                        transition:"all 150ms ease", cursor:"pointer"
                      }}>
                      <div style={{ fontSize:"0.625rem", fontWeight:700, color:item.color==="red"?"#F87171":"#FCD34D", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"3px" }}>
                        {item.type}
                      </div>
                      <div style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--color-text-1)" }} className="truncate">
                        {item.title}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Automation status */}
            <div style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:"20px", padding:"24px" }}>
              <div className="flex items-center justify-between mb-4">
                <div style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--color-text-1)" }}>Automation Engine</div>
                <button onClick={() => router.push("/workflows/launcher")}
                  style={{ fontSize:"0.75rem", color:"var(--color-brand)", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>
                  Manage →
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(pending).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between" style={{ padding:"8px 0" }}>
                    <span style={{ fontSize:"0.75rem", color:"var(--color-text-2)", textTransform:"capitalize" }}>
                      {key.replace(/wf\d+_/,"").replace(/_/g," ")}
                    </span>
                    <span style={{
                      fontSize:"0.6875rem", fontWeight:700, padding:"2px 8px", borderRadius:"6px",
                      background: val===0 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      color: val===0 ? "#34D399" : "#FCD34D",
                      border: `1px solid ${val===0 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`
                    }}>
                      {val===0 ? "✓ OK" : `${val} pending`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER + RIGHT — Domain health + Recent activity */}
          <div className="xl:col-span-2 space-y-5">

            {/* Domain health grid */}
            <div style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:"20px", padding:"24px" }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--color-text-3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px" }}>
                    Digital Twin
                  </div>
                  <div style={{ fontSize:"1rem", fontWeight:700, color:"var(--color-text-1)" }}>Domain Health</div>
                </div>
                <button onClick={() => router.push("/executive/intelligence")}
                  style={{ fontSize:"0.75rem", color:"var(--color-brand)", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>
                  Full intelligence →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { domain:"Operations",  metric:`${openWOs.length} open WOs`,              health:compRate,   path:"/operations" },
                  { domain:"Maintenance", metric:`${overduePMs.length} overdue PM`,          health:overduePMs.length===0?100:Math.max(0,100-overduePMs.length*10), path:"/maintenance" },
                  { domain:"Commercial",  metric:`${d.commercial?.active_contracts??0} active`, health:85,      path:"/commercial" },
                  { domain:"Finance",     metric:`${collRate}% collected`,                   health:collRate,  path:"/invoices" },
                  { domain:"Supply Chain",metric:`${d.procurement?.purchase_requests??0} PRs`,health:80,       path:"/supply-chain" },
                  { domain:"Platform",   metric:`${score}/100 twin score`,                   health:score,     path:"/executive/intelligence" },
                ].map((item,i) => {
                  const h = item.health;
                  const hColor = h>=80?"#34D399":h>=60?"#FBBF24":"#F87171";
                  const hBg = h>=80?"rgba(16,185,129,0.06)":h>=60?"rgba(245,158,11,0.06)":"rgba(239,68,68,0.06)";
                  const hBorder = h>=80?"rgba(16,185,129,0.2)":h>=60?"rgba(245,158,11,0.2)":"rgba(239,68,68,0.2)";
                  return (
                    <button key={i} onClick={() => router.push(item.path)}
                      className="text-left"
                      style={{
                        background:hBg, border:`1px solid ${hBorder}`, borderRadius:"14px",
                        padding:"16px", transition:"all 150ms ease", cursor:"pointer"
                      }}>
                      <div className="flex items-center justify-between mb-2">
                        <div style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--color-text-1)" }}>{item.domain}</div>
                        <div style={{ fontSize:"0.75rem", fontWeight:900, color:hColor }}>{h>=80?"✓":h>=60?"!":"✗"}</div>
                      </div>
                      <div style={{ fontSize:"1.25rem", fontWeight:900, color:hColor, lineHeight:1 }}>{h}%</div>
                      <div style={{ fontSize:"0.6875rem", color:"var(--color-text-3)", marginTop:"4px" }}>{item.metric}</div>
                      <div style={{ marginTop:"8px", height:"3px", background:"rgba(0,0,0,0.1)", borderRadius:"99px", overflow:"hidden" }}>
                        <div style={{ height:"3px", background:hColor, borderRadius:"99px", width:`${Math.min(h,100)}%`, transition:"width 600ms ease" }}/>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent work orders */}
            <div style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:"20px", overflow:"hidden" }}>
              <div className="flex items-center justify-between" style={{ padding:"20px 24px", borderBottom:"1px solid var(--color-divider)" }}>
                <div>
                  <div style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--color-text-3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px" }}>
                    Live Queue
                  </div>
                  <div style={{ fontSize:"1rem", fontWeight:700, color:"var(--color-text-1)" }}>Recent Work Orders</div>
                </div>
                <button onClick={() => router.push("/operations/work-orders")}
                  style={{ fontSize:"0.75rem", color:"var(--color-brand)", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>
                  All {wos.length} →
                </button>
              </div>

              <div>
                {wos.slice(0,6).map((w,i) => {
                  const pColor = w.priority==="critical"?"#F87171":w.priority==="high"?"#FB923C":w.priority==="medium"?"#FBBF24":"rgba(148,163,184,0.5)";
                  const sColor = w.status==="completed"?"#34D399":w.status==="in_progress"?"#FBBF24":"rgba(96,165,250,0.8)";
                  return (
                    <button key={i} onClick={() => router.push(`/operations/work-orders/${w.id}`)}
                      className="w-full text-left flex items-center gap-4"
                      style={{
                        padding:"14px 24px",
                        borderBottom: i<5 ? "1px solid var(--color-divider)" : "none",
                        transition:"background 120ms ease", cursor:"pointer",
                        background:"transparent"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(180,83,9,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ width:"3px", height:"32px", background:pColor, borderRadius:"99px", flexShrink:0 }}/>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--color-text-1)" }} className="truncate">{w.title}</div>
                        <div style={{ fontSize:"0.6875rem", color:"var(--color-text-3)", marginTop:"2px" }}>
                          {w.type||"corrective"} · {w.priority}
                        </div>
                      </div>
                      <div style={{
                        fontSize:"0.6875rem", fontWeight:700, padding:"3px 10px", borderRadius:"6px", flexShrink:0,
                        background: w.status==="completed"?"rgba(16,185,129,0.1)":w.status==="in_progress"?"rgba(245,158,11,0.1)":"rgba(96,165,250,0.1)",
                        color: sColor
                      }}>
                        {w.status}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── QUICK ACCESS ──────────────────────────────────── */}
        <div style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:"20px", padding:"24px" }}>
          <div style={{ fontSize:"0.6875rem", fontWeight:700, color:"var(--color-text-3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"16px" }}>
            Quick Access
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 xl:grid-cols-10 gap-2">
            {[
              { label:"My Day",      icon:"☀️",  path:"/workspace/my-day" },
              { label:"Work Orders", icon:"🔧",  path:"/operations/work-orders" },
              { label:"Dispatch",    icon:"👷",  path:"/operations/dispatch" },
              { label:"PM Plans",    icon:"📅",  path:"/maintenance/pm-plans" },
              { label:"Assets",      icon:"🏗️",  path:"/maintenance/assets" },
              { label:"Contracts",   icon:"📄",  path:"/commercial/contracts" },
              { label:"Invoices",    icon:"💰",  path:"/invoices" },
              { label:"Procurement", icon:"📦",  path:"/supply-chain" },
              { label:"Analytics",   icon:"📊",  path:"/analytics" },
              { label:"Automation",  icon:"⚡",  path:"/workflows/launcher" },
            ].map((a,i) => (
              <button key={i} onClick={() => router.push(a.path)}
                className="flex flex-col items-center gap-2"
                style={{
                  padding:"14px 8px", borderRadius:"14px",
                  background:"transparent", border:"1px solid transparent",
                  transition:"all 150ms ease", cursor:"pointer"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(180,83,9,0.06)"; e.currentTarget.style.borderColor = "rgba(180,83,9,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
              >
                <span style={{ fontSize:"1.375rem" }}>{a.icon}</span>
                <span style={{ fontSize:"0.625rem", fontWeight:600, color:"var(--color-text-3)", textAlign:"center", lineHeight:"1.3" }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
