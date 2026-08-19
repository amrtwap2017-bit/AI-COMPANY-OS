"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  active:"#547C4D", planning:"#5B7C8C", completed:"#8D7443",
  on_hold:"#B07A2A", cancelled:"#A84A3D"
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: proj, isLoading } = useQuery(
    ["proj-detail", id],
    () => authFetch(`/api/v1/projects/${id}`).then(r => r.data ?? r),
    { enabled: !!id }
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading project...</div>
    </div>
  );

  if (!proj || proj.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">🏗️</div>
        <div className="tb-empty-title">Project not found</div>
        <button onClick={() => router.push("/projects-center")} className="tb-btn-primary mt-4">Back</button>
      </div>
    </div>
  );

  const sc  = (STATUS_COLOR as Record<string, any>)[proj.status] || "#6D5F53";
  const wos = proj.work_orders || [];
  const completedWOs = wos.filter((w: any) => w.status === "completed").length;
  const progress = wos.length > 0 ? Math.round((completedWOs / wos.length) * 100) : Number(proj.progress || 0);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1A14 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1.5">Projects</div>
              <h1 className="tb-hero-title">{proj.name || proj.title || `Project ${id?.slice(0,8)}`}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>
                  {proj.status||"—"}
                </span>
                {proj.client_name && <span className="text-secondary">{proj.client_name}</span>}
              </p>
            </div>
            <button onClick={() => router.push("/projects-center")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              { label:"Progress",   value:`${progress}%`,                          color:progress>=80?"#547C4D":"#B07A2A" },
              { label:"Budget",     value:fmtEGP(proj.budget||proj.total_value||0), color:"#221D1A" },
              { label:"Work Orders",value:wos.length,                              color:"#5B7C8C" },
              { label:"End Date",   value:fmtDate(proj.end_date),                  color:"#8D7443" },
            ].map((k: any, i: number) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div>
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
              <div className="tb-section-title">Project Progress</div>
              <div className="mb-3">
                <div className="tb-flex-between mb-2">
                  <span className="text-sm text-secondary">{completedWOs}/{wos.length} work orders complete</span>
                  <span className="text-sm font-bold" style={{color:progress>=80?"#547C4D":"#B07A2A"}}>{progress}%</span>
                </div>
                <div className="tb-progress tb-progress--md">
                  <div className="tb-progress-bar" style={{background:progress>=80?"#547C4D":"#B07A2A",width:`${progress}%`,transition:"width 0.5s ease"}}/>
                </div>
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Project Details</div>
              <div className="space-y-1">
                {[
                  ["Name",       proj.name || proj.title || "—"],
                  ["Client",     proj.client_name || "—"],
                  ["Status",     proj.status || "—"],
                  ["Budget",     fmtEGP(proj.budget || proj.total_value || 0)],
                  ["Start Date", fmtDate(proj.start_date)],
                  ["End Date",   fmtDate(proj.end_date)],
                  ["Manager",    proj.project_manager || proj.manager || "—"],
                  ["Created",    fmtDate(proj.created_at)],
                ].map(([l, v], i) => (
                  <div key={i} className="tb-info-row">
                    <span className="tb-info-label">{l}</span>
                    <span className="tb-info-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {proj.description && (
              <div className="tb-section">
                <div className="tb-section-title">Description</div>
                <p className="text-sm text-secondary leading-relaxed">{proj.description}</p>
              </div>
            )}

            {wos.length > 0 && (
              <div className="tb-section">
                <div className="tb-section-header">
                  <div className="tb-section-title" style={{marginBottom:0}}>Work Orders ({wos.length})</div>
                  <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">All →</button>
                </div>
                <div className="space-y-2 mt-3">
                  {wos.map((wo: any, i: any) => {
                    const pc = { critical:"#A84A3D", high:"#B07A2A", medium:"#B07A2A", low:"#6D5F53" }[wo.priority] || "#6D5F53";
                    const sc2 = { open:"#5B7C8C", in_progress:"#B07A2A", completed:"#547C4D" }[wo.status] || "#6D5F53";
                    return (
                      <button key={i}
                        onClick={() => router.push(`/operations/work-orders/${wo.id}`)}
                        className="tb-action-item w-full justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="tb-priority-bar" style={{background:pc}}/>
                          <span className="text-sm text-secondary truncate">{wo.title||"—"}</span>
                        </div>
                        <span className="tb-badge" style={{background:`${sc2}18`,color:sc2,border:`1px solid ${sc2}30`,fontSize:"0.5625rem",flexShrink:0}}>
                          {(wo.status||"—").replace("_"," ")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="tb-section">
              <div className="tb-section-title">Status Summary</div>
              <div className="text-center py-4">
                <div className="text-5xl font-black mb-2" style={{color:sc}}>
                  {proj.status === "completed" ? "✓" : proj.status === "active" ? "▶" : "○"}
                </div>
                <div className="text-sm font-bold" style={{color:sc}}>{(proj.status||"—").replace("_"," ").toUpperCase()}</div>
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { label:"All Projects",  icon:"🏗️", path:"/projects-center" },
                  { label:"Work Orders",   icon:"🔧", path:"/operations/work-orders" },
                  { label:"Assets",        icon:"⚙️", path:"/maintenance/assets" },
                  { label:"Contracts",     icon:"📄", path:"/commercial/contracts" },
                ].map((a: any, i: number) => (
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
