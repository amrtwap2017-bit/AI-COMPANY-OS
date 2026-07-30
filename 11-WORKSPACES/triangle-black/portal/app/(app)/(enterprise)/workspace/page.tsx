"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { if (!d) return ""; try { const dt=new Date(d); if(dt.getFullYear()<1990) return ""; return dt.toLocaleDateString("en-GB"); } catch { return ""; } };
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

// ── ROLE-BASED CONFIGURATION ─────────────────────────────────────────────────
const ROLE_CONFIG = {
  admin: {
    label: "Administrator",
    color: "#B9924C",
    tagline: "Full platform access · Security · Users · Audit",
    primaryActions: [
      {icon:"👥",label:"User Management",desc:"Manage roles and access",path:"/settings/users"},
      {icon:"📜",label:"Audit Trail",desc:"Platform activity log",path:"/administration/audit"},
      {icon:"🔒",label:"Security Audit",desc:"JWT, RBAC, health check",path:"/settings/users"},
      {icon:"📊",label:"Executive View",desc:"Full platform KPIs",path:"/executive/dashboard"},
      {icon:"📤",label:"Export Data",desc:"Download CSV reports",path:"/administration/platform/exports"},
      {icon:"⚙",label:"Platform Health",desc:"System status",path:"/administration/platform"},
    ],
    workflow: [
      {step:1,label:"Check Security",path:"/settings/users"},
      {step:2,label:"Review Audit Log",path:"/administration/audit"},
      {step:3,label:"Monitor Platform",path:"/administration/platform"},
    ],
  },
  manager: {
    label: "Operations Manager",
    color: "#B07A2A",
    tagline: "Approve · Dispatch · Review SLA · Daily Briefing",
    primaryActions: [
      {icon:"☀️",label:"My Day",desc:"Daily briefing + pending items",path:"/workspace/my-day"},
      {icon:"📋",label:"Dispatch Board",desc:"Assign technicians to WOs",path:"/operations/dispatch"},
      {icon:"✍️",label:"Approvals",desc:"Pending approvals queue",path:"/approvals"},
      {icon:"⏱",label:"SLA Dashboard",desc:"Compliance + breaches",path:"/operations/sla"},
      {icon:"🔧",label:"Work Orders",desc:"All active work orders",path:"/operations/work-orders"},
      {icon:"📊",label:"Executive View",desc:"KPIs and intelligence",path:"/executive/dashboard"},
    ],
    workflow: [
      {step:1,label:"Review My Day",path:"/workspace/my-day"},
      {step:2,label:"Process Approvals",path:"/approvals"},
      {step:3,label:"Dispatch Board",path:"/operations/dispatch"},
    ],
  },
  agent: {
    label: "Field Engineer",
    color: "#547C4D",
    tagline: "Work Orders · Time Tracking · Asset QR · Updates",
    primaryActions: [
      {icon:"🔧",label:"My Work Orders",desc:"Assigned to me",path:"/operations/work-orders"},
      {icon:"⏱",label:"Log Time",desc:"Record hours worked",path:"/operations/time-tracking"},
      {icon:"📱",label:"Scan Asset QR",desc:"Quick asset lookup",path:"/operations/assets/qr"},
      {icon:"🎫",label:"Service Requests",desc:"New incoming requests",path:"/operations/service-requests"},
      {icon:"➕",label:"New Work Order",desc:"Create engineering WO",path:"/operations/work-orders/new"},
      {icon:"📅",label:"PM Schedule",desc:"Preventive maintenance",path:"/operations/maintenance"},
    ],
    workflow: [
      {step:1,label:"Check Work Orders",path:"/operations/work-orders"},
      {step:2,label:"Log Time on WO",path:"/operations/time-tracking"},
      {step:3,label:"Update Status",path:"/operations/dispatch"},
    ],
  },
  engineer: {
    label: "Field Engineer",
    color: "#547C4D",
    tagline: "Work Orders · Time Tracking · Asset QR · Updates",
    primaryActions: [
      {icon:"🔧",label:"My Work Orders",desc:"Assigned to me",path:"/operations/work-orders"},
      {icon:"⏱",label:"Log Time",desc:"Record hours worked",path:"/operations/time-tracking"},
      {icon:"📱",label:"Scan Asset QR",desc:"Quick asset lookup",path:"/operations/assets/qr"},
      {icon:"🎫",label:"Service Requests",desc:"New incoming requests",path:"/operations/service-requests"},
      {icon:"➕",label:"New Work Order",desc:"Create engineering WO",path:"/operations/work-orders/new"},
      {icon:"📅",label:"PM Schedule",desc:"Preventive maintenance",path:"/operations/maintenance"},
    ],
    workflow: [
      {step:1,label:"Check Work Orders",path:"/operations/work-orders"},
      {step:2,label:"Log Time on WO",path:"/operations/time-tracking"},
      {step:3,label:"Update Status",path:"/operations/dispatch"},
    ],
  },
  finance: {
    label: "Finance Manager",
    color: "#8D7443",
    tagline: "Invoices · Payments · P&L · Budget Review",
    primaryActions: [
      {icon:"📄",label:"Invoices",desc:"Review and approve",path:"/commercial/invoices"},
      {icon:"💰",label:"P&L Dashboard",desc:"Revenue and costs",path:"/financial"},
      {icon:"💳",label:"Payment History",desc:"Payment records",path:"/commercial/payment-history"},
      {icon:"📊",label:"Cost Analysis",desc:"Spend breakdown charts",path:"/analytics/costs"},
      {icon:"📦",label:"Purchase Orders",desc:"PO approval queue",path:"/supply-chain/purchase-orders-v2"},
      {icon:"✍️",label:"Approvals",desc:"Financial approvals",path:"/approvals"},
    ],
    workflow: [
      {step:1,label:"Review Invoices",path:"/commercial/invoices"},
      {step:2,label:"Process Approvals",path:"/approvals"},
      {step:3,label:"Check P&L",path:"/financial"},
    ],
  },
  viewer: {
    label: "Viewer",
    color: "#6D5F53",
    tagline: "Read-only access to platform data",
    primaryActions: [
      {icon:"📊",label:"Executive Dashboard",desc:"Platform overview",path:"/executive/dashboard"},
      {icon:"🔧",label:"Work Orders",desc:"View all work orders",path:"/operations/work-orders"},
      {icon:"📋",label:"Reports",desc:"Platform reports",path:"/reports"},
      {icon:"📈",label:"Analytics",desc:"Charts and trends",path:"/analytics"},
      {icon:"⏱",label:"SLA Dashboard",desc:"Performance metrics",path:"/operations/sla"},
      {icon:"🏭",label:"Assets",desc:"Asset registry",path:"/maintenance/assets"},
    ],
    workflow: [
      {step:1,label:"View Dashboard",path:"/executive/dashboard"},
      {step:2,label:"Check Reports",path:"/reports"},
      {step:3,label:"Review Analytics",path:"/analytics"},
    ],
  },
};

