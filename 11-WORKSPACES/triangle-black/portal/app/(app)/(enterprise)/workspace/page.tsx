"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();

const CENTERS = [
  {
    icon:"🔧", label:"Operations",       path:"/operations/work-orders",
    desc:"Work orders, dispatch, maintenance", color:"#B07A2A",
    sub:["Work Orders","/operations/work-orders","Dispatch Board","/operations/dispatch","Maintenance","/operations/maintenance"]
  },
  {
    icon:"🏗️", label:"Procurement",      path:"/supply-chain/procurement",
    desc:"P2P: SOW→RFQ→PO→GRN→Invoice", color:"#B07A2A",
    sub:["Vendors","/supply-chain/vendor-management","RFQs","/supply-chain/rfq-management","Purchase Orders","/supply-chain/purchase-orders-v2"]
  },
  {
    icon:"💰", label:"Financial",         path:"/financial",
    desc:"P&L, invoices, aged receivables", color:"#547C4D",
    sub:["P&L Dashboard","/financial","Invoices","/supply-chain/invoices","Reports","/reports"]
  },
  {
    icon:"📊", label:"Reports",           path:"/reports",
    desc:"12 report types — CSV + PDF", color:"#5B7C8C",
    sub:["Report Center","/reports","Work Orders","/reports","Invoices","/reports"]
  },
  {
    icon:"📅", label:"Maintenance",       path:"/operations/maintenance",
    desc:"PM scheduler, asset calendar", color:"#8D7443",
    sub:["Schedule","/operations/maintenance","Asset QR","/operations/assets/qr","Assets","/maintenance/assets"]
  },
  {
    icon:"📈", label:"Executive",         path:"/executive/dashboard",
    desc:"Live KPIs, alerts, decisions", color:"#B07A2A",
    sub:["Dashboard","/executive/dashboard","Financial P&L","/financial","Notifications","/notifications"]
  },
  {
    icon:"🏨", label:"Client Portal",     path:"/client-portal",
    desc:"Hotel clients — light theme", color:"#059669",
    sub:["Login","/client-portal","Dashboard","/client-portal/dashboard","Raise Request","/client-portal/request"]
  },
  {
    icon:"🏭", label:"Supplier Portal",   path:"/supplier-portal",
    desc:"Vendors — bids, POs, invoices", color:"#D97706",
    sub:["Login","/supplier-portal","Dashboard","/supplier-portal/dashboard","RFQs","/supplier-portal/rfqs"]
  },
];

const QUICK_ACTIONS = [
  {icon:"🔧",label:"New Work Order",    path:"/operations/work-orders/new",   color:"#B07A2A"},
  {icon:"🎫",label:"Service Request",   path:"/operations/service-requests",   color:"#5B7C8C"},
  {icon:"📋",label:"Dispatch Board",    path:"/operations/dispatch",            color:"#8D7443"},
  {icon:"📦",label:"Purchase Orders",   path:"/supply-chain/purchase-orders-v2",color:"#B07A2A"},
  {icon:"📄",label:"Invoices",          path:"/supply-chain/invoices",          color:"#547C4D"},
  {icon:"📱",label:"Asset QR Codes",    path:"/operations/assets/qr",          color:"#B07A2A"},
];

