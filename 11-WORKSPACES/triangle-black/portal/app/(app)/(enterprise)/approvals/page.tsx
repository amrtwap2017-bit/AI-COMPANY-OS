"use client";
// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtRelative = (d) => {
  if (!d) return "";
  try { const h=Math.floor((Date.now()-new Date(d).getTime())/3600000); return h<1?"just now":h<24?h+"h ago":Math.floor(h/24)+"d ago"; }
  catch { return ""; }
};
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const DOC_ICONS = {sow:"📋",po:"📦",rfq:"📝",quotation_selection:"⚖️"};

export default function ApprovalsPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: raw, isLoading } = useQuery(
    ["approvals-all"],
    () => authFetch("/api/v1/approval-requests/").then(r=>r.json()),
    { staleTime: 20000 }
  );

  const approvals = toArr(raw);
  const pending = approvals.filter(a=>a.status==="pending");
  const done = approvals.filter(a=>a.status!=="pending");

  const approve = useMutation({
    mutationFn: (id) => authFetch(`/api/v1/approval-requests/${id}/approve`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({approved_by:"amr@triangleblack.com"})
    }).then(r=>r.json()),
    onSuccess: () => { toast.success("Approval recorded successfully"); qc.invalidateQueries(["approvals-all"]); },
  });

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div style={{background:"linear-gradient(140deg, #2A231E 0%, #332C27 40%, #3D352F 100%)",borderBottom:"1px solid rgba(185,146,76,0.12)",padding:"32px"}}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Approvals</div>
          <h1 style={{fontSize:"1.75rem",fontWeight:800,color:"#F3EFE8",letterSpacing:"-0.02em",margin:0}}>Approval Center</h1>
          <p style={{color:"rgba(210,195,175,0.60)",fontSize:"0.8125rem",marginTop:6}}>{pending.length} pending · {approvals.length} total</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
            {[
              {label:"Pending",value:pending.length,color:pending.length>0?"#B07A2A":"#547C4D"},
              {label:"Approved",value:approvals.filter(a=>a.status==="approved").length,color:"#547C4D"},
              {label:"Rejected",value:approvals.filter(a=>a.status==="rejected").length,color:"#A84A3D"},
              {label:"Total",value:approvals.length,color:"#F3EFE8"},
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(185,146,76,0.12)",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:"1.5rem",fontWeight:800,color:k.color}}>{k.value}</div>
                <div style={{fontSize:"0.5625rem",color:"rgba(185,165,140,0.55)",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:4}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"flex",flexDirection:"column",gap:24}}>
        {pending.length > 0 && (
          <div style={{background:"var(--color-surface)",border:"1px solid rgba(176,122,42,0.25)",borderRadius:14,padding:24}}>
            <div style={{fontSize:"1rem",fontWeight:700,color:"#B07A2A",marginBottom:16}}>✍ Awaiting Approval ({pending.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {pending.map((a,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:16,padding:16,background:"var(--color-bg-alt)",borderRadius:10,border:"1px solid rgba(176,122,42,0.15)"}}>
                  <span style={{fontSize:"1.5rem",flexShrink:0}}>{DOC_ICONS[a.document_type]||"📄"}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.9375rem",fontWeight:600,color:"var(--color-text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
                    <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:2}}>
                      {a.document_type?.toUpperCase()} {a.document_number} · {fmtRelative(a.requested_at)} · by {a.requested_by}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:"1rem",fontWeight:800,color:"#B9924C"}}>{fmtEGP(a.amount)}</div>
                    <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{a.currency}</div>
                  </div>
                  <button onClick={()=>approve.mutate(a.id)} disabled={approve.isLoading}
                    style={{background:"linear-gradient(135deg,#8F6F3D,#B9924C)",border:"none",borderRadius:8,padding:"8px 16px",color:"#181614",fontSize:"0.8125rem",fontWeight:700,cursor:"pointer",flexShrink:0}}>
                    Approve ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>All Approval Requests</div>
          {isLoading ? (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[1,2,3].map(i=><div key={i} style={{height:48,background:"var(--color-bg-alt)",borderRadius:8,animation:"pulse 1.5s ease-in-out infinite"}}/>)}
            </div>
          ) : approvals.length === 0 ? (
            <div style={{textAlign:"center",padding:"48px 0",color:"var(--color-text-3)"}}>
              <div style={{fontSize:"3rem",marginBottom:12,opacity:0.4}}>✍</div>
              <div style={{fontWeight:700,color:"var(--color-text-2)"}}>No approval requests</div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {approvals.map((a,i)=>{
                const sc = a.status==="approved"?"#547C4D":a.status==="rejected"?"#A84A3D":a.status==="pending"?"#B07A2A":"#6D5F53";
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--color-bg-alt)",borderRadius:8}}>
                    <span style={{fontSize:"1.1rem"}}>{DOC_ICONS[a.document_type]||"📄"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"0.875rem",color:"var(--color-text-1)",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
                      <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:1}}>{a.document_type} · {fmtRelative(a.requested_at)}</div>
                    </div>
                    <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)",flexShrink:0}}>{fmtEGP(a.amount)}</div>
                    <span style={{background:`${sc}15`,color:sc,border:`1px solid ${sc}30`,borderRadius:20,padding:"2px 10px",fontSize:"0.5625rem",fontWeight:700,textTransform:"uppercase",flexShrink:0}}>{a.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
