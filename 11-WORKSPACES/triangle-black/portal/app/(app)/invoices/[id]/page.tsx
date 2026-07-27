"use client";
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB", {day:"numeric",month:"long",year:"numeric"}); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_CONFIG = {
  paid:      { label:"Paid",      color:"#34D399", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.25)" },
  pending:   { label:"Pending",   color:"#FCD34D", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)" },
  overdue:   { label:"Overdue",   color:"#F87171", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)" },
  cancelled: { label:"Cancelled", color:"#94A3B8", bg:"rgba(148,163,184,0.1)", border:"rgba(148,163,184,0.25)" },
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  // v4 syntax — correct
  const { data: invData, isLoading, isError } = useQuery(
    ["invoice-detail", id],
    () => authFetch(`/api/v1/invoices/${id}`).then(r => r.json()),
    { enabled: !!id }
  );

  // Get all invoices to find related (same contract)
  const { data: allInv } = useQuery(
    ["invoices-all"],
    () => authFetch("/api/v1/invoices/").then(r => r.json())
  );

  // Get contracts to show contract info
  const { data: allContracts } = useQuery(
    ["contracts-inv"],
    () => authFetch("/api/v1/contracts/").then(r => r.json())
  );

  if (isLoading) return (
    <div className="min-h-screen" style={{background:"var(--color-bg)"}}>
      <div style={{background:"#0F172A",height:200}} className="animate-pulse"/>
      <div className="max-w-content mx-auto px-8 py-6 space-y-4">
        {[1,2,3].map(i=><div key={i} style={{height:100,background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:16}} className="animate-pulse"/>)}
      </div>
    </div>
  );

  if (isError || !invData) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"var(--color-bg)"}}>
      <div style={{textAlign:"center",padding:48}}>
        <div style={{fontSize:"3rem",marginBottom:16}}>⚠️</div>
        <div style={{fontSize:"1.25rem",fontWeight:700,color:"var(--color-text-1)"}}>Invoice Not Found</div>
        <div style={{fontSize:"0.875rem",color:"var(--color-text-3)",marginTop:8,marginBottom:24}}>The invoice {id?.slice(0,8)} does not exist or you do not have access.</div>
        <button onClick={() => router.push("/invoices")} style={{background:"var(--color-brand)",color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>← Back to Invoices</button>
      </div>
    </div>
  );

  const inv = Array.isArray(invData) ? invData[0] : invData;
  if (!inv) return null;

  const sc = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;
  const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
  const allInvoices = toArr(allInv);
  const allContractsList = toArr(allContracts);
  const linkedContract = allContractsList.find(c => c.id === inv.contract_id);
  const relatedInvoices = allInvoices.filter(i => i.id !== inv.id && i.contract_id === inv.contract_id && inv.contract_id).slice(0, 5);

  const isOverdue = inv.status === "overdue" || (inv.status === "pending" && inv.due_date && new Date(inv.due_date) < new Date());
  const daysOverdue = isOverdue && inv.due_date ? Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000) : 0;

  return (
    <div className="min-h-screen" style={{background:"var(--color-bg)"}}>

      {/* DARK HEADER */}
      <div style={{background:"linear-gradient(135deg, #0F172A 0%, #111827 100%)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="tb-canvas">

          {/* Back + breadcrumb */}
          <div className="flex items-center gap-3 mb-6" style={{fontSize:"0.75rem",color:"rgba(148,163,184,0.6)"}}>
            <button onClick={() => router.push("/invoices")}
              style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 12px",color:"rgba(248,250,252,0.8)",fontSize:"0.75rem",fontWeight:600,cursor:"pointer",transition:"all 120ms ease"}}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
              ← Invoices
            </button>
            <span style={{color:"rgba(255,255,255,0.2)"}}>/</span>
            <span style={{color:"rgba(148,163,184,0.6)"}}>{inv.invoice_number}</span>
          </div>

          {/* Hero row */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-label-upper text-emerald-500 mb-1.5">Finance · Invoice</div>
              <h1 className="text-page-title" style={{color:"#F1F5F9"}}>
                {inv.invoice_number || `INV-${inv.id?.slice(0,8)}`}
              </h1>
              {inv.title && <p style={{color:"rgba(148,163,184,0.65)",fontSize:"0.875rem",marginTop:6}}>{inv.title}</p>}
            </div>

            {/* Status + amount */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div style={{background:sc.bg,border:`1px solid ${sc.border}`,borderRadius:14,padding:"16px 24px",textAlign:"center"}}>
                <div style={{fontSize:"1.75rem",fontWeight:900,color:sc.color,lineHeight:1}}>{fmtEGP(inv.total_amount)}</div>
                <div style={{fontSize:"0.625rem",color:"rgba(148,163,184,0.6)",marginTop:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Total Amount</div>
                <div style={{marginTop:8}}>
                  <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{sc.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            {[
              { label:"Amount",      value:fmtEGP(inv.total_amount),     color:sc.color },
              { label:"Tax",         value:fmtEGP(inv.tax_amount||0),    color:"rgba(148,163,184,0.8)" },
              { label:"Issue Date",  value:fmtDate(inv.issue_date||inv.created_at), color:"rgba(148,163,184,0.8)" },
              { label:"Due Date",    value:fmtDate(inv.due_date),        color:isOverdue?"#F87171":"rgba(148,163,184,0.8)" },
              { label:"Status",      value:sc.label,                      color:sc.color },
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"11px 12px",backdropFilter:"blur(12px)"}}>
                <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.5)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{k.label}</div>
                <div style={{fontSize:"0.875rem",fontWeight:700,color:k.color,lineHeight:1}}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Overdue warning */}
          {isOverdue && daysOverdue > 0 && (
            <div style={{marginTop:12,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:"1rem"}}>🚨</span>
              <div style={{flex:1,fontSize:"0.75rem",color:"#FCA5A5",fontWeight:600}}>
                This invoice is {daysOverdue} day{daysOverdue>1?"s":""} overdue. Contact the client immediately to arrange payment.
              </div>
              <button onClick={() => router.push("/commercial/contracts")} style={{fontSize:"0.6875rem",fontWeight:700,color:"#F87171",background:"none",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>
                View Contract →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Main — invoice details */}
          <div className="xl:col-span-2 space-y-5">

            {/* Invoice details */}
            <div className="tb-section">
              <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Invoice Details</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:20}}>Financial Information</div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label:"Invoice Number", value:inv.invoice_number||"—" },
                  { label:"Status",         value:<span style={{fontSize:"0.75rem",fontWeight:700,padding:"4px 12px",borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{sc.label}</span> },
                  { label:"Amount (excl. tax)", value:fmtEGP((inv.total_amount||0)-(inv.tax_amount||0)) },
                  { label:"Tax Amount",     value:fmtEGP(inv.tax_amount||0) },
                  { label:"Total Amount",   value:<span style={{fontSize:"1.125rem",fontWeight:900,color:sc.color}}>{fmtEGP(inv.total_amount)}</span> },
                  { label:"Renewal #",      value:inv.renewal_number||"—" },
                  { label:"Issue Date",     value:fmtDate(inv.issue_date||inv.created_at) },
                  { label:"Due Date",       value:<span style={{color:isOverdue?"#EF4444":"var(--color-text-1)",fontWeight:isOverdue?700:400}}>{fmtDate(inv.due_date)}{isOverdue?" ⚠️":""}</span> },
                  { label:"Paid Date",      value:inv.paid_date?fmtDate(inv.paid_date):"Not paid" },
                  { label:"Created",        value:fmtDate(inv.created_at) },
                ].map(({label,value},i) => (
                  <div key={i} style={{background:"var(--color-bg-alt)",borderRadius:12,padding:"14px 16px"}}>
                    <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginBottom:6}}>{label}</div>
                    <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)"}}>{value}</div>
                  </div>
                ))}
              </div>

              {inv.description && (
                <div style={{marginTop:16,background:"var(--color-bg-alt)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginBottom:6}}>Description</div>
                  <div style={{fontSize:"0.875rem",color:"var(--color-text-1)",lineHeight:1.6}}>{inv.description}</div>
                </div>
              )}
              {inv.notes && (
                <div style={{marginTop:12,background:"var(--color-bg-alt)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginBottom:6}}>Notes</div>
                  <div style={{fontSize:"0.875rem",color:"var(--color-text-1)",lineHeight:1.6}}>{inv.notes}</div>
                </div>
              )}
            </div>

            {/* Related invoices */}
            {relatedInvoices.length > 0 && (
              <div className="tb-section">
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Related</div>
                <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Other Invoices on this Contract</div>
                <div className="space-y-2">
                  {relatedInvoices.map((ri,i) => {
                    const rs = STATUS_CONFIG[ri.status] || STATUS_CONFIG.pending;
                    return (
                      <button key={i} onClick={() => router.push(`/invoices/${ri.id}`)} className="w-full text-left"
                        style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,background:"var(--color-bg-alt)",border:"1px solid transparent",transition:"all 120ms ease",cursor:"pointer"}}
                        onMouseEnter={e => {e.currentTarget.style.borderColor="var(--color-brand)";e.currentTarget.style.background="rgba(180,83,9,0.04)";}}
                        onMouseLeave={e => {e.currentTarget.style.borderColor="transparent";e.currentTarget.style.background="var(--color-bg-alt)";}}>
                        <div style={{width:3,height:32,background:rs.color,borderRadius:99,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{ri.invoice_number}</div>
                          <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2}}>{fmtDate(ri.due_date)}</div>
                        </div>
                        <div style={{fontSize:"0.875rem",fontWeight:700,color:rs.color}}>{fmtEGP(ri.total_amount)}</div>
                        <span style={{fontSize:"0.625rem",fontWeight:700,padding:"3px 8px",borderRadius:99,background:rs.bg,color:rs.color,border:`1px solid ${rs.border}`}}>{rs.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Actions */}
            <div className="tb-section">
              <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Actions</div>
              <div className="space-y-2">
                {[
                  { label:"← All Invoices",       icon:"💰", path:"/invoices",                   variant:"secondary" },
                  { label:"View Contract",         icon:"📄", path:inv.contract_id?`/commercial/contracts/${inv.contract_id}`:"/commercial/contracts", variant:"secondary" },
                  { label:"Finance Dashboard",     icon:"📊", path:"/executive/portfolio",         variant:"secondary" },
                  { label:"Collection Report",     icon:"📈", path:"/analytics/costs",             variant:"secondary" },
                ].map((a,i) => (
                  <button key={i} onClick={() => router.push(a.path)} className="w-full text-left flex items-center gap-3"
                    style={{padding:"10px 14px",borderRadius:10,background:i===0?"var(--color-bg-alt)":"transparent",border:`1px solid ${i===0?"var(--color-border)":"transparent"}`,fontSize:"0.8125rem",fontWeight:i===0?600:500,color:"var(--color-text-2)",cursor:"pointer",transition:"all 120ms ease"}}
                    onMouseEnter={e => {e.currentTarget.style.background="rgba(180,83,9,0.06)";e.currentTarget.style.color="var(--color-brand)";e.currentTarget.style.borderColor="rgba(180,83,9,0.2)";}}
                    onMouseLeave={e => {e.currentTarget.style.background=i===0?"var(--color-bg-alt)":"transparent";e.currentTarget.style.color="var(--color-text-2)";e.currentTarget.style.borderColor=i===0?"var(--color-border)":"transparent";}}>
                    <span>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contract info */}
            {linkedContract && (
              <div className="tb-section">
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Linked Contract</div>
                <button onClick={() => router.push(`/commercial/contracts/${linkedContract.id}`)} className="w-full text-left"
                  style={{background:"var(--color-bg-alt)",borderRadius:12,padding:16,border:"1px solid transparent",transition:"all 120ms ease",cursor:"pointer",marginTop:12}}
                  onMouseEnter={e => {e.currentTarget.style.borderColor="var(--color-brand)";}}
                  onMouseLeave={e => {e.currentTarget.style.borderColor="transparent";}}>
                  <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:8}}>{linkedContract.title||`Contract ${linkedContract.id?.slice(0,8)}`}</div>
                  <div className="space-y-2">
                    {[
                      ["Status",    linkedContract.status],
                      ["Value",     fmtEGP(linkedContract.total_value)],
                      ["Monthly",   fmtEGP(linkedContract.monthly_value)],
                      ["Expires",   fmtDate(linkedContract.end_date)],
                    ].map(([l,v],i) => (
                      <div key={i} className="flex justify-between" style={{fontSize:"0.75rem"}}>
                        <span style={{color:"var(--color-text-3)"}}>{l}</span>
                        <span style={{fontWeight:600,color:"var(--color-text-1)"}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:"0.6875rem",color:"var(--color-brand)",marginTop:12,fontWeight:600}}>View full contract →</div>
                </button>
              </div>
            )}

            {/* Meta */}
            <div className="tb-section">
              <div style={{fontSize:"0.875rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:12}}>Record Info</div>
              {[
                ["Invoice ID",  inv.id?.slice(0,16)+"..."],
                ["Hotel",       inv.hotel_id?.slice(0,12)+"..."],
                ["Created",     fmtDate(inv.created_at)],
                ["Updated",     fmtDate(inv.updated_at)],
              ].map(([l,v],i) => (
                <div key={i} className="flex justify-between" style={{fontSize:"0.75rem",padding:"8px 0",borderBottom:i<3?"1px solid var(--color-divider)":"none"}}>
                  <span style={{color:"var(--color-text-3)"}}>{l}</span>
                  <span style={{fontWeight:500,color:"var(--color-text-2)",fontFamily:"monospace"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
