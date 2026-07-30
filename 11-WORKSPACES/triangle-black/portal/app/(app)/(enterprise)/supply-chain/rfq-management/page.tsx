"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {draft:"#6D5F53",sent:"#5B7C8C",responses_received:"#B07A2A",evaluated:"#8D7443",awarded:"#547C4D",cancelled:"#A84A3D"};
export default function RFQManagementPage() {
  const router = useRouter();
  const [showNewRFQ, setShowNewRFQ] = useState(false);
  const [newRFQ, setNewRFQ] = useState({title:"",rfq_type:"open",currency:"EGP",total_budget:0,submission_deadline:"",delivery_location:""});
  const qc = useQueryClient();

  const createRFQ = useMutation(
    (payload) => fetch("http://localhost:8030/api/v1/rfq/", {method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+(localStorage.getItem("tb_token")||"")},body:JSON.stringify(payload)}).then(r=>r.json()),
    {
      onSuccess: (d) => {
        if (d.id||d.rfq_number) { toast.success("RFQ created successfully"); setShowNewRFQ(false); qc.invalidateQueries(["rfq-mgmt"]); }
        else { toast.error(d.detail || "Failed to create RFQ"); }
      },
      onError: () => toast.error("Connection error"),
    }
  );
  const [filter, setFilter] = useState("all");
  const { data: raw, isLoading } = useQuery(
    ["rfq-list"],
    () => authFetch("/api/v1/rfq/").then(r=>r.json()),
    { staleTime: 60000 }
  );
  const rfqs = toArr(raw);
  const filtered = filter==="all" ? rfqs : rfqs.filter(r=>r.status===filter);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1">Procurement</div>
              <h1 className="tb-hero-title">Request for Quotation</h1>
              <p className="tb-hero-description">{rfqs.length} RFQs · Competitive bidding process</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn-secondary">← Back</button>
                <button onClick={()=>setShowNewRFQ(true)} style={{background:"linear-gradient(135deg,#8F6F3D,#B9924C)",border:"none",borderRadius:8,padding:"10px 18px",color:"#181614",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>+ New RFQ</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Total",value:rfqs.length,color:"#221D1A"},
              {label:"Active",value:rfqs.filter(r=>r.status==="sent").length,color:"#5B7C8C"},
              {label:"With Quotes",value:rfqs.filter(r=>r.status==="responses_received").length,color:"#B07A2A"},
              {label:"Awarded",value:rfqs.filter(r=>r.status==="awarded").length,color:"#547C4D"},
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
        <div className="tb-section">
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all","draft","sent","responses_received","evaluated","awarded"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={"tb-pill "+(filter===f?"tb-pill--active":"")}>
                {f==="all"?"All":f.replace(/_/g," ")}
                {f!=="all" && <span className="ml-1 opacity-60">{rfqs.filter(r=>r.status===f).length}</span>}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : filtered.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">📝</div><div className="tb-empty-title">No RFQs found</div><div className="tb-empty-desc">Create an RFQ to request vendor quotations</div></div>
          ) : (
            <div className="space-y-2">
              {filtered.map((r,i)=>{
                const sc = SC[r.status]||"#6D5F53";
                return (
                  <button key={i} onClick={()=>router.push("/supply-chain/rfq-management/"+r.id)} className="w-full flex items-center gap-4 p-4 rounded-xl bg-base-alt hover:bg-surface transition-colors text-left border border-transparent hover:border-border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-bold text-primary truncate">{r.title}</div>
                        <span className="tb-badge flex-shrink-0" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30",fontSize:"0.5rem"}}>{(r.status||"").replace(/_/g," ")}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-tertiary">
                        <span>{r.rfq_number||"—"}</span>
                        <span>{r.rfq_type||"open"}</span>
                        <span>Deadline: {fmtDate(r.submission_deadline)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-brand flex-shrink-0">View →</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showNewRFQ && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:16,padding:32,width:"100%",maxWidth:500,boxShadow:"0 20px 40px rgba(0,0,0,0.15)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:"1.125rem",fontWeight:700,color:"var(--color-text-1)"}}>New Request for Quotation</div>
              <button onClick={()=>setShowNewRFQ(false)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-3)",fontSize:"1.25rem"}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><label style={{display:"block",fontSize:"0.75rem",color:"var(--color-text-3)",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Title *</label>
              <input value={newRFQ.title} onChange={e=>setNewRFQ({...newRFQ,title:e.target.value})} placeholder="e.g. HVAC Spare Parts Q4 2026" style={{width:"100%",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,padding:"10px 12px",fontSize:"0.875rem",color:"var(--color-text-1)",outline:"none"}}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={{display:"block",fontSize:"0.75rem",color:"var(--color-text-3)",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Type</label>
                <select value={newRFQ.rfq_type} onChange={e=>setNewRFQ({...newRFQ,rfq_type:e.target.value})} style={{width:"100%",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,padding:"10px 12px",fontSize:"0.875rem",color:"var(--color-text-1)",outline:"none"}}>
                  {["open","selective","direct"].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{display:"block",fontSize:"0.75rem",color:"var(--color-text-3)",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Budget (EGP)</label>
                <input type="number" value={newRFQ.total_budget} onChange={e=>setNewRFQ({...newRFQ,total_budget:Number(e.target.value)})} style={{width:"100%",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,padding:"10px 12px",fontSize:"0.875rem",color:"var(--color-text-1)",outline:"none"}}/></div>
              </div>
              <div><label style={{display:"block",fontSize:"0.75rem",color:"var(--color-text-3)",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Delivery Location</label>
              <input value={newRFQ.delivery_location} onChange={e=>setNewRFQ({...newRFQ,delivery_location:e.target.value})} placeholder="Site and location" style={{width:"100%",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,padding:"10px 12px",fontSize:"0.875rem",color:"var(--color-text-1)",outline:"none"}}/></div>
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button onClick={()=>{if(!newRFQ.title.trim()){toast.error("Title required");return;}createRFQ.mutate({...newRFQ,hotel_id:"tb-default-hotel-000000000001",status:"draft",prepared_by:"amr@triangleblack.com",evaluation_criteria:"best_value"});}} disabled={createRFQ.isLoading} style={{flex:1,background:"linear-gradient(135deg,#8F6F3D,#B9924C)",border:"none",borderRadius:8,padding:"12px",color:"#181614",fontSize:"0.9375rem",fontWeight:700,cursor:"pointer"}}>{createRFQ.isLoading?"Creating...":"Create RFQ"}</button>
                <button onClick={()=>setShowNewRFQ(false)} style={{background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,padding:"12px 20px",color:"var(--color-text-2)",cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}