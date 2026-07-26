// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { PageWrapper, SectionCard, LoadingState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const P = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};

export default function WorkbenchPage() {
  const { data: woRaw=[], isLoading:woL } = useQuery(["wb-wo"], () => authFetch("/api/v1/work-orders/?limit=200").then(r=>r.json()), {refetchInterval:30000});
  const { data: srRaw=[], isLoading:srL } = useQuery(["wb-sr"], () => authFetch("/api/v1/service-requests/?limit=50").then(r=>r.json()), {refetchInterval:30000});
  const { data: techRaw=[], isLoading:techL } = useQuery(["wb-tech"], () => authFetch("/api/v1/technicians/?limit=100").then(r=>r.json()), {refetchInterval:120000});
  const { data: twin={} } = useQuery(["wb-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()), {refetchInterval:60000});

  const wos=toArr(woRaw); const srs=toArr(srRaw); const techs=toArr(techRaw);
  const isLoading=woL||srL||techL;

  const woOpen=wos.filter(w=>w.status==="open").length;
  const woInProg=wos.filter(w=>w.status==="in_progress").length;
  const woCritical=wos.filter(w=>w.priority==="critical"&&!["completed","cancelled"].includes(w.status)).length;
  const woComplete=wos.filter(w=>w.status==="completed").length;
  const techAvail=techs.filter(t=>t.is_active!==false&&(t.current_work_orders||0)<(t.max_work_orders||5)).length;
  const srOpen=srs.filter(s=>s.status==="open").length;

  const priorityWOs=wos.filter(w=>!["completed","cancelled"].includes(w.status)).sort((a,b)=>({critical:0,high:1,medium:2,low:3}[a.priority]||2)-({critical:0,high:1,medium:2,low:3}[b.priority]||2)).slice(0,8);
  const openSRs=srs.filter(s=>s.status!=="resolved").slice(0,5);

  const twinScore=twin.health_score??0;
  const twinColor=twinScore>=95?"text-emerald-700":twinScore>=80?"text-amber-700":"text-red-700";
  const twinBg=twinScore>=95?"bg-emerald-50 border-emerald-200":twinScore>=80?"bg-amber-50 border-amber-200":"bg-red-50 border-red-200";

  const KPIS=[
    {l:"Open WOs",v:woOpen,c:"text-blue-700",bg:woOpen>10?"bg-blue-50":"bg-white"},
    {l:"In Progress",v:woInProg,c:"text-indigo-700",bg:"bg-white"},
    {l:"Critical",v:woCritical,c:"text-red-700",bg:woCritical>0?"bg-red-50":"bg-white"},
    {l:"Completed",v:woComplete,c:"text-emerald-700",bg:"bg-white"},
    {l:"Available Techs",v:techAvail,c:"text-teal-700",bg:"bg-white"},
    {l:"Open SRs",v:srOpen,c:"text-amber-700",bg:"bg-white"},
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Workbench</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live control center · auto-refreshes every 30s</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-2 rounded-xl border text-sm font-bold ${twinBg} ${twinColor}`}>🔷 Twin: {twinScore}/100</div>
          <Link href="/operations/service-requests">
            <span className="inline-flex items-center px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">＋ Service Request</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-5">
        {KPIS.map(k=>(
          <div key={k.l} className={`${k.bg} rounded-xl border border-slate-200 px-3 py-3 text-center`}>
            <div className={`text-xl font-bold ${k.c}`}>{isLoading?"…":k.v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.l}</div>
          </div>
        ))}
      </div>

      {!isLoading&&woCritical>0&&(
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-xl">🚨</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">{woCritical} critical work order{woCritical>1?"s":""} require immediate attention</p>
          </div>
          <Link href="/operations/work-orders" className="text-xs font-bold text-red-700 underline shrink-0">View →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard title={`Priority Work Orders (${priorityWOs.length})`}
          action={<Link href="/operations/work-orders" className="text-xs font-semibold text-blue-600 hover:underline">All active →</Link>}>
          {woL?<LoadingState/>:priorityWOs.length===0?(
            <div className="flex flex-col items-center py-8 text-center">
              <span className="text-4xl mb-2">✅</span>
              <p className="text-sm font-semibold text-emerald-700">No open work orders</p>
            </div>
          ):(
            <div className="divide-y divide-slate-100">
              {priorityWOs.map(wo=>(
                <div key={wo.id} className={`flex items-center justify-between py-3 px-1 hover:bg-slate-50 ${wo.priority==="critical"?"bg-red-50/30":""}`}>
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-slate-800 truncate">{wo.title}</p>
                    <p className="text-xs text-slate-400">{wo.type||"maintenance"} · {fmtDate(wo.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(P[wo.priority]||P.low)}>{wo.priority||"—"}</span>
                    <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(wo.status==="in_progress"?"bg-indigo-100 text-indigo-800":wo.status==="open"?"bg-blue-100 text-blue-800":"bg-slate-100 text-slate-600")}>
                      {wo.status?.replace("_"," ")||"—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title={`Service Requests (${openSRs.length} open)`}
            action={<Link href="/operations/service-requests" className="text-xs font-semibold text-blue-600 hover:underline">View all →</Link>}>
            {srL?<LoadingState/>:openSRs.length===0?(<div className="text-center py-4"><p className="text-sm text-emerald-600 font-medium">✅ All resolved</p></div>):(
              <div className="divide-y divide-slate-100">
                {openSRs.map(sr=>(
                  <div key={sr.id} className="flex items-center justify-between py-2.5 px-1">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-sm font-medium text-slate-800 truncate">{sr.title}</p>
                      <p className="text-xs text-slate-400">{sr.category||"General"} · {fmtDate(sr.created_at)}</p>
                    </div>
                    <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(P[sr.urgency?.toLowerCase()]||P.low)}>{sr.urgency||"—"}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={`Technicians (${techAvail} available)`}>
            {techL?<LoadingState/>:(
              <div className="grid grid-cols-2 gap-2">
                {techs.filter(t=>t.is_active!==false).slice(0,6).map(t=>{
                  const w=t.current_work_orders||0; const m=t.max_work_orders||5; const pct=Math.min(100,(w/m)*100);
                  return (
                    <div key={t.id} className={`rounded-lg border p-2.5 ${w<m?"border-slate-200 bg-white":"border-amber-200 bg-amber-50/50"}`}>
                      <p className="text-xs font-semibold text-slate-800 truncate">{t.name}</p>
                      <p className="text-xs text-slate-400 truncate">{t.specialization||t.trade||"—"}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${pct>=100?"bg-red-500":pct>=60?"bg-amber-500":"bg-emerald-500"}`} style={{width:`${pct}%`}} />
                        </div>
                        <span className="text-xs text-slate-400">{w}/{m}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
