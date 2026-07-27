"use client";
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric"}); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_CONFIG = {
  active:            { color:"#34D399", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.25)",  label:"Active" },
  pending_signature: { color:"#FCD34D", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)",  label:"Pending Signature" },
  expired:           { color:"#F87171", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",   label:"Expired" },
  draft:             { color:"#94A3B8", bg:"rgba(148,163,184,0.1)", border:"rgba(148,163,184,0.2)",  label:"Draft" },
};

export default function ContractDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const { data: contractData, isLoading, isError } = useQuery(
    ["contract-detail", id],
    () => authFetch(`/api/v1/contracts/${id}`).then(r => r.json()),
    { enabled: !!id }
  );
  const { data: allInvRaw }  = useQuery(["contract-invoices"],  () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: allWOsRaw }  = useQuery(["contract-wos"],       () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: allSRsRaw }  = useQuery(["contract-srs"],       () => authFetch("/api/v1/service-requests/").then(r=>r.json()));

  if (isLoading) return (
    <div className="min-h-screen" className="bg-base">
      <div style={{background:"#0F172A",height:240}} className="animate-pulse"/>
    </div>
  );

  if (isError || !contractData) return (
    <div className="min-h-screen flex items-center justify-center" className="bg-base">
      <div style={{textAlign:"center"}}>
        <div className="tb-empty-icon">📄</div>
        <div style={{fontSize:"1.125rem",fontWeight:700,color:"var(--color-text-1)"}}>Contract Not Found</div>
        <button onClick={()=>router.push("/commercial/contracts")} style={{marginTop:20,background:"var(--color-brand)",color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>← Back to Contracts</button>
      </div>
    </div>
  );

  const contract = Array.isArray(contractData) ? contractData[0] : contractData;
  if (!contract) return null;

  const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
  const allInvoices = toArr(allInvRaw);
  const allWOs      = toArr(allWOsRaw);
  const allSRs      = toArr(allSRsRaw);

  const sc = STATUS_CONFIG[contract.status] || STATUS_CONFIG.draft;
  const contractInvoices = allInvoices.filter(i => i.contract_id === contract.id);
  const contractWOs      = allWOs.filter(w => w.contract_id === contract.id);
  const contractSRs      = allSRs.filter(s => s.contract_id === contract.id);

  const now     = new Date();
  const in30    = new Date(now.getTime() + 30*86400000);
  const daysLeft = contract.end_date ? Math.ceil((new Date(contract.end_date)-Date.now())/86400000) : null;
  const isExpiring = contract.status==="active" && contract.end_date && new Date(contract.end_date)>=now && new Date(contract.end_date)<=in30;
  const isExpired  = contract.status==="expired" || (contract.end_date && new Date(contract.end_date)<now);

  const paidInvoices   = contractInvoices.filter(i=>i.status==="paid");
  const pendingInvoices= contractInvoices.filter(i=>i.status==="pending");
  const totalInvoiced  = contractInvoices.reduce((s,i)=>s+Number(i.total_amount||0),0);
  const totalPaid      = paidInvoices.reduce((s,i)=>s+Number(i.total_amount||0),0);

  return (
    <div className="min-h-screen" className="bg-base">

      {/* DARK HEADER */}
      <div style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1520 100%)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div className="tb-canvas">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={()=>router.push("/commercial/contracts")}
              className="tb-breadcrumb-btn"
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
              ← Contracts
            </button>
            <span className="tb-breadcrumb-sep">/</span>
            <span style={{color:"rgba(148,163,184,0.6)",fontSize:"0.75rem"}} className="truncate">{contract.title||contract.id?.slice(0,16)}</span>
          </div>

          {/* Hero */}
          <div className="flex items-start justify-between gap-6">
            <div style={{flex:1,minWidth:0}}>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div style={{fontSize:"0.625rem",fontWeight:700,color:"#F59E0B",textTransform:"uppercase",letterSpacing:"0.1em"}}>Commercial · Contract</div>
                <span style={{fontSize:"0.6875rem",fontWeight:700,padding:"3px 10px",borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{sc.label}</span>
                {contract.renewal_count > 0 && <span style={{fontSize:"0.6875rem",padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,0.06)",color:"rgba(148,163,184,0.7)"}}>Renewal #{contract.renewal_count}</span>}
              </div>
              <h1 style={{fontSize:"2rem",fontWeight:900,color:"#F1F5F9",letterSpacing:"-0.02em",lineHeight:1.1,margin:0}} className="truncate">{contract.title||`Contract ${contract.id?.slice(0,8)}`}</h1>
              {contract.description && <p style={{color:"rgba(148,163,184,0.6)",fontSize:"0.8125rem",marginTop:6,lineHeight:1.5}}>{contract.description}</p>}
            </div>

            {/* Value badge */}
            <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.22)",borderRadius:16,padding:"18px 24px",textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:"1.625rem",fontWeight:900,color:"#34D399",lineHeight:1}}>{fmtEGP(contract.total_value)}</div>
              <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.6)",marginTop:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Contract Value</div>
              {contract.monthly_value && <div style={{fontSize:"0.75rem",color:"rgba(52,211,153,0.7)",marginTop:4}}>{fmtEGP(contract.monthly_value)} / month</div>}
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6">
            {[
              { label:"Total Value",  value:fmtEGP(contract.total_value),     color:"#34D399" },
              { label:"Monthly",      value:fmtEGP(contract.monthly_value),    color:"rgba(148,163,184,0.8)" },
              { label:"Start Date",   value:fmtDate(contract.start_date),      color:"rgba(148,163,184,0.8)" },
              { label:"End Date",     value:fmtDate(contract.end_date),        color:isExpiring?"#FBBF24":isExpired?"#F87171":"rgba(148,163,184,0.8)" },
              { label:"Duration",     value:contract.duration_months?`${contract.duration_months}mo`:"—", color:"rgba(148,163,184,0.8)" },
              { label:"Days Left",    value:daysLeft!==null?(daysLeft>0?`${daysLeft}d`:"Expired"):"—", color:isExpiring?"#FBBF24":isExpired?"#F87171":"#34D399" },
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"11px 12px",backdropFilter:"blur(12px)"}}>
                <div style={{fontSize:"0.5625rem",color:"rgba(148,163,184,0.5)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{k.label}</div>
                <div style={{fontSize:"0.8125rem",fontWeight:700,color:k.color,lineHeight:1.3}} className="truncate">{k.value}</div>
              </div>
            ))}
          </div>

          {/* Expiry alert */}
          {isExpiring && (
            <div style={{marginTop:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
              <span>⏰</span>
              <div style={{flex:1,fontSize:"0.75rem",color:"#FCD34D",fontWeight:600}}>Contract expires in {daysLeft} day{daysLeft!==1?"s":""} — initiate renewal process immediately.</div>
              <button onClick={()=>router.push("/customers/renewals")} style={{fontSize:"0.6875rem",fontWeight:700,color:"#FBBF24",background:"none",border:"1px solid rgba(245,158,11,0.3)",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Renewals →</button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Main */}
          <div className="xl:col-span-2 space-y-5">

            {/* Contract details */}
            <div className="tb-section">
              <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Contract Details</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:20}}>Terms & Conditions</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Status",    <span style={{fontSize:"0.75rem",fontWeight:700,padding:"4px 12px",borderRadius:20,background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{sc.label}</span>],
                  ["Total Value",    fmtEGP(contract.total_value)],
                  ["Monthly Value",  fmtEGP(contract.monthly_value)],
                  ["Duration",       contract.duration_months?`${contract.duration_months} months`:"—"],
                  ["Start Date",     fmtDate(contract.start_date)],
                  ["End Date",       <span style={{color:isExpiring?"#F59E0B":isExpired?"#EF4444":"inherit",fontWeight:(isExpiring||isExpired)?700:400}}>{fmtDate(contract.end_date)}</span>],
                  ["Renewal Count",  contract.renewal_count||0],
                  ["Invoices",       contractInvoices.length],
                  ["Work Orders",    contractWOs.length],
                  ["Service Reqs",   contractSRs.length],
                ].map(([l,v],i)=>(
                  <div key={i} style={{background:"var(--color-bg-alt)",borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:"0.625rem",color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{l}</div>
                    <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)"}}>{v}</div>
                  </div>
                ))}
              </div>
              {contract.services && (
                <div style={{marginTop:12,background:"var(--color-bg-alt)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:"0.625rem",color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Services</div>
                  <div style={{fontSize:"0.875rem",color:"var(--color-text-1)",lineHeight:1.6}}>{contract.services}</div>
                </div>
              )}
              {contract.notes && (
                <div style={{marginTop:12,background:"var(--color-bg-alt)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:"0.625rem",color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Notes</div>
                  <div style={{fontSize:"0.875rem",color:"var(--color-text-1)",lineHeight:1.6}}>{contract.notes}</div>
                </div>
              )}
            </div>

            {/* Invoices */}
            {contractInvoices.length > 0 && (
              <div className="tb-section">
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Finance</div>
                <div className="flex items-center justify-between" style={{marginBottom:12}}>
                  <div className="tb-empty-title">Invoices ({contractInvoices.length})</div>
                  <div style={{fontSize:"0.75rem",color:"#34D399",fontWeight:700}}>{fmtEGP(totalPaid)} collected</div>
                </div>
                {/* Progress */}
                <div style={{height:4,background:"var(--color-bg-alt)",borderRadius:99,overflow:"hidden",marginBottom:16}}>
                  <div style={{height:4,background:"#34D399",borderRadius:99,width:`${totalInvoiced>0?totalPaid/totalInvoiced*100:0}%`,transition:"width 600ms ease"}}/>
                </div>
                <div className="space-y-2">
                  {contractInvoices.slice(0,6).map((inv,i)=>{
                    const ic = {paid:"#34D399",pending:"#FCD34D",overdue:"#F87171",cancelled:"#94A3B8"}[inv.status]||"#94A3B8";
                    return (
                      <button key={i} onClick={()=>router.push(`/invoices/${inv.id}`)} className="w-full text-left"
                        style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,background:"var(--color-bg-alt)",border:"1px solid transparent",transition:"all 120ms",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-brand)"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
                        <div style={{width:3,height:28,background:ic,borderRadius:99,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{inv.invoice_number}</div>
                          <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2}}>Due {fmtDate(inv.due_date)}</div>
                        </div>
                        <div style={{fontSize:"0.875rem",fontWeight:700,color:ic}}>{fmtEGP(inv.total_amount)}</div>
                        <span style={{fontSize:"0.625rem",fontWeight:700,padding:"3px 8px",borderRadius:99,background:`${ic}18`,color:ic,flexShrink:0}}>{inv.status}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Work Orders */}
            {contractWOs.length > 0 && (
              <div className="tb-section">
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Operations</div>
                <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Work Orders ({contractWOs.length})</div>
                <div className="space-y-2">
                  {contractWOs.slice(0,5).map((w,i)=>{
                    const wc = {open:"#60A5FA",in_progress:"#FCD34D",completed:"#34D399"}[w.status]||"#94A3B8";
                    const pc = {critical:"#F87171",high:"#FB923C",medium:"#FCD34D",low:"#94A3B8"}[w.priority]||"#94A3B8";
                    return (
                      <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)} className="w-full text-left"
                        style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,background:"var(--color-bg-alt)",border:"1px solid transparent",transition:"all 120ms",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-brand)"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
                        <div style={{width:3,height:28,background:pc,borderRadius:99,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}} className="truncate">{w.title}</div>
                          <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:2}}>{w.priority} · {fmtDate(w.created_at)}</div>
                        </div>
                        <span style={{fontSize:"0.625rem",fontWeight:700,padding:"3px 8px",borderRadius:99,background:`${wc}18`,color:wc,flexShrink:0}}>{w.status}</span>
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
              <div className="tb-section-title">Actions</div>
              <div className="space-y-2">
                {[
                  { label:"← All Contracts",     icon:"📄", path:"/commercial/contracts" },
                  { label:"Renewal Pipeline",     icon:"🔄", path:"/customers/renewals" },
                  { label:"Customer 360",         icon:"🔍", path:"/customers/360" },
                  { label:"Invoice Management",   icon:"💰", path:"/invoices" },
                  { label:"Commercial Overview",  icon:"💼", path:"/commercial" },
                ].map((a,i)=>(
                  <button key={i} onClick={()=>router.push(a.path)} className="w-full text-left flex items-center gap-3"
                    style={{padding:"10px 12px",borderRadius:10,background:"transparent",border:"1px solid transparent",fontSize:"0.8125rem",fontWeight:i===0?600:500,color:"var(--color-text-2)",cursor:"pointer",transition:"all 120ms"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(180,83,9,0.06)";e.currentTarget.style.borderColor="rgba(180,83,9,0.2)";e.currentTarget.style.color="var(--color-brand)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent";e.currentTarget.style.color="var(--color-text-2)";}}>
                    <span>{a.icon}</span>{a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="tb-section">
              <div className="tb-section-title">Financial Summary</div>
              <div className="space-y-3">
                {[
                  { label:"Contract Value",  value:fmtEGP(contract.total_value),              color:"#34D399" },
                  { label:"Total Invoiced",  value:fmtEGP(totalInvoiced),                     color:"rgba(148,163,184,0.8)" },
                  { label:"Collected",       value:fmtEGP(totalPaid),                          color:"#34D399" },
                  { label:"Pending",         value:fmtEGP(pendingInvoices.reduce((s,i)=>s+Number(i.total_amount||0),0)), color:"#FCD34D" },
                  { label:"Invoices",        value:contractInvoices.length,                    color:"rgba(148,163,184,0.8)" },
                ].map(({label,value,color},i)=>(
                  <div key={i} className="flex justify-between" style={{padding:"8px 0",borderBottom:i<4?"1px solid var(--color-divider)":"none"}}>
                    <span style={{fontSize:"0.75rem",color:"var(--color-text-3)"}}>{label}</span>
                    <span style={{fontSize:"0.875rem",fontWeight:700,color}}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Record meta */}
            <div className="tb-section">
              <div className="tb-section-title">Record Info</div>
              {[["ID",contract.id?.slice(0,14)+"..."],["Created",fmtDate(contract.created_at)],["Updated",fmtDate(contract.updated_at)]].map(([l,v],i)=>(
                <div key={i} className="flex justify-between" style={{fontSize:"0.6875rem",padding:"7px 0",borderBottom:i<2?"1px solid var(--color-divider)":"none"}}>
                  <span style={{color:"var(--color-text-3)"}}>{l}</span>
                  <span style={{color:"var(--color-text-2)",fontFamily:"monospace"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
