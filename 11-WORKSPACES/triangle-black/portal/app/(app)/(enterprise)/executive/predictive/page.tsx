"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];

const RISK_COLOR = {CRITICAL:"#A84A3D",HIGH:"#B07A2A",MEDIUM:"#B07A2A",LOW:"#547C4D"};

export default function PredictivePage() {
  const router = useRouter();
  const { data: pred, isLoading } = useQuery(
    ["pred-maint"],
    ()=>authFetch("/api/v1/ai/predictive-maintenance").then(r => (r as any).data ?? r),
    {staleTime:300000,refetchOnWindowFocus:false}
  );
  const { data: patterns } = useQuery(
    ["wo-patterns"],
    ()=>authFetch("/api/v1/ai/work-order-patterns").then(r => (r as any).data ?? r),
    {staleTime:300000,refetchOnWindowFocus:false}
  );

  const predictions = toArr(pred?.predictions);
  const patternList = toArr(patterns?.patterns);
  const highRisk    = predictions.filter((p: any) =>p.risk_score>=40);
  const critical    = predictions.filter((p: any) =>p.risk_score>=70);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Executive · AI</div>
              <h1 className="tb-hero-title">Predictive Maintenance</h1>
              <p className="tb-hero-description">AI-powered asset health analysis and failure prediction</p>
            </div>
            <button onClick={()=>router.push("/executive")} className="tb-btn tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Analyzed", value:predictions.length, color:"var(--color-text-2)"},
              {label:"High Risk",value:highRisk.length,    color:highRisk.length>0?"var(--color-warning)":"var(--color-success)"},
              {label:"Critical", value:critical.length,    color:critical.length>0?"var(--color-danger)":"var(--color-success)"},
              {label:"Patterns", value:patternList.length, color:"var(--color-brand)"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {pred?.ai_summary&&pred.ai_summary!=="AI analysis unavailable"&&(
          <div className="tb-alert tb-alert-info mb-4">
            <span className="text-xl">🤖</span>
            <div>
              <div className="text-xs text-tertiary mb-1">AI Analysis (Qwen 2.5)</div>
              <div className="text-sm text-secondary">{pred.ai_summary}</div>
            </div>
          </div>
        )}

        <div className="tb-section mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="tb-section-title" style={{marginBottom:0}}>Asset Risk Scores</div>
            <button onClick={()=>router.push("/maintenance/assets")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">All Assets →</button>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-3 mt-3">{[1,2,3,4,5].map((i: any) =><div key={i} className="tb-shimmer-block" style={{height:56}}/>)}</div>
          ) : predictions.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">✅</div><div className="tb-empty-desc">No assets found</div></div>
          ) : (
            <div className="flex flex-col gap-2 mt-3">
              {predictions.map((pred: any, i: any) =>{
                const c = (RISK_COLOR as Record<string, any>)[pred.risk_label]||"#6D5F53";
                return (
                  <button key={i} onClick={()=>router.push("/maintenance/assets/"+pred.asset_id)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl bg-surface-alt tb-hover-lift text-left"
                    style={{borderLeft:"3px solid "+c}}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-primary truncate">{pred.asset_name}</div>
                        <span className="tb-badge flex-shrink-0" style={{background:c+"18",color:c,border:"1px solid "+c+"30",fontSize:"0.5625rem"}}>
                          {pred.risk_label}
                        </span>
                      </div>
                      <div className="text-xs text-tertiary mt-0.5">{pred.recommendation}</div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-secondary">{pred.category}</span>
                        <span className="text-xs text-tertiary">{pred.total_wos} WOs</span>
                        {pred.critical_wos>0&&<span className="text-xs font-bold text-danger">{pred.critical_wos} critical</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-black" style={{color:c}}>{pred.risk_score}</div>
                      <div className="text-xs text-tertiary">risk</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {patternList.length>0&&(
          <div className="tb-section mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="tb-section-title" style={{marginBottom:0}}>Recurring Issue Patterns</div>
              <span className="text-xs text-tertiary">{patternList.length} patterns detected</span>
            </div>
            <div className="tb-table-wrap mt-3">
              <table className="tb-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th style={{textAlign:"center"}}>Category</th>
                    <th style={{textAlign:"center"}}>Count</th>
                    <th style={{textAlign:"center"}}>Avg Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {patternList.slice(0,8).map((pat: any, i: any) =>{
                    const pc={critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#6D5F53"}[pat.priority]||"#6D5F53";
                    return (
                      <tr key={i}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 rounded-full flex-shrink-0" style={{background:pc}}/>
                            <span className="text-sm font-medium text-primary truncate">{pat.asset_name||"—"}</span>
                          </div>
                        </td>
                        <td className="text-center text-xs text-secondary">{pat.category||"—"}</td>
                        <td className="text-center text-sm font-bold" style={{color:pc}}>{pat.occurrence_count}</td>
                        <td className="text-center text-xs text-tertiary">
                          {pat.avg_resolution_hours?Math.round(pat.avg_resolution_hours)+"h":"—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Maintenance Intelligence</div>
          <div className="tb-grid-3">
            {[
              {label:"Assets",     icon:"⚙️", path:"/maintenance/assets"},
              {label:"PM Plans",   icon:"📅",  path:"/maintenance/pm-plans"},
              {label:"Work Orders",icon:"🔧",  path:"/operations/work-orders"},
            ].map((a: any, i: number) =>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
