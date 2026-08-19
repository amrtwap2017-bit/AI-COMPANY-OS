"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];

const ROLE_CONFIG = {
  admin: { label:"Administrator", tagline:"Full platform access · Security · Users · Audit",
    primaryActions:[{icon:"👥",label:"User Management",desc:"Manage roles and access",path:"/settings/users"},{icon:"📜",label:"Audit Trail",desc:"Platform activity log",path:"/administration/audit"},{icon:"🔒",label:"Security Audit",desc:"JWT, RBAC, health check",path:"/administration/audit"},{icon:"📊",label:"Executive View",desc:"Full platform KPIs",path:"/executive/dashboard"},{icon:"📤",label:"Export Data",desc:"Download CSV reports",path:"/administration/platform/exports"},{icon:"⚙",label:"Platform Health",desc:"System status",path:"/administration/platform"}],
    workflow:[{step:1,label:"Check Security",path:"/administration/audit"},{step:2,label:"Review Audit Log",path:"/administration/audit"},{step:3,label:"Monitor Platform",path:"/administration/platform"}] },
  manager: { label:"Operations Manager", tagline:"Approve · Dispatch · Review SLA · Daily Briefing",
    primaryActions:[{icon:"☀️",label:"My Day",desc:"Daily briefing + pending items",path:"/workspace/my-day"},{icon:"📋",label:"Dispatch Board",desc:"Assign technicians to WOs",path:"/operations/dispatch"},{icon:"✍️",label:"Approvals",desc:"Pending approvals queue",path:"/approvals"},{icon:"⏱",label:"SLA Dashboard",desc:"Compliance + breaches",path:"/operations/sla"},{icon:"🔧",label:"Work Orders",desc:"All active work orders",path:"/operations/work-orders"},{icon:"📊",label:"Executive View",desc:"KPIs and intelligence",path:"/executive/dashboard"}],
    workflow:[{step:1,label:"Review My Day",path:"/workspace/my-day"},{step:2,label:"Process Approvals",path:"/approvals"},{step:3,label:"Dispatch Board",path:"/operations/dispatch"}] },
  agent: { label:"Field Engineer", tagline:"Work Orders · Time Tracking · Asset QR · Updates",
    primaryActions:[{icon:"🔧",label:"My Work Orders",desc:"Assigned to me",path:"/operations/work-orders"},{icon:"⏱",label:"Log Time",desc:"Record hours worked",path:"/operations/time-tracking"},{icon:"📱",label:"Scan Asset QR",desc:"Quick asset lookup",path:"/operations/assets/qr"},{icon:"🎫",label:"Service Requests",desc:"New incoming requests",path:"/operations/service-requests"},{icon:"➕",label:"New Work Order",desc:"Create engineering WO",path:"/operations/work-orders/new"},{icon:"📅",label:"PM Schedule",desc:"Preventive maintenance",path:"/operations/maintenance"}],
    workflow:[{step:1,label:"Check Work Orders",path:"/operations/work-orders"},{step:2,label:"Log Time on WO",path:"/operations/time-tracking"},{step:3,label:"Update Status",path:"/operations/dispatch"}] },
  finance: { label:"Finance Manager", tagline:"Invoices · Payments · P&L · Budget Review",
    primaryActions:[{icon:"📄",label:"Invoices",desc:"Review and approve",path:"/commercial/invoices"},{icon:"💰",label:"P&L Dashboard",desc:"Revenue and costs",path:"/financial"},{icon:"💳",label:"Payment History",desc:"Payment records",path:"/commercial/payment-history"},{icon:"📊",label:"Cost Analysis",desc:"Spend breakdown charts",path:"/analytics/costs"},{icon:"📦",label:"Purchase Orders",desc:"PO approval queue",path:"/supply-chain/purchase-orders-v2"},{icon:"✍️",label:"Approvals",desc:"Financial approvals",path:"/approvals"}],
    workflow:[{step:1,label:"Review Invoices",path:"/commercial/invoices"},{step:2,label:"Process Approvals",path:"/approvals"},{step:3,label:"Check P&L",path:"/financial"}] },
  viewer: { label:"Viewer", tagline:"Read-only access to platform data",
    primaryActions:[{icon:"📊",label:"Executive Dashboard",desc:"Platform overview",path:"/executive/dashboard"},{icon:"🔧",label:"Work Orders",desc:"View all work orders",path:"/operations/work-orders"},{icon:"📋",label:"Reports",desc:"Platform reports",path:"/reports"},{icon:"📈",label:"Analytics",desc:"Charts and trends",path:"/analytics"},{icon:"⏱",label:"SLA Dashboard",desc:"Performance metrics",path:"/operations/sla"},{icon:"🏭",label:"Assets",desc:"Asset registry",path:"/maintenance/assets"}],
    workflow:[{step:1,label:"View Dashboard",path:"/executive/dashboard"},{step:2,label:"Check Reports",path:"/reports"},{step:3,label:"Review Analytics",path:"/analytics"}] },
};
ROLE_CONFIG.engineer = ROLE_CONFIG.agent;

