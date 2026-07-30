"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { if (!d) return "—"; try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const SC = {submitted:"#B07A2A",matching:"#5B7C8C",approved:"#547C4D",paid:"#547C4D",failed:"#A84A3D",draft:"#6D5F53"};
const HERO = {background:"linear-gradient(140deg, #2A231E 0%, #332C27 40%, #3D352F 100%)",borderBottom:"1px solid rgba(185,146,76,0.12)",padding:"32px"};

export default function CommercialInvoicesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: raw, isLoading } = useQuery(["comm-inv"], () => authFetch("/api/v1/supplier-invoices/").then(r=>r.json()), {staleTime:30000});
  const { data: dash } = useQuery(["comm-inv-dash"], () => authFetch("/api/v1/supplier-invoices/dashboard").then(r=>r.json()), {staleTime:60000});
  const invoices = toArr(raw);
  const filtered = filter==="all" ? invoices : invoices.filter(i=>i.status===filter);
  const totals = dash?.totals || {};

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div style={HERO}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Finance</div>
          <h1 style={{fontSize:"1.75rem",fontWeight:800,color:"#F3EFE8",letterSpacing:"-0.02em",margin:0}}>Invoices</h1>
          <p style={{color:"rgba(210,195,175,0.60)",fontSize:"0.8125rem",marginTop:6}}>{invoices.length} invoices · {fmtEGP(totals.total_value||0)} total</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
            {[
              {label:"Total Invoiced",value:fmtEGP(totals.total_value||0),color:"#B9924C"},
              {label:"Outstanding",value:fmtEGP(totals.total_outstanding||0),color:"#B07A2A"},
              {label:"Paid",value:invoices.filter(i=>i.status==="paid").length,color:"#547C4D"},
              {label:"Pending",value:invoices.filter(i=>i.status==="submitted"||i.status==="matching").length,color:"#B07A2A"},
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(185,146,76,0.12)",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:"1.25rem",fontWeight:800,color:k.color,letterSpacing:"-0.02em"}}>{k.value}</div>
                <div style={{fontSize:"0.5625rem",color:"rgba(185,165,140,0.55)",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:4}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px"}}>
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {["all","draft","submitted","matching","approved","paid"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:"6px 16px",borderRadius:99,fontSize:"0.8125rem",fontWeight:600,cursor:"pointer",
                border:filter===f?"1px solid rgba(185,146,76,0.4)":"1px solid var(--color-border)",
                background:filter===f?"rgba(185,146,76,0.1)":"transparent",
                color:filter===f?"#B9924C":"var(--color-text-3)"}}>
              {f==="all"?"All":f}{f!=="all"&&` (${invoices.filter(i=>i.status===f).length})`}
            </button>
          ))}
        </div>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"12px 24px",background:"var(--color-bg-alt)",borderBottom:"1px solid var(--color-border)",display:"grid",gridTemplateColumns:"1fr 140px 100px 120px 100px",gap:16}}>
            {["Invoice / Vendor","Status","Currency","Amount","Date"].map((h,i)=>(
              <div key={i} style={{fontSize:"0.5625rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:"var(--color-text-3)",textAlign:i>0?"center":"left"}}>{h}</div>
            ))}
          </div>
          {isLoading ? <TableSkeleton rows={3} />
          : filtered.length===0 ? (
            <div style={{padding:"48px",textAlign:"center",color:"var(--color-text-3)"}}>No invoices found</div>
          ) : filtered.map((inv,i)=>{
            const sc = SC[inv.status]||"#6D5F53";
            return (
              <button key={i} onClick={()=>router.push("/commercial/invoices/"+inv.id)}
                style={{display:"grid",gridTemplateColumns:"1fr 140px 100px 120px 100px",gap:16,padding:"14px 24px",
                  borderBottom:"1px solid var(--color-divider)",cursor:"pointer",textAlign:"left",
                  width:"100%",background:"transparent",transition:"background 160ms ease"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--color-bg-alt)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv.invoice_number||"—"}</div>
                  <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:2}}>{inv.vendor_name||inv.vendor_id||"—"}</div>
                </div>
                <div style={{textAlign:"center"}}><span style={{background:`${sc}15`,color:sc,border:`1px solid ${sc}30`,borderRadius:20,padding:"2px 10px",fontSize:"0.5625rem",fontWeight:700,textTransform:"uppercase"}}>{inv.status}</span></div>
                <div style={{textAlign:"center",fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-2)"}}>{inv.currency||"EGP"}</div>
                <div style={{textAlign:"center",fontSize:"0.875rem",fontWeight:700,color:"#B9924C"}}>{fmtEGP(inv.total_amount||0)}</div>
                <div style={{textAlign:"center",fontSize:"0.75rem",color:"var(--color-text-3)"}}>{fmtDate(inv.created_at)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
