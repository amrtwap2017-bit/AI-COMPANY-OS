"use client";
// @ts-nocheck
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
import { useRouter, useParams } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { if (!d) return "—"; try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {submitted:"#B07A2A",matching:"#5B7C8C",approved:"#547C4D",paid:"#547C4D",failed:"#A84A3D",draft:"#6D5F53"};
const HERO = {background:"linear-gradient(140deg, #2A231E 0%, #332C27 40%, #3D352F 100%)",borderBottom:"1px solid rgba(185,146,76,0.12)",padding:"32px"};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: inv, isLoading } = useQuery(
    ["inv-detail",id],
    () => authFetch(`/api/v1/supplier-invoices/${id}`).then(r=>r.json()),
    {enabled:!!id}
  );
  const approve = useMutation({
    mutationFn: () => authFetch(`/api/v1/supplier-invoices/${id}/approve`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"approve"})}).then(r=>r.json()),
    onSuccess: () => { toast.success('Invoice approved'); window.location.reload(); },
  });
  const pay = useMutation({
    mutationFn: () => authFetch(`/api/v1/supplier-invoices/${id}/pay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:inv?.total_amount,payment_method:"bank_transfer"})}).then(r=>r.json()),
    onSuccess: () => { toast.success('Payment recorded'); window.location.reload(); },
  });

  if (isLoading) return <div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--color-text-3)"}}>Loading invoice...</div>;
  if (!inv||inv.error||inv.detail) return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:"3rem"}}>📄</div>
      <div style={{fontSize:"1.125rem",fontWeight:700,color:"var(--color-text-1)"}}>Invoice not found</div>
      <button onClick={()=>router.push("/commercial/invoices")} style={{background:"rgba(185,146,76,0.1)",border:"1px solid rgba(185,146,76,0.25)",borderRadius:8,padding:"10px 20px",color:"#B9924C",fontSize:"0.875rem",fontWeight:600,cursor:"pointer"}}>← Back to Invoices</button>
    </div>
  );
  const sc = SC[inv.status]||"#6D5F53";

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div style={HERO}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24}}>
            <div>
              <button onClick={()=>router.push("/commercial/invoices")} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"4px 10px",color:"rgba(243,239,232,0.7)",fontSize:"0.75rem",cursor:"pointer",marginBottom:12}}>← Invoices</button>
              <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Invoice</div>
              <h1 style={{fontSize:"1.75rem",fontWeight:800,color:"#F3EFE8",letterSpacing:"-0.02em",margin:0}}>{inv.invoice_number}</h1>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                <span style={{background:`${sc}20`,color:sc,border:`1px solid ${sc}40`,borderRadius:20,padding:"3px 12px",fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase"}}>{inv.status}</span>
                <span style={{color:"rgba(178,159,139,0.6)",fontSize:"0.8125rem"}}>{inv.vendor_name||inv.vendor_id||""}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              {inv.status==="submitted"&&<button onClick={()=>approve.mutate()} style={{background:"linear-gradient(135deg,#8F6F3D,#B9924C)",border:"none",borderRadius:8,padding:"10px 20px",color:"#181614",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>✓ Approve</button>}
              {inv.status==="approved"&&<button onClick={()=>pay.mutate()} style={{background:"linear-gradient(135deg,#3D6438,#547C4D)",border:"none",borderRadius:8,padding:"10px 20px",color:"#F3EFE8",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>💳 Record Payment</button>}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:24}}>
            {[
              {label:"Total Amount",value:fmtEGP(inv.total_amount||0),color:"#B9924C"},
              {label:"VAT",value:fmtEGP(inv.vat_amount||0),color:"#F3EFE8"},
              {label:"Balance Due",value:fmtEGP(inv.balance_due||inv.total_amount||0),color:inv.payment_status==="paid"?"#547C4D":"#B07A2A"},
              {label:"Due Date",value:fmtDate(inv.due_date),color:"#F3EFE8"},
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
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Invoice Details</div>
          {[
            ["Invoice Number",inv.invoice_number],
            ["Vendor",inv.vendor_name||inv.vendor_id||"—"],
            ["PO Reference",inv.po_id||"—"],
            ["Subtotal",fmtEGP(inv.subtotal||0)],
            ["VAT Amount",fmtEGP(inv.vat_amount||0)],
            ["Total Amount",fmtEGP(inv.total_amount||0)],
            ["Amount Paid",fmtEGP(inv.amount_paid||0)],
            ["Balance Due",fmtEGP(inv.balance_due||0)],
            ["Payment Status",inv.payment_status||"—"],
            ["Due Date",fmtDate(inv.due_date)],
            ["Created",fmtDate(inv.created_at)],
          ].map(([label,value],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--color-divider)"}}>
              <span style={{fontSize:"0.8125rem",color:"var(--color-text-3)"}}>{label}</span>
              <span style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{value}</span>
            </div>
          ))}
          {inv.notes&&<div style={{marginTop:16,padding:12,background:"var(--color-bg-alt)",borderRadius:8,fontSize:"0.8125rem",color:"var(--color-text-2)",lineHeight:1.5}}>{inv.notes}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:20}}>
            <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:14}}>3-Way Match</div>
            {[
              {label:"Match Result",value:inv.match_result||"pending",color:inv.match_result==="matched"?"#547C4D":"#B07A2A"},
              {label:"PO Total",value:fmtEGP(inv.po_total||0),color:"var(--color-text-1)"},
              {label:"GRN Total",value:fmtEGP(inv.grn_total||0),color:"var(--color-text-1)"},
              {label:"Variance",value:`${inv.match_variance_pct||0}%`,color:Number(inv.match_variance_pct||0)>5?"#A84A3D":"#547C4D"},
            ].map((row,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--color-divider)"}}>
                <span style={{fontSize:"0.75rem",color:"var(--color-text-3)"}}>{row.label}</span>
                <span style={{fontSize:"0.75rem",fontWeight:600,color:row.color}}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:20}}>
            <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:12}}>Actions</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {inv.status==="submitted"&&<button onClick={()=>approve.mutate()} style={{width:"100%",background:"rgba(185,146,76,0.08)",border:"1px solid rgba(185,146,76,0.22)",borderRadius:8,padding:"10px",color:"#B9924C",fontSize:"0.875rem",fontWeight:600,cursor:"pointer"}}>✓ Approve Invoice</button>}
              {inv.status==="approved"&&<button onClick={()=>pay.mutate()} style={{width:"100%",background:"rgba(84,124,77,0.08)",border:"1px solid rgba(84,124,77,0.22)",borderRadius:8,padding:"10px",color:"#547C4D",fontSize:"0.875rem",fontWeight:600,cursor:"pointer"}}>💳 Record Payment</button>}
              <button onClick={()=>router.push("/commercial/invoices")} style={{width:"100%",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,padding:"10px",color:"var(--color-text-2)",fontSize:"0.875rem",cursor:"pointer"}}>← All Invoices</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
