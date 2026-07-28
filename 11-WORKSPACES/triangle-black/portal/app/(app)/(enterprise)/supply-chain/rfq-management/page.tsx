"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {draft:"#94A3B8",sent:"#60A5FA",responses_received:"#FBBF24",evaluated:"#A78BFA",awarded:"#34D399",cancelled:"#F87171"};
export default function RFQManagementPage() {
  const router = useRouter();
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
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1">Procurement</div>
              <h1 className="tb-hero-title">Request for Quotation</h1>
              <p className="tb-hero-description">{rfqs.length} RFQs · Competitive bidding process</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Total",value:rfqs.length,color:"#F1F5F9"},
              {label:"Active",value:rfqs.filter(r=>r.status==="sent").length,color:"#60A5FA"},
              {label:"With Quotes",value:rfqs.filter(r=>r.status==="responses_received").length,color:"#FBBF24"},
              {label:"Awarded",value:rfqs.filter(r=>r.status==="awarded").length,color:"#34D399"},
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
                const sc = SC[r.status]||"#94A3B8";
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
    </div>
  );
}
