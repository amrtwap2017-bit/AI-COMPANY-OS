"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const urgencyColor = (u: string) => ({
  CRITICAL: "#dc2626",
  HIGH:     "#ea580c",
  MEDIUM:   "#d97706",
  LOW:      "#16a34a",
}[u] || "#6b7280");

const urgencyBg = (u: string) => ({
  CRITICAL: "rgba(220,38,38,0.1)",
  HIGH:     "rgba(234,88,12,0.1)",
  MEDIUM:   "rgba(217,119,6,0.1)",
  LOW:      "rgba(22,163,74,0.1)",
}[u] || "rgba(107,114,128,0.1)");

function ScoreRing({ score }: { score: number }) {
  const r = 54, c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = score >= 80 ? "#dc2626" : score >= 50 ? "#ea580c" : score >= 20 ? "#d97706" : "#16a34a";
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12"/>
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        transform="rotate(-90 70 70)" style={{transition:"stroke-dasharray 1s ease"}}/>
      <text x="70" y="66" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">{score}</text>
      <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11">/100</text>
    </svg>
  );
}

export default function AttentionPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["attention"],
    queryFn: () => authFetch("/api/v1/attention/").then(r => r as any),
    refetchInterval: 300000,
  });

  if (isLoading) return (
    <div style={{minHeight:"100vh",background:"#0f0f13",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:"white",fontSize:18}}>Loading operational intelligence...</div>
    </div>
  );

  if (error || !data) return (
    <div style={{minHeight:"100vh",background:"#0f0f13",padding:32,color:"white"}}>
      <h2>Could not load attention dashboard</h2>
    </div>
  );

  const urgency = data.urgency || "LOW";
  const score = data.attention_score || 0;
  const summary = data.summary || {};
  const criticalWOs = data.critical_work_orders || [];
  const overduePM = data.overdue_pm_plans || [];
  const topRecs = data.top_recommendations || [];

  return (
    <div style={{minHeight:"100vh",background:"#0f0f13",color:"white",fontFamily:"system-ui,sans-serif"}}>

      {/* Hero */}
      <div style={{background:`linear-gradient(135deg, #1a0a0a 0%, #0f0f13 100%)`,
        borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"32px 32px 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
            <ScoreRing score={score}/>
            <div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>
                Operational Intelligence
              </div>
              <h1 style={{fontSize:32,fontWeight:700,margin:"0 0 8px",letterSpacing:-0.5}}>
                What Needs Attention
              </h1>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,
                background:urgencyBg(urgency),border:`1px solid ${urgencyColor(urgency)}`,
                borderRadius:8,padding:"6px 14px"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:urgencyColor(urgency)}}/>
                <span style={{color:urgencyColor(urgency),fontWeight:600,fontSize:14}}>
                  {urgency} PRIORITY
                </span>
              </div>
              <div style={{marginTop:12,color:"rgba(255,255,255,0.5)",fontSize:13}}>
                Updated {new Date(data.generated_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{maxWidth:1200,margin:"24px auto",padding:"0 32px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:32}}>
          {[
            {label:"Critical WOs", value:summary.critical_open_wos||0, color:"#dc2626", icon:"🔴"},
            {label:"Overdue PM Plans", value:summary.overdue_pm_plans||0, color:"#ea580c", icon:"📋"},
            {label:"Pending Actions", value:summary.pending_recommendations||0, color:"#d97706", icon:"🤖"},
            {label:"Unassigned >48h", value:summary.aging_unassigned_wos||0, color:"#9333ea", icon:"⏰"},
          ].map(({label, value, color, icon}) => (
            <div key={label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:12,padding:20}}>
              <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
              <div style={{fontSize:32,fontWeight:700,color}}>{value.toLocaleString()}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24}}>

          {/* Critical Work Orders */}
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:24}}>
            <h3 style={{margin:"0 0 16px",fontSize:16,color:"rgba(255,255,255,0.9)"}}>
              🔴 Critical Work Orders
            </h3>
            {criticalWOs.length === 0 ? (
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:14}}>No critical WOs — well done!</div>
            ) : criticalWOs.slice(0,6).map((wo: any, i: number) => (
              <div key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.06)",paddingBottom:12,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{background:"rgba(220,38,38,0.2)",color:"#fca5a5",
                    borderRadius:4,padding:"2px 6px",fontSize:11,fontWeight:600}}>
                    {(wo.priority||"").toUpperCase()}
                  </span>
                  <span style={{fontSize:13,color:"rgba(255,255,255,0.8)"}}>{wo.title||"Untitled"}</span>
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>
                  Status: {wo.status} · {wo.asset_id ? "Asset linked" : "⚠️ No asset"}
                </div>
              </div>
            ))}
            {criticalWOs.length > 6 && (
              <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:8}}>
                +{criticalWOs.length - 6} more critical WOs
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:24}}>
            <h3 style={{margin:"0 0 16px",fontSize:16,color:"rgba(255,255,255,0.9)"}}>
              🤖 AI Recommendations
            </h3>
            {topRecs.length === 0 ? (
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:14}}>No pending recommendations</div>
            ) : topRecs.slice(0,5).map((rec: any, i: number) => (
              <div key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.06)",paddingBottom:12,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{
                    background:rec.risk_level==="CRITICAL"?"rgba(220,38,38,0.2)":rec.risk_level==="HIGH"?"rgba(234,88,12,0.2)":"rgba(107,114,128,0.2)",
                    color:rec.risk_level==="CRITICAL"?"#fca5a5":rec.risk_level==="HIGH"?"#fdba74":"#9ca3af",
                    borderRadius:4,padding:"2px 6px",fontSize:11,fontWeight:600
                  }}>{rec.risk_level||"??"}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{rec.director}</span>
                </div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.5,marginBottom:10}}>
                  {(rec.recommendation||"").slice(0,120)}{rec.recommendation?.length > 120 ? "..." : ""}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button
                    onClick={async()=>{
                      try{await fetch(`/api/v1/recommendations/${rec.id}/approve`,
                        {method:"POST",headers:{"Content-Type":"application/json"},
                         body:JSON.stringify({reviewer:"dashboard",notes:"Approved via attention dashboard"})});
                        window.location.reload();}catch(e){}
                    }}
                    style={{flex:1,background:"rgba(22,163,74,0.15)",border:"1px solid rgba(22,163,74,0.4)",
                      borderRadius:6,padding:"5px 10px",color:"#86efac",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                    ✓ Approve
                  </button>
                  <button
                    onClick={async()=>{
                      const reason=prompt("Reason for rejection (optional):")||"Rejected via dashboard";
                      try{await fetch(`/api/v1/recommendations/${rec.id}/reject`,
                        {method:"POST",headers:{"Content-Type":"application/json"},
                         body:JSON.stringify({reason})});
                        window.location.reload();}catch(e){}
                    }}
                    style={{flex:1,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                      borderRadius:6,padding:"5px 10px",color:"#fca5a5",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                    ✗ Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue PM Plans */}
        {overduePM.length > 0 && (
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(234,88,12,0.3)",
            borderRadius:12,padding:24,marginBottom:24}}>
            <h3 style={{margin:"0 0 16px",fontSize:16,color:"rgba(255,255,255,0.9)"}}>
              📋 Overdue PM Plans ({overduePM.length})
            </h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {overduePM.slice(0,6).map((pm: any, i: number) => (
                <div key={i} style={{background:"rgba(234,88,12,0.08)",border:"1px solid rgba(234,88,12,0.2)",
                  borderRadius:8,padding:16}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#fdba74",marginBottom:4}}>
                    {pm.title||"PM Plan"}
                  </div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>
                    Due: {pm.next_due_date || "unknown"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Required Cards */}
        {(summary.aging_unassigned_wos > 0 || summary.overdue_pm_plans > 0) && (
          <div style={{marginBottom:24}}>
            <h3 style={{margin:"0 0 12px",fontSize:14,color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase",letterSpacing:1}}>⚡ Actions Required</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
              {summary.aging_unassigned_wos > 0 && (
                <a href="/work-orders?filter=unassigned" style={{textDecoration:"none"}}>
                  <div style={{background:"rgba(147,51,234,0.1)",border:"1px solid rgba(147,51,234,0.3)",
                    borderRadius:12,padding:20,cursor:"pointer",transition:"all 0.2s"}}>
                    <div style={{fontSize:13,color:"rgba(147,51,234,0.9)",fontWeight:600,marginBottom:8}}>
                      ⏰ Assign Technicians
                    </div>
                    <div style={{fontSize:24,fontWeight:700,color:"white",marginBottom:4}}>
                      {summary.aging_unassigned_wos}
                    </div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>
                      WOs unassigned for &gt;48h → View Unassigned
                    </div>
                  </div>
                </a>
              )}
              {summary.overdue_pm_plans > 0 && (
                <a href="/maintenance/pm-plans?filter=overdue" style={{textDecoration:"none"}}>
                  <div style={{background:"rgba(234,88,12,0.1)",border:"1px solid rgba(234,88,12,0.3)",
                    borderRadius:12,padding:20,cursor:"pointer"}}>
                    <div style={{fontSize:13,color:"rgba(234,88,12,0.9)",fontWeight:600,marginBottom:8}}>
                      📋 Schedule PM Plans
                    </div>
                    <div style={{fontSize:24,fontWeight:700,color:"white",marginBottom:4}}>
                      {summary.overdue_pm_plans}
                    </div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>
                      Overdue maintenance plans → View PM Plans
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Data Quality Notice */}
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:12,padding:20,marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:20}}>📊</span>
            <div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>Data Quality Notice</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>
                WO→Asset linkage: ~5% of work orders linked to assets.
                MTTR and critical path analysis have limited reliability until linkage improves to &gt;80%.
                Link assets when creating new work orders to improve intelligence accuracy.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
