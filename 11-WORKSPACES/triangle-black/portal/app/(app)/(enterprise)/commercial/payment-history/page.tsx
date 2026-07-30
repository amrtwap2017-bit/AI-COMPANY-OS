"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { if (!d) return "—"; try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const HERO = {background:"linear-gradient(140deg, #2A231E 0%, #332C27 40%, #3D352F 100%)",borderBottom:"1px solid rgba(185,146,76,0.12)",padding:"32px"};

export default function PaymentHistoryPage() {
  const router = useRouter();
  const { data: dash } = useQuery(["pay-dash"], () => authFetch("/api/v1/financial/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: invRaw } = useQuery(["pay-inv"], () => authFetch("/api/v1/supplier-invoices/").then(r=>r.json()), {staleTime:30000});
  const invoices = toArr(invRaw);
  const paid = invoices.filter(i=>i.status==="paid"||i.payment_status==="paid");
  const rev = dash?.revenue||{};
  const costs = dash?.costs||{};

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div style={HERO}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Finance</div>
          <h1 style={{fontSize:"1.75rem",fontWeight:800,color:"#F3EFE8",letterSpacing:"-0.02em",margin:0}}>Payment History</h1>
          <p style={{color:"rgba(210,195,175,0.60)",fontSize:"0.8125rem",marginTop:6}}>{paid.length} payments recorded</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
            {[
              {label:"Total Invoiced",value:fmtEGP(rev.total_invoiced||0),color:"#B9924C"},
              {label:"Collected",value:fmtEGP(rev.total_collected||0),color:"#547C4D"},
              {label:"Outstanding",value:fmtEGP(rev.total_outstanding||0),color:"#B07A2A"},
              {label:"Collection Rate",value:`${Math.round(rev.collection_rate_pct||0)}%`,color:rev.collection_rate_pct>=80?"#547C4D":"#B07A2A"},
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(185,146,76,0.12)",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:"1.125rem",fontWeight:800,color:k.color}}>{k.value}</div>
                <div style={{fontSize:"0.5625rem",color:"rgba(185,165,140,0.55)",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:4}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"2fr 1fr",gap:24}}>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Payment Records</div>
          {paid.length===0 ? (
            <div style={{textAlign:"center",padding:"48px",color:"var(--color-text-3)"}}>
              <div style={{fontSize:"3rem",marginBottom:12,opacity:0.4}}>💳</div>
              <div style={{fontWeight:700,color:"var(--color-text-2)"}}>No payment records yet</div>
            </div>
          ) : paid.map((inv,i)=>(
            <button key={i} onClick={()=>router.push("/commercial/invoices/"+inv.id)}
              style={{display:"flex",alignItems:"center",gap:16,padding:"12px 0",borderBottom:"1px solid var(--color-divider)",width:"100%",textAlign:"left",background:"transparent",cursor:"pointer"}}>
              <div style={{width:36,height:36,borderRadius:8,background:"rgba(84,124,77,0.1)",border:"1px solid rgba(84,124,77,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0}}>💳</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)"}}>{inv.invoice_number||"—"}</div>
                <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:1}}>{inv.vendor_name||inv.vendor_id||"—"}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:"0.9375rem",fontWeight:700,color:"#547C4D"}}>{fmtEGP(inv.total_amount||0)}</div>
                <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{fmtDate(inv.created_at)}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:20}}>
            <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:14}}>Financial Summary</div>
            {[
              ["Total Invoiced",fmtEGP(rev.total_invoiced||0),"#F3EFE8"],
              ["Collected",fmtEGP(rev.total_collected||0),"#547C4D"],
              ["Outstanding",fmtEGP(rev.total_outstanding||0),"#B07A2A"],
              ["Collection Rate",`${Math.round(rev.collection_rate_pct||0)}%`,rev.collection_rate_pct>=80?"#547C4D":"#B07A2A"],
              ["SOW Value",fmtEGP(costs.total_sow_value||0),"#F3EFE8"],
              ["Labor Cost",fmtEGP(costs.total_labor||0),"#F3EFE8"],
            ].map(([label,value,color],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--color-divider)"}}>
                <span style={{fontSize:"0.75rem",color:"var(--color-text-3)"}}>{label}</span>
                <span style={{fontSize:"0.75rem",fontWeight:700,color}}>{value}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>router.push("/commercial/invoices")}
            style={{width:"100%",background:"rgba(185,146,76,0.08)",border:"1px solid rgba(185,146,76,0.22)",borderRadius:8,padding:"10px",color:"#B9924C",fontSize:"0.875rem",fontWeight:600,cursor:"pointer"}}>
            View All Invoices →
          </button>
          <button onClick={()=>router.push("/financial")}
            style={{width:"100%",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,padding:"10px",color:"var(--color-text-2)",fontSize:"0.875rem",cursor:"pointer"}}>
            P&L Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
