"use client";
// @ts-nocheck
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); }
  catch { return "—"; }
};
const SC = {active:"#547C4D",pending_signature:"#B07A2A",expired:"#A84A3D",draft:"#6D5F53"};

export default function ContractDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { data: contract, isLoading } = useQuery(
    ["contract-detail", id],
    () => authFetch(`/api/v1/contracts/${id}`).then(r=>r.json()),
    { enabled: !!id }
  );

  const activate = useMutation({
    mutationFn: () => authFetch(`/api/v1/contracts/${id}/activate`, {method:"POST"}).then(r=>r.json()),
    onSuccess: () => window.location.reload(),
  });

  if (isLoading) return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:"var(--color-text-3)",fontSize:"0.875rem"}}>Loading contract...</div>
    </div>
  );

  if (!contract || contract.error || contract.detail) return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:"3rem"}}>📄</div>
      <div style={{fontSize:"1.125rem",fontWeight:700,color:"var(--color-text-1)"}}>Contract not found</div>
      <button onClick={()=>router.push("/commercial/contracts")} style={{background:"rgba(185,146,76,0.1)",border:"1px solid rgba(185,146,76,0.25)",borderRadius:8,padding:"10px 20px",color:"#B9924C",fontSize:"0.875rem",fontWeight:600,cursor:"pointer"}}>
        ← Back to Contracts
      </button>
    </div>
  );

  const sc = SC[contract.status] || "#6D5F53";

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(140deg, #2A231E 0%, #332C27 40%, #3D352F 100%)",borderBottom:"1px solid rgba(185,146,76,0.12)",padding:"32px"}}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <button onClick={()=>router.push("/commercial/contracts")} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"4px 10px",color:"rgba(243,239,232,0.7)",fontSize:"0.75rem",cursor:"pointer"}}>
                  ← Contracts
                </button>
                <span style={{color:"rgba(255,255,255,0.2)"}}>›</span>
                <span style={{color:"rgba(243,239,232,0.5)",fontSize:"0.75rem",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{contract.title}</span>
              </div>
              <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Contract</div>
              <h1 style={{fontSize:"1.75rem",fontWeight:800,color:"#F3EFE8",letterSpacing:"-0.02em",margin:0,maxWidth:600}}>{contract.title}</h1>
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:10}}>
                <span style={{background:`${sc}20`,color:sc,border:`1px solid ${sc}40`,borderRadius:20,padding:"3px 12px",fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase"}}>
                  {(contract.status||"").replace(/_/g," ")}
                </span>
                {contract.renewal_count > 0 && (
                  <span style={{color:"rgba(178,159,139,0.7)",fontSize:"0.8125rem"}}>Renewal #{contract.renewal_count}</span>
                )}
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              {contract.status === "pending_signature" && (
                <button onClick={()=>activate.mutate()} disabled={activate.isLoading}
                  style={{background:"linear-gradient(135deg,#8F6F3D,#B9924C)",border:"none",borderRadius:8,padding:"10px 20px",color:"#181614",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>
                  {activate.isLoading ? "Activating..." : "✓ Activate Contract"}
                </button>
              )}
            </div>
          </div>

          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:24}}>
            {[
              {label:"Contract Value",value:fmtEGP(contract.total_value),color:"#B9924C"},
              {label:"Monthly Value",value:fmtEGP(contract.monthly_value),color:"#F3EFE8"},
              {label:"Duration",value:`${contract.duration_months||"—"} months`,color:"#F3EFE8"},
              {label:"Period",value:`${fmtDate(contract.start_date)} — ${fmtDate(contract.end_date)}`,color:"#F3EFE8"},
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(185,146,76,0.12)",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:"1.125rem",fontWeight:800,color:k.color,letterSpacing:"-0.02em"}}>{k.value}</div>
                <div style={{fontSize:"0.5625rem",color:"rgba(185,165,140,0.55)",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:4}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"2fr 1fr",gap:24}}>
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {/* Description */}
          {contract.description && (
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:12}}>Description</div>
              <p style={{fontSize:"0.875rem",color:"var(--color-text-2)",lineHeight:1.6,margin:0}}>{contract.description}</p>
            </div>
          )}

          {/* Services */}
          {contract.services && (
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:12}}>Services Included</div>
              <div style={{fontSize:"0.875rem",color:"var(--color-text-2)",lineHeight:1.6}}>
                {typeof contract.services === "string" ? contract.services :
                 Array.isArray(contract.services) ? contract.services.join(", ") :
                 JSON.stringify(contract.services)}
              </div>
            </div>
          )}

          {/* Notes */}
          {contract.notes && (
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:12}}>Notes</div>
              <p style={{fontSize:"0.875rem",color:"var(--color-text-2)",lineHeight:1.6,margin:0}}>{contract.notes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:20}}>
            <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:14}}>Contract Details</div>
            {[
              {label:"Contract ID",value:contract.id?.slice(0,16)+"..."},
              {label:"Status",value:(contract.status||"—").replace(/_/g," ")},
              {label:"Total Value",value:fmtEGP(contract.total_value)},
              {label:"Monthly Value",value:fmtEGP(contract.monthly_value)},
              {label:"Duration",value:`${contract.duration_months||"—"} months`},
              {label:"Start Date",value:fmtDate(contract.start_date)},
              {label:"End Date",value:fmtDate(contract.end_date)},
              {label:"Renewals",value:contract.renewal_count||0},
            ].map((row,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--color-divider)"}}>
                <span style={{fontSize:"0.75rem",color:"var(--color-text-3)"}}>{row.label}</span>
                <span style={{fontSize:"0.75rem",fontWeight:600,color:"var(--color-text-1)"}}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:20}}>
            <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:14}}>Actions</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {contract.status === "active" && (
                <button onClick={()=>authFetch(`/api/v1/contracts/${id}/renew`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})}).then(()=>window.location.reload())}
                  style={{width:"100%",background:"rgba(185,146,76,0.08)",border:"1px solid rgba(185,146,76,0.22)",borderRadius:8,padding:"10px",color:"#B9924C",fontSize:"0.875rem",fontWeight:600,cursor:"pointer"}}>
                  🔄 Renew Contract
                </button>
              )}
              <button onClick={()=>router.push("/commercial/contracts")}
                style={{width:"100%",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,padding:"10px",color:"var(--color-text-2)",fontSize:"0.875rem",cursor:"pointer"}}>
                ← All Contracts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
