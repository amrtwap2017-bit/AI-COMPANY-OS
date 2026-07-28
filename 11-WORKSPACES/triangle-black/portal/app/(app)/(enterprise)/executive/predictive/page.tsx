"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

const RISK_COLOR = {
  CRITICAL: "#F87171",
  HIGH:     "#FB923C",
  MEDIUM:   "#FBBF24",
  LOW:      "#34D399",
};

export default function PredictivePage() {
  const router = useRouter();
  const { data: pred, isLoading } = useQuery(
    ["pred-maint"],
    () => authFetch("/api/v1/ai/predictive-maintenance").then(r=>r.json()),
    { staleTime: 300000, refetchOnWindowFocus: false }
  );
  const { data: patterns } = useQuery(
    ["wo-patterns"],
    () => authFetch("/api/v1/ai/work-order-patterns").then(r=>r.json()),
    { staleTime: 300000, refetchOnWindowFocus: false }
  );

  const predictions = toArr(pred?.predictions);
  const patternList = toArr(patterns?.patterns);
  const highRisk    = predictions.filter(p=>p.risk_score>=40);
  const critical    = predictions.filter(p=>p.risk_score>=70);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0A1530 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Executive · AI</div>
              <h1 className="tb-hero-title">Predictive Maintenance</h1>
              <p className="tb-hero-description">AI-powered asset health analysis and failure prediction</p>
            </div>
            <button onClick={()=>router.push("/executive")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Analyzed",    value:predictions.length,  color:"#F1F5F9"},
              {label:"High Risk",   value:highRisk.length,     color:highRisk.length>0?"#FB923C":"#34D399"},
              {label:"Critical",    value:critical.length,     color:critical.length>0?"#F87171":"#34D399"},
              {label:"Patterns",    value:patternList.length,  color:"#A78BFA"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {pred?.ai_summary && pred.ai_summary !== "AI analysis unavailable" && (
          <div className="tb-section" style={{borderColor:"#A78BFA40",background:"#A78BFA08"}}>
            <div className="flex items-start gap-3">
              <span style={{fontSize:"1.5rem"}}>🤖</span>
              <div>
                <div className="text-xs text-tertiary mb-1">AI Analysis (Qwen 2.5)</div>
                <div className="text-sm text-secondary">{pred.ai_summary}</div>
              </div>
            </div>
          </div>
        )}

        <div className="tb-section">
          <div className="tb-section-header">
            <div className="tb-section-title" style={{marginBottom:0}}>Asset Risk Scores</div>
            <button onClick={()=>router.push("/maintenance/assets")} className="tb-section-link">All Assets →</button>
          </div>
          {isLoading ? (
            <div className="space-y-3 mt-3">{[1,2,3,4,5].map(i=><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : predictions.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">✅</div><div className="tb-empty-desc">No assets found</div></div>
          ) : (
            <div className="space-y-2 mt-3">
              {predictions.map((pred,i)=>{
                const c = RISK_COLOR[pred.risk_label]||"#94A3B8";
                return (
                  <button key={i} onClick={()=>router.push("/maintenance/assets/"+pred.asset_id)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left"
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
                        {pred.critical_wos>0&&<span className="text-xs font-bold text-red-400">{pred.critical_wos} critical</span>}
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
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>Recurring Issue Patterns</div>
              <span className="text-xs text-tertiary">{patternList.length} patterns detected</span>
            </div>
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden",marginTop:12}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"2fr 100px 80px 120px"}}>
                {["Asset","Category","Count","Avg Resolution"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {patternList.slice(0,8).map((pat,i)=>{
                const pc={critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#94A3B8"}[pat.priority]||"#94A3B8";
                return (
                  <div key={i} className="tb-table-row" style={{gridTemplateColumns:"2fr 100px 80px 120px"}}>
                    <div className="flex items-center gap-2 pr-4 min-w-0">
                      <div className="tb-priority-bar" style={{background:pc}}/>
                      <div className="text-sm font-medium text-primary truncate">{pat.asset_name||"—"}</div>
                    </div>
                    <div className="text-center text-xs text-secondary">{pat.category||"—"}</div>
                    <div className="text-center text-sm font-bold" style={{color:pc}}>{pat.occurrence_count}</div>
                    <div className="text-center text-xs text-tertiary">
                      {pat.avg_resolution_hours ? Math.round(pat.avg_resolution_hours)+"h" : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Maintenance Intelligence</div>
          <div className="tb-grid-3">
            {[
              {label:"Assets",        icon:"⚙️",  path:"/maintenance/assets"},
              {label:"PM Plans",      icon:"📅", path:"/maintenance/pm-plans"},
              {label:"Work Orders",   icon:"🔧", path:"/operations/work-orders"},
            ].map((a,i)=>(
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