export default function WorkspacePage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: execDash } = useQuery(
    ["workspace-exec"],
    () => authFetch("/api/v1/executive/dashboard").then(r=>r.json()),
    { staleTime: 60000 }
  );

  const { data: wos } = useQuery(
    ["workspace-wos"],
    () => authFetch("/api/v1/work-orders/?limit=5").then(r=>r.json()),
    { staleTime: 30000 }
  );

  const { data: notifs } = useQuery(
    ["workspace-notifs"],
    () => authFetch("/api/v1/platform-notif/?limit=5").then(r=>r.json()),
    { staleTime: 30000 }
  );

  const { data: invDash } = useQuery(
    ["workspace-inv"],
    () => authFetch("/api/v1/supplier-invoices/dashboard").then(r=>r.json()),
    { staleTime: 60000 }
  );

  const ops = execDash?.operations?.work_orders || {};
  const alerts = execDash?.alerts || {};
  const invTotals = invDash?.totals || {};
  const recentWOs = Array.isArray(wos) ? wos : [];
  const recentNotifs = notifs?.notifications || [];
  const unreadCount = notifs?.unread_count || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {weekday:"long",day:"numeric",month:"long",year:"numeric"});

  const PC = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#547C4D"};
  const SC = {open:"#5B7C8C",in_progress:"#B07A2A",completed:"#547C4D"};

  return (
    <div className="min-h-screen bg-base">

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="mb-6">
            <div className="text-label-upper text-emerald-400 mb-1">Triangle Black Engineering Services</div>
            <h1 className="text-3xl font-black text-white mb-1">{greeting}, {user?.name?.split(" ")[0] || "Amr"}!</h1>
            <p className="text-slate-400 text-sm">{today}</p>
          </div>

          {/* Live KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Open Work Orders",  value:ops.open_count||0,    sub:`${ops.critical_open||0} critical`,   color:"#5B7C8C",  path:"/operations/work-orders"},
              {label:"Outstanding",        value:fmtEGP(invTotals.total_outstanding||0), sub:"invoices payable", color:"#B07A2A",  path:"/supply-chain/invoices"},
              {label:"Pending Approvals",  value:ops.overdue||0,       sub:"action required",  color:alerts.total_alerts>0?"#A84A3D":"#547C4D", path:"/supply-chain/approvals-center"},
              {label:"Platform Alerts",    value:alerts.total_alerts||0,sub:`${unreadCount} notifications`,color:alerts.total_alerts>0?"#A84A3D":"#547C4D",path:"/notifications"},
            ].map((k,i)=>(
              <button key={i} onClick={()=>router.push(k.path)} className="tb-hero-kpi text-left hover:opacity-80 transition-opacity">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1.4rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
                <div className="text-xs opacity-50 mt-0.5">{k.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas space-y-6">

        {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
        <div className="tb-section">
          <div className="tb-section-title">Quick Actions</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
            {QUICK_ACTIONS.map((action,i)=>(
              <button key={i} onClick={()=>router.push(action.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border hover:border-brand/40 transition-all group"
                style={{background:"rgba(255,255,255,0.02)"}}>
                <span style={{fontSize:"1.75rem"}}>{action.icon}</span>
                <span className="text-xs font-semibold text-secondary text-center leading-tight group-hover:text-primary transition-colors">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── PLATFORM CENTERS ──────────────────────────────────────────── */}
        <div className="tb-section">
          <div className="tb-section-title">Platform Modules</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-3">
            {CENTERS.map((center,i)=>(
              <div key={i} className="rounded-2xl border border-border overflow-hidden"
                   style={{background:"rgba(255,255,255,0.02)"}}>
                {/* Center header — clickable */}
                <button onClick={()=>router.push(center.path)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-base-alt transition-colors text-left">
                  <span style={{fontSize:"1.75rem"}}>{center.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-primary">{center.label}</div>
                    <div className="text-xs text-tertiary mt-0.5">{center.desc}</div>
                  </div>
                  <span className="text-brand text-xs flex-shrink-0">→</span>
                </button>
                {/* Sub links */}
                <div className="border-t border-border px-4 py-2 flex flex-wrap gap-2">
                  {center.sub.reduce((acc, val, idx) => {
                    if (idx % 2 === 0) acc.push([val, center.sub[idx+1]]);
                    return acc;
                  }, []).map(([label, path], si)=>(
                    <button key={si} onClick={()=>router.push(path)}
                      className="text-xs text-tertiary hover:text-brand transition-colors py-1">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECENT ACTIVITY + NOTIFICATIONS ───────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Recent Work Orders */}
          <div className="tb-section">
            <div className="tb-flex-between mb-3">
              <div className="tb-section-title" style={{marginBottom:0}}>Recent Work Orders</div>
              <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand">View all →</button>
            </div>
            {recentWOs.length === 0 ? (
              <div className="tb-empty" style={{padding:"24px"}}><div className="tb-empty-icon">🔧</div><div className="tb-empty-title">No work orders</div></div>
            ) : (
              <div className="space-y-2">
                {recentWOs.map((wo,i)=>{
                  const pc = PC[wo.priority]||"#6D5F53";
                  const sc = SC[wo.status]||"#6D5F53";
                  return (
                    <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:pc}}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{wo.title}</div>
                        <div className="text-xs text-tertiary">{wo.type} · {wo.priority}</div>
                      </div>
                      <span className="tb-badge flex-shrink-0" style={{background:sc+"18",color:sc,fontSize:"0.5rem"}}>{(wo.status||"").replace(/_/g," ")}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="tb-section">
            <div className="tb-flex-between mb-3">
              <div className="tb-section-title" style={{marginBottom:0}}>
                Notifications
                {unreadCount > 0 && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 font-bold">{unreadCount} new</span>}
              </div>
              <button onClick={()=>router.push("/notifications")} className="text-xs text-brand">View all →</button>
            </div>
            {recentNotifs.length === 0 ? (
              <div className="tb-empty" style={{padding:"24px"}}>
                <div className="tb-empty-icon">🔔</div>
                <div className="tb-empty-title">No notifications</div>
                <button onClick={()=>authFetch("/api/v1/platform-notif/generate",{method:"POST"}).then(()=>window.location.reload())}
                  className="tb-btn-primary mt-3" style={{fontSize:"0.7rem",padding:"6px 12px"}}>
                  ⚡ Scan Platform
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotifs.map((notif,i)=>{
                  const typeColor = notif.type==="alert"?"#A84A3D":notif.type==="warning"?"#B07A2A":notif.type==="success"?"#547C4D":"#5B7C8C";
                  const typeIcon = notif.type==="alert"?"🚨":notif.type==="warning"?"⚠️":notif.type==="success"?"✅":"ℹ️";
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-base-alt"
                         style={{opacity:notif.is_read?0.6:1}}>
                      <span>{typeIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{notif.title}</div>
                        <div className="text-xs text-tertiary truncate">{notif.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── PORTAL ACCESS ─────────────────────────────────────────────── */}
        <div className="tb-section">
          <div className="tb-section-title">External Portals</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {[
              {
                icon:"🏨", title:"Client Portal",
                desc:"Hotel clients view their work orders, raise requests, approve SOWs",
                path:"/client-portal", color:"#059669",
                hint:"PIN: 1234 | ahmed.fouad@nileplaza.com"
              },
              {
                icon:"🏭", title:"Supplier Portal",
                desc:"Vendors submit quotes, view POs, upload invoices, manage documents",
                path:"/supplier-portal", color:"#D97706",
                hint:"PIN: 1234 | info@arctic-hvac.com"
              },
            ].map((portal,i)=>(
              <button key={i} onClick={()=>router.push(portal.path)}
                className="flex items-start gap-4 p-5 rounded-2xl border border-border hover:border-brand/40 transition-all text-left"
                style={{background:"rgba(255,255,255,0.02)"}}>
                <span style={{fontSize:"2.5rem"}}>{portal.icon}</span>
                <div className="flex-1">
                  <div className="text-base font-bold text-primary mb-1">{portal.title}</div>
                  <div className="text-sm text-secondary mb-2">{portal.desc}</div>
                  <div className="text-xs text-tertiary font-mono">{portal.hint}</div>
                  <div className="mt-3 text-xs font-bold" style={{color:portal.color}}>Open Portal →</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── BUILT WITH ────────────────────────────────────────────────── */}
        <div className="tb-section" style={{background:"rgba(255,255,255,0.01)"}}>
          <div className="text-xs text-tertiary text-center">
            Triangle Black Engineering Services · MEP & Facilities Management Platform<br/>
            Built with Next.js 14 + FastAPI + PostgreSQL + Qwen AI · Sprints 245–262 · Twin Health: 95/100
          </div>
        </div>
      </div>
    </div>
  );
}