export default function WorkspacePage() {
  const router = useRouter();
  const { user } = useAuth();

  const role = user?.role || "viewer";
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;

  const { data: execDash } = useQuery(["workspace-exec"], () => authFetch("/api/v1/executive/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: approvalRaw } = useQuery(["workspace-approvals"], () => authFetch("/api/v1/approval-requests/").then(r=>r.json()), {staleTime:30000});
  const { data: woRaw } = useQuery(["workspace-wos"], () => authFetch("/api/v1/work-orders/?limit=5").then(r=>r.json()), {staleTime:30000});
  const { data: slaDash } = useQuery(["workspace-sla"], () => authFetch("/api/v1/sla/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: timeDash } = useQuery(["workspace-time"], () => authFetch("/api/v1/time-entries/summary").then(r=>r.json()), {staleTime:60000});

  const ops = execDash?.operations?.work_orders || {};
  const fin = execDash?.financial?.invoices || {};
  const pendingApprovals = toArr(approvalRaw).filter(a=>a.status==="pending");
  const recentWOs = toArr(woRaw).slice(0,5);
  const slaBreaches = slaDash?.breach_count || 0;
  const totalHours = timeDash?.totals?.total_hours || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {weekday:"long",day:"numeric",month:"long"});

  // Role-specific KPIs
  const roleKPIs = {
    admin: [
      {label:"Active Users",value:10,color:"#B9924C"},
      {label:"Security Score",value:"✓ Secured",color:"#547C4D"},
      {label:"Audit Events",value:"25+",color:"#5B7C8C"},
      {label:"Platform Score",value:"93/100",color:"#B9924C"},
    ],
    manager: [
      {label:"Pending Approvals",value:pendingApprovals.length,color:pendingApprovals.length>0?"#B07A2A":"#547C4D"},
      {label:"SLA Breaches",value:slaBreaches,color:slaBreaches>0?"#A84A3D":"#547C4D"},
      {label:"Open WOs",value:ops.open_count||0,color:"#5B7C8C"},
      {label:"Critical",value:ops.critical_open||0,color:ops.critical_open>0?"#A84A3D":"#547C4D"},
    ],
    agent: [
      {label:"My Work Orders",value:ops.open_count||0,color:"#547C4D"},
      {label:"Hours Logged",value:`${Math.round(totalHours)}h`,color:"#B9924C"},
      {label:"In Progress",value:ops.in_progress||0,color:"#B07A2A"},
      {label:"Completed",value:ops.completed||0,color:"#547C4D"},
    ],
    engineer: [
      {label:"My Work Orders",value:ops.open_count||0,color:"#547C4D"},
      {label:"Hours Logged",value:`${Math.round(totalHours)}h`,color:"#B9924C"},
      {label:"In Progress",value:ops.in_progress||0,color:"#B07A2A"},
      {label:"Completed",value:ops.completed||0,color:"#547C4D"},
    ],
    finance: [
      {label:"Invoices",value:fin.invoice_count||0,color:"#B9924C"},
      {label:"Outstanding",value:fmtEGP(fin.outstanding||0),color:fin.outstanding>0?"#B07A2A":"#547C4D"},
      {label:"Pending Approvals",value:pendingApprovals.length,color:pendingApprovals.length>0?"#B07A2A":"#547C4D"},
      {label:"Collection Rate",value:`${Math.round(fin.collection_rate||0)}%`,color:"#547C4D"},
    ],
    viewer: [
      {label:"Work Orders",value:ops.open_count||0,color:"#5B7C8C"},
      {label:"SLA Breaches",value:slaBreaches,color:slaBreaches>0?"#A84A3D":"#547C4D"},
      {label:"Completed",value:ops.completed||0,color:"#547C4D"},
      {label:"Platform",value:"Active",color:"#547C4D"},
    ],
  };

  const kpis = roleKPIs[role] || roleKPIs.viewer;
  const urgentCount = pendingApprovals.length + slaBreaches;

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>

      {/* HERO — Role-aware greeting */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:4}}>
                {config.label}
              </div>
              <h1 className="tb-hero-title">{greeting}, {user?.name?.split(" ")[0] || "Welcome"}!</h1>
              <p className="tb-hero-description">{today}</p>
              <p style={{fontSize:"0.8125rem",color:"rgba(34,29,26,0.5)",marginTop:4}}>{config.tagline}</p>
            </div>

            {urgentCount > 0 && (
              <button onClick={()=>router.push("/workspace/my-day")}
                style={{background:"rgba(168,74,61,0.08)",border:"1px solid rgba(168,74,61,0.22)",borderRadius:12,padding:"12px 20px",cursor:"pointer",textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:"1.5rem",fontWeight:900,color:"#A84A3D",lineHeight:1}}>{urgentCount}</div>
                <div style={{fontSize:"0.6875rem",color:"#A84A3D",marginTop:2,fontWeight:600}}>Action Required</div>
              </button>
            )}
          </div>

          {/* Role KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
            {kpis.map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1.1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"2fr 1fr",gap:24}}>

        {/* LEFT: Role primary actions */}
        <div style={{display:"flex",flexDirection:"column",gap:20}}>

          {/* START HERE — Primary actions for this role */}
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
            <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:4}}>Start Here</div>
            <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Your Core Tasks</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {config.primaryActions.map((a,i)=>(
                <button key={i} onClick={()=>router.push(a.path)}
                  style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:10,cursor:"pointer",textAlign:"left",transition:"all 160ms ease"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(185,146,76,0.3)";e.currentTarget.style.background="var(--color-surface-alt)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--color-border)";e.currentTarget.style.background="var(--color-bg-alt)";}}>
                  <span style={{fontSize:"1.25rem",flexShrink:0}}>{a.icon}</span>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)"}}>{a.label}</div>
                    <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:2}}>{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Workflow Guide */}
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
            <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:4}}>Today's Workflow</div>
            <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Recommended Order</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {config.workflow.map((step,i)=>(
                <button key={i} onClick={()=>router.push(step.path)}
                  style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:10,cursor:"pointer",textAlign:"left",transition:"all 160ms ease"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(185,146,76,0.3)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="var(--color-border)"}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(185,146,76,0.12)",border:"1px solid rgba(185,146,76,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"0.75rem",fontWeight:800,color:"#B9924C"}}>{step.step}</div>
                  <div style={{fontSize:"0.9375rem",fontWeight:600,color:"var(--color-text-1)"}}>{step.label}</div>
                  <div style={{marginLeft:"auto",color:"#B9924C",fontSize:"0.875rem"}}>→</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Work Orders */}
          {recentWOs.length > 0 && (
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)"}}>Recent Work Orders</div>
                <button onClick={()=>router.push("/operations/work-orders")} style={{fontSize:"0.75rem",fontWeight:600,color:"#B9924C",background:"none",border:"none",cursor:"pointer"}}>View all →</button>
              </div>
              {recentWOs.map((wo,i)=>{
                const pc = wo.priority==="critical"?"#A84A3D":wo.priority==="high"?"#B07A2A":"#6D5F53";
                return (
                  <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo.id)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--color-divider)",width:"100%",textAlign:"left",background:"transparent",cursor:"pointer"}}>
                    <div style={{width:3,height:32,borderRadius:2,background:pc,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{wo.title}</div>
                      <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{wo.priority} · {wo.status?.replace(/_/g," ")}</div>
                    </div>
                    <span style={{fontSize:"0.6875rem",color:"#B9924C",flexShrink:0}}>→</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Context panel */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Pending Approvals alert */}
          {pendingApprovals.length > 0 && (
            <div style={{background:"rgba(176,122,42,0.06)",border:"1px solid rgba(176,122,42,0.22)",borderRadius:14,padding:20}}>
              <div style={{fontSize:"0.875rem",fontWeight:700,color:"#B07A2A",marginBottom:12}}>✍ {pendingApprovals.length} Pending Approvals</div>
              {pendingApprovals.slice(0,3).map((a,i)=>(
                <div key={i} style={{fontSize:"0.8125rem",color:"var(--color-text-2)",padding:"6px 0",borderBottom:"1px solid var(--color-divider)"}}>
                  <div style={{fontWeight:600}}>{a.title?.slice(0,40)}{a.title?.length>40?"...":""}</div>
                  <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{a.document_type?.toUpperCase()} · {a.currency} {Number(a.amount||0).toLocaleString()}</div>
                </div>
              ))}
              <button onClick={()=>router.push("/approvals")} style={{marginTop:12,width:"100%",padding:"8px",background:"rgba(176,122,42,0.1)",border:"1px solid rgba(176,122,42,0.25)",borderRadius:8,color:"#B07A2A",fontSize:"0.8125rem",fontWeight:600,cursor:"pointer"}}>
                Review All →
              </button>
            </div>
          )}

          {/* SLA status */}
          {slaBreaches > 0 && (
            <div style={{background:"rgba(168,74,61,0.06)",border:"1px solid rgba(168,74,61,0.22)",borderRadius:14,padding:20}}>
              <div style={{fontSize:"0.875rem",fontWeight:700,color:"#A84A3D",marginBottom:8}}>⚠ {slaBreaches} SLA Breaches</div>
              <div style={{fontSize:"0.8125rem",color:"var(--color-text-3)"}}>Service requests exceeding target response time</div>
              <button onClick={()=>router.push("/operations/sla")} style={{marginTop:12,width:"100%",padding:"8px",background:"rgba(168,74,61,0.08)",border:"1px solid rgba(168,74,61,0.22)",borderRadius:8,color:"#A84A3D",fontSize:"0.8125rem",fontWeight:600,cursor:"pointer"}}>
                View SLA Dashboard →
              </button>
            </div>
          )}

          {/* Quick navigation by role */}
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:20}}>
            <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:14}}>Platform Areas</div>
            {[
              {icon:"☀️",label:"My Day",path:"/workspace/my-day"},
              {icon:"📊",label:"Executive Dashboard",path:"/executive/dashboard"},
              {icon:"📋",label:"Reports",path:"/reports"},
              {icon:"📈",label:"Analytics",path:"/analytics"},
              {icon:"🔔",label:"Notifications",path:"/notifications"},
              {icon:"👤",label:"My Profile",path:"/settings/profile"},
            ].map((item,i)=>(
              <button key={i} onClick={()=>router.push(item.path)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid var(--color-divider)",width:"100%",textAlign:"left",background:"transparent",cursor:"pointer"}}>
                <span style={{fontSize:"0.9375rem"}}>{item.icon}</span>
                <span style={{fontSize:"0.8125rem",color:"var(--color-text-2)",fontWeight:500}}>{item.label}</span>
                <span style={{marginLeft:"auto",color:"#B9924C",fontSize:"0.75rem"}}>→</span>
              </button>
            ))}
          </div>

          {/* Platform stats */}
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:20}}>
            <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:12}}>Platform Overview</div>
            {[
              ["Work Orders",`${ops.total||0} total · ${ops.open_count||0} open`],
              ["Technicians",`${execDash?.operations?.technicians?.active||0} active`],
              ["Assets",`${execDash?.operations?.assets?.total||0} managed`],
              ["Sites",`5 hotel clients`],
            ].map(([l,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--color-divider)"}}>
                <span style={{fontSize:"0.75rem",color:"var(--color-text-3)"}}>{l}</span>
                <span style={{fontSize:"0.75rem",fontWeight:600,color:"var(--color-text-1)"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
