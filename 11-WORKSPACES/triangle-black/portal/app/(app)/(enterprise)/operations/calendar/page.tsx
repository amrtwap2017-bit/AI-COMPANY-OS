"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { if (!d) return ""; try { return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"}); } catch { return ""; } };

export default function OperationsCalendarPage() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["cal-wos"],()=>authFetch("/api/v1/work-orders/?limit=50").then(r=>r.json()),{staleTime:30000});
  const { data: pmRaw } = useQuery(["cal-pm"],()=>authFetch("/api/v1/pm-schedule/calendar").then(r=>r.json()),{staleTime:60000});
  const wos = toArr(woRaw).filter((w: any) =>w.due_date).slice(0,20);
  const pm = toArr(pmRaw?.events||pmRaw).slice(0,10);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="text-label-upper text-brand mb-1.5">Operations</div>
          <h1 className="tb-hero-title">Operations Calendar</h1>
          <p className="tb-hero-description">Upcoming work orders and maintenance schedule</p>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-grid-2">
          <div className="tb-section">
            <div className="font-bold text-primary mb-4">Upcoming Work Orders</div>
            {wos.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-title">No scheduled work orders</div></div>
            ) : wos.map((w: any, i: number) =>{
              const color = w.priority==="critical"?"var(--color-danger)":w.priority==="high"?"var(--color-warning)":w.status==="in_progress"?"var(--color-warning)":"var(--color-info)";
              return (
                <button key={i} onClick={()=>router.push("/operations/work-orders/"+w.id)}
                  className="flex items-center gap-3 py-2.5 border-b border-divider w-full text-left bg-transparent cursor-pointer">
                  <div className="w-11 text-center flex-shrink-0">
                    <div className="text-sm font-bold text-primary">{fmtDate(w.due_date)}</div>
                  </div>
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{background:color}} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-primary truncate">{w.title}</div>
                    <div className="text-xs text-tertiary">{w.priority} · {w.status}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="tb-section">
            <div className="font-bold text-primary mb-4">Maintenance Schedule</div>
            {pm.length===0 ? (
              <div className="tb-empty"><div className="tb-empty-title">No scheduled maintenance</div></div>
            ) : pm.map((e: any, i: number) =>(
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-divider">
                <div className="w-11 text-center flex-shrink-0">
                  <div className="text-sm font-bold text-primary">{fmtDate(e.date||e.next_maintenance_date)}</div>
                </div>
                <div className="w-1 h-8 rounded-full flex-shrink-0 bg-brand" />
                <div>
                  <div className="text-sm font-semibold text-primary">{e.title||e.name||"Maintenance"}</div>
                  <div className="text-xs text-tertiary">{e.type||e.category||"Scheduled"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
