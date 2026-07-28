"use client";
// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const DOC_ICONS = {sow:"📋",rfq:"📝",po:"📦",quotation_selection:"⚖️"};
const SC = {pending:"#FBBF24",approved:"#34D399",rejected:"#F87171",cancelled:"#94A3B8"};
export default function ApprovalsCenterPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: raw, isLoading } = useQuery(
    ["approvals-list"],
    () => authFetch("/api/v1/approval-requests/").then(r=>r.json()),
    { staleTime: 30000, refetchInterval: 30000 }
  );
  const approvals = toArr(raw);
  const pending = approvals.filter(a=>a.status==="pending");
  const approveMut = useMutation(
    (id) => authFetch(`/api/v1/approval-requests/${id}/approve`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({approved_by:"amr@triangleblack.com"})
    }).then(r=>r.json()),
    { onSuccess: () => qc.invalidateQueries(["approvals-list"]) }
  );
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0A1530 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1">Procurement</div>
              <h1 className="tb-hero-title">Approvals Center</h1>
              <p className="tb-hero-description">{pending.length} pending · SOW, RFQ, PO approvals</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Total",value:approvals.length,color:"#F1F5F9"},
              {label:"Pending",value:pending.length,color:pending.length>0?"#FBBF24":"#34D399"},
              {label:"Approved",value:approvals.filter(a=>a.status==="approved").length,color:"#34D399"},
              {label:"Rejected",value:approvals.filter(a=>a.status==="rejected").length,color:"#F87171"},
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
        {pending.length > 0 && (
          <div className="tb-section mb-4" style={{borderColor:"#FBBF2440",background:"#FBBF2408"}}>
            <div className="tb-section-title" style={{color:"#FBBF24"}}>⚠ Awaiting Your Approval ({pending.length})</div>
            <div className="space-y-2 mt-3">
              {pending.map((a,i)=>(
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-base-alt border border-yellow-400/20">
                  <span style={{fontSize:"1.5rem"}}>{DOC_ICONS[a.document_type]||"📄"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-primary">{a.title}</div>
                    <div className="text-xs text-tertiary">{(a.document_type||"").toUpperCase()} · {a.document_number||"—"} · {fmtDate(a.requested_at)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black text-emerald-400">{fmtEGP(a.amount||0)}</div>
                    <div className="text-xs text-tertiary">{a.currency||"EGP"}</div>
                  </div>
                  <button
                    onClick={()=>approveMut.mutate(a.id)}
                    disabled={approveMut.isLoading}
                    className="tb-btn-primary flex-shrink-0" style={{fontSize:"0.75rem",padding:"6px 12px",background:"#16A34A"}}>
                    ✓ Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="tb-section">
          <div className="tb-section-title">All Approval Requests</div>
          {isLoading ? (
            <div className="space-y-2 mt-2">{[1,2,3].map(i=><div key={i} className="h-12 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : approvals.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">✍️</div><div className="tb-empty-title">No approval requests</div></div>
          ) : (
            <div className="space-y-1 mt-3">
              {approvals.map((a,i)=>{
                const sc = SC[a.status]||"#94A3B8";
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-alt">
                    <span>{DOC_ICONS[a.document_type]||"📄"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-primary truncate">{a.title}</div>
                      <div className="text-xs text-tertiary">{a.document_type} · {fmtDate(a.requested_at)}</div>
                    </div>
                    <div className="text-sm font-bold text-secondary">{fmtEGP(a.amount||0)}</div>
                    <span className="tb-badge" style={{background:sc+"18",color:sc,border:"1px solid "+sc+"30",fontSize:"0.5rem"}}>{a.status}</span>
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
