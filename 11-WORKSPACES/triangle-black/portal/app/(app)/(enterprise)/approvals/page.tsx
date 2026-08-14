"use client";
// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtRelative = (d) => { if (!d) return ""; try { const h=Math.floor((Date.now()-new Date(d).getTime())/3600000); return h<1?"just now":h<24?h+"h ago":Math.floor(h/24)+"d ago"; } catch { return ""; } };
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const DOC_ICONS = {sow:"📋",po:"📦",rfq:"📝",quotation_selection:"⚖️"};

export default function ApprovalsPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: raw, isLoading } = useQuery(["approvals-all"], ()=>authFetch("/api/v1/approval-requests/").then(r=>r.json()), {staleTime:20000});
  const approvals = toArr(raw);
  const pending = approvals.filter(a=>a.status==="pending");
  const done = approvals.filter(a=>a.status!=="pending");

  const approve = useMutation({
    mutationFn: (id)=>authFetch(`/api/v1/approval-requests/${id}/approve`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({approved_by:"amr@triangleblack.com"})}).then(r=>r.json()),
    onSuccess: ()=>{ toast.success("Approval recorded successfully"); qc.invalidateQueries(["approvals-all"]); },
  });

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="text-label-upper text-brand mb-1.5">Approvals</div>
          <h1 className="tb-hero-title">Approval Center</h1>
          <p className="tb-hero-description">{pending.length} pending · {approvals.length} total</p>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Pending",value:pending.length,warn:pending.length>0},
              {label:"Approved",value:approvals.filter(a=>a.status==="approved").length},
              {label:"Rejected",value:approvals.filter(a=>a.status==="rejected").length,danger:true},
              {label:"Total",value:approvals.length},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.danger?"var(--color-danger)":k.warn?"var(--color-warning)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {pending.length>0 && (
          <div className="tb-section border-warning/30" style={{borderColor:"var(--color-warning-border)"}}>
            <div className="font-bold text-warning mb-4">✍ Awaiting Approval ({pending.length})</div>
            <div className="flex flex-col gap-3">
              {pending.map((a,i)=>(
                <div key={i} className="flex items-center gap-4 p-4 bg-surface-alt rounded-lg border border-warning/15">
                  <span className="text-2xl flex-shrink-0">{DOC_ICONS[a.document_type]||"📄"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-primary truncate">{a.title}</div>
                    <div className="text-xs text-tertiary mt-0.5">
                      {a.document_type?.toUpperCase()} {a.document_number} · {fmtRelative(a.requested_at)} · by {a.requested_by}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-extrabold text-brand">{fmtEGP(a.amount)}</div>
                    <div className="text-xs text-tertiary">{a.currency}</div>
                  </div>
                  <button onClick={()=>approve.mutate(a.id)} disabled={approve.isLoading}
                    className="tb-btn tb-btn-primary flex-shrink-0">Approve ✓</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tb-section">
          <div className="font-bold text-primary mb-4">All Approval Requests</div>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1,2,3].map(i=><div key={i} className="tb-shimmer tb-shimmer-block" style={{height:48}} />)}
            </div>
          ) : approvals.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon" style={{opacity:0.4}}>✍</div>
              <div className="tb-empty-title">No approval requests</div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {approvals.map((a,i)=>(
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg">
                  <span className="text-lg">{DOC_ICONS[a.document_type]||"📄"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-primary font-medium truncate">{a.title}</div>
                    <div className="text-xs text-tertiary mt-0.5">{a.document_type} · {fmtRelative(a.requested_at)}</div>
                  </div>
                  <div className="text-sm font-semibold text-primary flex-shrink-0">{fmtEGP(a.amount)}</div>
                  <span className={`tb-badge flex-shrink-0 ${a.status==="approved"?"tb-badge-success":a.status==="rejected"?"tb-badge-danger":a.status==="pending"?"tb-badge-warning":"tb-badge-neutral"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
