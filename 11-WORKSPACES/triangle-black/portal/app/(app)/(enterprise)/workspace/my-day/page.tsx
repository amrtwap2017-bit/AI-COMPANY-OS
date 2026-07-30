"use client";
// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => {
  if (!d) return "";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return ""; return dt.toLocaleDateString("en-GB"); }
  catch { return ""; }
};
const fmtRelative = (d) => {
  if (!d) return "";
  try { const h=Math.floor((Date.now()-new Date(d).getTime())/3600000); return h<1?"just now":h<24?h+"h ago":Math.floor(h/24)+"d ago"; }
  catch { return ""; }
};
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

const PC = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#547C4D",normal:"#6D5F53"};
const DOC_ICONS = {sow:"📋",po:"📦",rfq:"📝",quotation_selection:"⚖️"};

export default function MyDayPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data: approvals } = useQuery(["myday-approvals"], () => authFetch("/api/v1/approval-requests/").then(r=>r.json()), {staleTime:30000});
  const { data: breaches } = useQuery(["myday-breaches"], () => authFetch("/api/v1/sla/breaches").then(r=>r.json()), {staleTime:60000});
  const { data: execDash } = useQuery(["myday-exec"], () => authFetch("/api/v1/executive/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: timeDash } = useQuery(["myday-time"], () => authFetch("/api/v1/time-entries/summary").then(r=>r.json()), {staleTime:60000});
  const { data: notifs } = useQuery(["myday-notifs"], () => authFetch("/api/v1/platform-notif/?limit=8").then(r=>r.json()), {staleTime:30000});
  const { data: procDash } = useQuery(["myday-proc"], () => authFetch("/api/v1/procurement/dashboard").then(r=>r.json()), {staleTime:60000});

  const pendingApprovals = toArr(approvals).filter(a => a.status === "pending");
  const slaBreaches = toArr(breaches).slice(0, 8);
  const criticalWOs = (execDash?.operations?.critical_work_orders || []).slice(0, 5);
  const recentNotifs = (notifs?.notifications || []).slice(0, 5);
  const ops = execDash?.operations?.work_orders || {};
  const totalLabor = timeDash?.totals?.total_hours || 0;
  const laborCost = timeDash?.totals?.total_labor_cost || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {weekday:"long", day:"numeric", month:"long"});

  const urgentCount = pendingApprovals.length + slaBreaches.length + criticalWOs.length;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="mb-4">
            <div className="text-label-upper text-purple-400 mb-1">My Day</div>
            <h1 className="text-2xl font-black text-white mb-1">{greeting}, {user?.name?.split(" ")[0] || "Amr"}</h1>
            <p className="text-slate-400 text-sm">{today}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Needs Attention",value:urgentCount,color:urgentCount>0?"#A84A3D":"#547C4D",icon:"🔴"},
              {label:"Pending Approvals",value:pendingApprovals.length,color:pendingApprovals.length>0?"#B07A2A":"#547C4D",icon:"✍️"},
              {label:"SLA Breaches",value:slaBreaches.length,color:slaBreaches.length>0?"#A84A3D":"#547C4D",icon:"⏱"},
              {label:"Open WOs",value:ops.open_count||0,color:"#5B7C8C",icon:"🔧"},
            ].map((k,i)=>(
  <button key={i} onClick={()=>k.path&&router.push(k.path)} className="tb-hero-kpi text-left hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2 mb-1"><span>{k.icon}</span></div>
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* LEFT: Actions Required */}
          <div className="space-y-4">

            {/* Pending Approvals */}
            {pendingApprovals.length > 0 && (
              <div className="tb-section" style={{borderColor:"#B07A2A40",background:"#B07A2A06"}}>
                <div className="tb-flex-between mb-3">
                  <div className="tb-section-title" style={{marginBottom:0,color:"#B07A2A"}}>✍️ Pending Approvals ({pendingApprovals.length})</div>
                  <button onClick={()=>router.push("/supply-chain/approvals-center")} className="text-xs text-brand">View all →</button>
                </div>
                <div className="space-y-2">
                  {pendingApprovals.map((a,i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-alt border border-yellow-400/20">
                      <span style={{fontSize:"1.25rem"}}>{DOC_ICONS[a.document_type]||"📄"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{a.title}</div>
                        <div className="text-xs text-tertiary">{a.document_type?.toUpperCase()} {a.document_number} · {fmtRelative(a.requested_at)}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-black text-emerald-400">{fmtEGP(a.amount)}</div>
                        <div className="text-xs text-tertiary">{a.currency}</div>
                      </div>
                      <button onClick={()=>router.push("/supply-chain/approvals-center")}
                        className="tb-btn-primary flex-shrink-0" style={{fontSize:"0.65rem",padding:"4px 10px"}}>
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLA Breaches */}
            {slaBreaches.length > 0 && (
              <div className="tb-section" style={{borderColor:"#A84A3D40",background:"#A84A3D06"}}>
                <div className="tb-flex-between mb-3">
                  <div className="tb-section-title" style={{marginBottom:0,color:"#A84A3D"}}>⏱ SLA Breaches ({slaBreaches.length})</div>
                  <button onClick={()=>router.push("/operations/sla")} className="text-xs text-brand">SLA Dashboard →</button>
                </div>
                <div className="space-y-2">
                  {slaBreaches.map((b,i) => {
                    const uc = PC[b.urgency] || "#6D5F53";
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-alt border border-red-400/15">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:uc}}/>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-primary truncate">{b.title}</div>
                          <div className="text-xs text-tertiary">{b.urgency} · Target: {b.sla_target_hours}h · {b.site_name||"—"}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-black" style={{color:"#A84A3D"}}>{Math.round(b.hours_overdue)}h</div>
                          <div className="text-xs text-tertiary">overdue</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Critical Work Orders */}
            {criticalWOs.length > 0 && (
              <div className="tb-section">
                <div className="tb-flex-between mb-3">
                  <div className="tb-section-title" style={{marginBottom:0,color:"#A84A3D"}}>⚠ Critical Work Orders</div>
                  <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand">All WOs →</button>
                </div>
                <div className="space-y-2">
                  {criticalWOs.map((wo,i)=>(
                    <button key={i} onClick={()=>router.push("/operations/work-orders/"+wo.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left border border-transparent hover:border-border">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:"#A84A3D"}}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary truncate">{wo.title}</div>
                        <div className="text-xs text-tertiary">{wo.site_name||"—"} · {wo.technician_name||"Unassigned"}</div>
                      </div>
                      <span className="tb-badge flex-shrink-0" style={{background:"#A84A3D18",color:"#A84A3D",fontSize:"0.45rem"}}>{wo.status?.replace(/_/g," ")}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Today Intelligence */}
          <div className="space-y-4">

            {/* Today Stats */}
            <div className="tb-section">
              <div className="tb-section-title">Platform Snapshot</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-base-alt text-center">
                  <div className="text-lg font-black text-emerald-400">{Math.round(totalLabor)}h</div>
                  <div className="text-xs text-tertiary">Hours Logged</div>
                </div>
                <div className="p-3 rounded-xl bg-base-alt text-center">
                  <div className="text-lg font-black text-amber-400">{fmtEGP(laborCost)}</div>
                  <div className="text-xs text-tertiary">Labor Cost</div>
                </div>
                <div className="p-3 rounded-xl bg-base-alt text-center">
                  <div className="text-lg font-black text-blue-400">{procDash?.pos?.total||0}</div>
                  <div className="text-xs text-tertiary">Active POs</div>
                </div>
                <div className="p-3 rounded-xl bg-base-alt text-center">
                  <div className="text-lg font-black text-purple-400">{procDash?.grns?.total||0}</div>
                  <div className="text-xs text-tertiary">Deliveries</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {icon:"🔧",label:"New Work Order",path:"/operations/work-orders/new",color:"#B07A2A"},
                  {icon:"📋",label:"Dispatch Board",path:"/operations/dispatch",color:"#8D7443"},
                  {icon:"📦",label:"Purchase Orders",path:"/supply-chain/purchase-orders-v2",color:"#B07A2A"},
                  {icon:"📄",label:"Invoices",path:"/supply-chain/invoices",color:"#547C4D"},
                  {icon:"📱",label:"Asset QR Codes",path:"/operations/assets/qr",color:"#B07A2A"},
                  {icon:"📊",label:"Executive",path:"/executive/dashboard",color:"#5B7C8C"},
                ].map((a,i)=>(
                  <button key={i} onClick={()=>router.push(a.path)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left border border-transparent hover:border-border">
                    <span>{a.icon}</span>
                    <span className="text-xs font-medium text-secondary">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="tb-section">
              <div className="tb-flex-between mb-3">
                <div className="tb-section-title" style={{marginBottom:0}}>Notifications</div>
                <button onClick={()=>router.push("/notifications")} className="text-xs text-brand">View all →</button>
              </div>
              <div className="space-y-1.5">
                {recentNotifs.length === 0 ? (
                  <div className="text-xs text-tertiary text-center py-4">No recent notifications</div>
                ) : recentNotifs.map((n,i)=>(
                  <div key={i} className="flex items-start gap-2 py-2 border-b border-border">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{background:n.is_read?"#334155":"#5B7C8C"}}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-primary truncate">{n.title}</div>
                      <div className="text-xs text-tertiary">{fmtRelative(n.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