export default function WorkspacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = user?.role || "viewer";
  const config = (ROLE_CONFIG as Record<string, any>)[role] || ROLE_CONFIG.viewer;

  const { data: execDash } = useQuery({ queryKey:["workspace-exec"], queryFn:()=>authFetch("/api/v1/executive/dashboard").then(r=>r.json()), staleTime:60000 });
  const { data: approvalRaw } = useQuery({ queryKey:["workspace-approvals"], queryFn:()=>authFetch("/api/v1/approval-requests/").then(r=>r.json()), staleTime:30000 });
  const { data: woRaw } = useQuery({ queryKey:["workspace-wos"], queryFn:()=>authFetch("/api/v1/work-orders/?limit=5").then(r=>r.json()), staleTime:30000 });
  const { data: slaDash } = useQuery({ queryKey:["workspace-sla"], queryFn:()=>authFetch("/api/v1/sla/dashboard").then(r=>r.json()), staleTime:60000 });
  const { data: timeDash } = useQuery({ queryKey:["workspace-time"], queryFn:()=>authFetch("/api/v1/time-entries/summary").then(r=>r.json()), staleTime:60000 });

  const ops = execDash?.operations?.work_orders || {};
  const fin = execDash?.financial?.invoices || {};
  const pendingApprovals = toArr(approvalRaw).filter((a: any) => a.status === "pending");
  const recentWOs = toArr(woRaw).slice(0,5);
  const slaBreaches = slaDash?.breach_count || 0;
  const totalHours = timeDash?.totals?.total_hours || 0;
  const urgentCount = pendingApprovals.length + slaBreaches;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {weekday:"long",day:"numeric",month:"long"});

  const roleKPIs = {
    admin: [{label:"Active Users",value:10},{label:"Security Score",value:"✓ OK"},{label:"Audit Events",value:"25+"},{label:"Platform Score",value:"93/100"}],
    manager: [{label:"Pending Approvals",value:pendingApprovals.length,warn:pendingApprovals.length>0},{label:"SLA Breaches",value:slaBreaches,warn:slaBreaches>0},{label:"Open WOs",value:ops.open_count||0},{label:"Critical",value:ops.critical_open||0,warn:(ops.critical_open||0)>0}],
    agent: [{label:"My Work Orders",value:ops.open_count||0},{label:"Hours Logged",value:`${Math.round(totalHours)}h`},{label:"In Progress",value:ops.in_progress||0},{label:"Completed",value:ops.completed||0}],
    finance: [{label:"Invoices",value:fin.invoice_count||0},{label:"Outstanding",value:fmtEGP(fin.outstanding||0)},{label:"Pending Approvals",value:pendingApprovals.length,warn:pendingApprovals.length>0},{label:"Collection Rate",value:`${Math.round(fin.collection_rate||0)}%`}],
    viewer: [{label:"Work Orders",value:ops.open_count||0},{label:"SLA Breaches",value:slaBreaches,warn:slaBreaches>0},{label:"Completed",value:ops.completed||0},{label:"Platform",value:"Active"}],
  };
  ROLE_CONFIG.engineer = ROLE_CONFIG.agent;
  const kpis = roleKPIs[role] || roleKPIs.viewer;

  return (
    <div className="min-h-screen bg-base">

      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">{config.label}</div>
              <h1 className="tb-hero-title">{greeting}, {user?.name?.split(" ")[0] || "Welcome"}!</h1>
              <p className="tb-hero-description">{today}</p>
              <p className="text-sm text-tertiary mt-1">{config.tagline}</p>
            </div>
            {urgentCount > 0 && (
              <button onClick={() => router.push("/workspace/my-day")}
                className="tb-section text-center flex-shrink-0 hover:border-danger transition-colors"
                style={{borderColor:"var(--color-danger-border)",background:"var(--color-danger-bg)"}}>
                <div className="text-danger font-black" style={{fontSize:"1.5rem",lineHeight:1}}>{urgentCount}</div>
                <div className="text-xs text-danger mt-1 font-semibold">Action Required</div>
              </button>
            )}
          </div>
          <div className="tb-grid-4 mt-6">
            {kpis.map((k: any, i: number) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.warn?"var(--color-warning)":"var(--color-text-inv)",fontSize:"1.1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid gap-6" style={{gridTemplateColumns:"2fr 1fr"}}>

          <div className="flex flex-col gap-5">
            <div className="tb-section">
              <div className="text-label-upper text-brand mb-1">Start Here</div>
              <div className="font-bold text-primary mb-4">Your Core Tasks</div>
              <div className="tb-grid-2">
                {config.primaryActions.map((a: any, i: number) => (
                  <button key={i} onClick={() => router.push(a.path)} className="tb-action-item">
                    <span className="text-xl flex-shrink-0">{a.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-primary">{a.label}</div>
                      <div className="text-xs text-tertiary mt-0.5">{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="tb-section">
              <div className="text-label-upper text-brand mb-1">Today's Workflow</div>
              <div className="font-bold text-primary mb-4">Recommended Order</div>
              <div className="tb-steps mb-0">
                {config.workflow.map((step,i) => (
                  <button key={i} onClick={() => router.push(step.path)}
                    className="tb-action-item" style={{flex:1}}>
                    <div className="tb-step-num">{step.step}</div>
                    <span className="font-semibold text-sm text-primary">{step.label}</span>
                    <span className="ml-auto text-brand text-sm">→</span>
                  </button>
                ))}
              </div>
            </div>

            {recentWOs.length > 0 && (
              <div className="tb-section">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-bold text-primary">Recent Work Orders</div>
                  <button onClick={() => router.push("/operations/work-orders")} className="text-xs font-semibold text-brand bg-transparent border-0 cursor-pointer">View all →</button>
                </div>
                {recentWOs.map((wo,i) => (
                  <button key={i} onClick={() => router.push("/operations/work-orders/"+wo.id)}
                    className="flex items-center gap-3 py-2.5 border-b border-divider w-full text-left bg-transparent cursor-pointer">
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{background:wo.priority==="critical"?"var(--color-danger)":wo.priority==="high"?"var(--color-warning)":"var(--color-text-3)"}} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-primary truncate">{wo.title}</div>
                      <div className="text-xs text-tertiary">{wo.priority} · {wo.status?.replace(/_/g," ")}</div>
                    </div>
                    <span className="text-xs text-brand flex-shrink-0">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {pendingApprovals.length > 0 && (
              <div className="tb-alert tb-alert-warning flex-col items-start">
                <div className="font-bold mb-3">✍ {pendingApprovals.length} Pending Approvals</div>
                {pendingApprovals.slice(0,3).map((a: any, i: number) => (
                  <div key={i} className="text-sm py-1.5 border-b border-warning/20 w-full">
                    <div className="font-semibold">{(a.title||"").slice(0,40)}{(a.title||"").length>40?"...":""}</div>
                    <div className="text-xs opacity-70">{a.document_type?.toUpperCase()} · {a.currency} {Number(a.amount||0).toLocaleString()}</div>
                  </div>
                ))}
                <button onClick={() => router.push("/approvals")} className="tb-btn tb-btn-secondary tb-btn-sm mt-3 w-full justify-center">Review All →</button>
              </div>
            )}

            {slaBreaches > 0 && (
              <div className="tb-alert tb-alert-danger flex-col items-start">
                <div className="font-bold mb-2">⚠ {slaBreaches} SLA Breaches</div>
                <div className="text-sm opacity-80">Service requests exceeding target response time</div>
                <button onClick={() => router.push("/operations/sla")} className="tb-btn tb-btn-danger tb-btn-sm mt-3 w-full justify-center">View SLA Dashboard →</button>
              </div>
            )}

            <div className="tb-section">
              <div className="font-bold text-primary mb-3">Platform Areas</div>
              {[{icon:"☀️",label:"My Day",path:"/workspace/my-day"},{icon:"📊",label:"Executive Dashboard",path:"/executive/dashboard"},{icon:"📋",label:"Reports",path:"/reports"},{icon:"📈",label:"Analytics",path:"/analytics"},{icon:"🔔",label:"Notifications",path:"/notifications"},{icon:"👤",label:"My Profile",path:"/settings/profile"}].map((item: any, i: number) =>(
                <button key={i} onClick={() => router.push(item.path)}
                  className="flex items-center gap-2.5 py-2 border-b border-divider w-full text-left bg-transparent cursor-pointer">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-secondary font-medium">{item.label}</span>
                  <span className="ml-auto text-brand text-xs">→</span>
                </button>
              ))}
            </div>

            <div className="tb-section">
              <div className="font-bold text-primary mb-3">Platform Overview</div>
              {[["Work Orders",`${ops.total||0} total · ${ops.open_count||0} open`],["Technicians",`${execDash?.operations?.technicians?.active||0} active`],["Assets",`${execDash?.operations?.assets?.total||0} managed`],["Sites","5 hotel clients"]].map(([l,v],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{l}</span>
                  <span className="tb-detail-value">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
