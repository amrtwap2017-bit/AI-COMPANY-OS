"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const PRIORITY_COLOR = { critical:"#A84A3D", high:"#B07A2A", medium:"#B07A2A", low:"#6D5F53" };
const WO_STATUS_COLOR = { open:"#5B7C8C", in_progress:"#B07A2A", completed:"#547C4D", cancelled:"#6D5F53" };

export default function TechnicianDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: tech, isLoading } = useQuery(
    ["tech-detail", id],
    () => authFetch(`/api/v1/technicians/${id}`).then(r => r.json()),
    { enabled: !!id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading technician...</div>
    </div>
  );

  if (!tech || tech.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">👷</div>
        <div className="tb-empty-title">Technician not found</div>
        <button onClick={() => router.push("/operations/technicians")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const wos   = tech.work_orders || [];
  const stats = tech.stats || {};
  const openWOs = wos.filter(w => w.status === "open" || w.status === "in_progress");
  const completedWOs = wos.filter(w => w.status === "completed");
  const compRate = stats.completion_rate || 0;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-base-alt flex items-center justify-center text-2xl font-black text-secondary flex-shrink-0">
                {(tech.name||"?").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-label-upper text-cyan-400 mb-1">Operations · Field Team</div>
                <h1 className="tb-hero-title">{tech.name||`Technician ${id?.slice(0,8)}`}</h1>
                <p className="tb-hero-description">
                  {tech.specialization && <span className="text-secondary mr-2">{tech.specialization}</span>}
                  {tech.employee_id && <span className="text-tertiary">ID: {tech.employee_id}</span>}
                </p>
              </div>
            </div>
            <button onClick={() => router.push("/operations/technicians")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Total WOs",       value:stats.total_wos||0,    color:"#221D1A" },
              { label:"Completed",       value:stats.completed||0,    color:"#547C4D" },
              { label:"Active",          value:openWOs.length,        color:openWOs.length>0?"#B07A2A":"#547C4D" },
              { label:"Completion Rate", value:`${compRate}%`,        color:compRate>=80?"#547C4D":"#B07A2A" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">

            <div className="tb-section">
              <div className="tb-section-title">Technician Details</div>
              <div className="space-y-1">
                {[
                  ["Name",              tech.name || "—"],
                  ["Employee ID",       tech.employee_id || "—"],
                  ["Specialization",    tech.specialization || "—"],
                  ["Status",            tech.status || "Active"],
                  ["Phone",             tech.phone || "—"],
                  ["Email",             tech.email || "—"],
                  ["Certification",     tech.certification || "—"],
                  ["Hire Date",         fmtDate(tech.hire_date)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {wos.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-header">
                  <div className="tb-section-title" style={{marginBottom:0}}>Work Order History ({wos.length})</div>
                  <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">All WOs →</button>
                </div>
                <div className="tb-table" style={{borderRadius:12,overflow:"hidden",marginTop:12}}>
                  <div className="tb-table-head" style={{gridTemplateColumns:"2fr 80px 90px 110px"}}>
                    {["Work Order","Priority","Status","Date"].map((h, i) => (
                      <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                    ))}
                  </div>
                  {wos.map((wo, i) => {
                    const pc  = PRIORITY_COLOR[wo.priority] || "#6D5F53";
                    const wsc = WO_STATUS_COLOR[wo.status]  || "#6D5F53";
                    return (
                      <button key={i}
                        onClick={() => router.push(`/operations/work-orders/${wo.id}`)}
                        className="tb-table-row"
                        style={{gridTemplateColumns:"2fr 80px 90px 110px"}}>
                        <div className="flex items-center gap-2 pr-4 min-w-0">
                          <div className="tb-priority-bar" style={{background:pc}}/>
                          <div className="text-sm font-medium text-primary truncate">{wo.title||"—"}</div>
                        </div>
                        <div className="text-center">
                          <span className="tb-badge" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`,fontSize:"0.5625rem"}}>{wo.priority||"—"}</span>
                        </div>
                        <div className="text-center">
                          <span className="tb-badge" style={{background:`${wsc}18`,color:wsc,border:`1px solid ${wsc}30`,fontSize:"0.5625rem"}}>{(wo.status||"—").replace("_"," ")}</span>
                        </div>
                        <div className="text-center text-xs text-tertiary">{fmtDate(wo.created_at)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Performance</div>
              <div className="text-center py-3">
                <div className="text-5xl font-black mb-1" style={{color:compRate>=80?"#547C4D":"#B07A2A"}}>{compRate}%</div>
                <div className="text-xs text-tertiary">completion rate</div>
                <div className="tb-progress tb-progress--md mt-3">
                  <div className="tb-progress-bar" style={{background:compRate>=80?"#547C4D":"#B07A2A",width:`${compRate}%`}}/>
                </div>
              </div>
              <div className="tb-grid-3 mt-3 text-center">
                <div>
                  <div className="text-lg font-black text-primary">{stats.total_wos||0}</div>
                  <div className="text-xs text-tertiary">Total</div>
                </div>
                <div>
                  <div className="text-lg font-black text-emerald-400">{stats.completed||0}</div>
                  <div className="text-xs text-tertiary">Done</div>
                </div>
                <div>
                  <div className="text-lg font-black" style={{color:openWOs.length>0?"#B07A2A":"#547C4D"}}>{openWOs.length}</div>
                  <div className="text-xs text-tertiary">Active</div>
                </div>
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All Technicians", icon:"👷", path:"/operations/technicians" },
                  { label:"Dispatch Board",  icon:"📋", path:"/operations/dispatch" },
                  { label:"Work Orders",     icon:"🔧", path:"/operations/work-orders" },
                  { label:"Service Requests",icon:"🎫", path:"/operations/service-requests" },
                ].map((a, i) => (
                  <button key={i} onClick={() => router.push(a.path)} className="tb-action-item w-full justify-start">
                    <span>{a.icon}</span>
                    <span className="text-sm text-secondary">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
