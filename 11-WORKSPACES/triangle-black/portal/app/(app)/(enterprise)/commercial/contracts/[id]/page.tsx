"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ContractDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { data: contract, isLoading } = useQuery(
    ["contract-detail",id],
    ()=>authFetch(`/api/v1/contracts/${id}`).then(r => (r as any).data ?? r),
    { enabled:!!id }
  );

  const activate = useMutation({
    mutationFn: ()=>authFetch(`/api/v1/contracts/${id}/activate`,{method:"POST"}).then(r => (r as any).data ?? r),
    onSuccess: ()=>window.location.reload(),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-tertiary text-sm">Loading contract...</div>
    </div>
  );

  if (!contract||contract.error||contract.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📄</div>
        <div className="tb-empty-title">Contract not found</div>
        <button onClick={()=>router.push("/commercial/contracts")} className="tb-btn tb-btn-primary mt-4">← Back to Contracts</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">

      {/* Hero — dark variant for contracts */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={()=>router.push("/commercial/contracts")} className="tb-btn tb-btn-ghost tb-btn-sm">← Contracts</button>
                <span className="text-tertiary">›</span>
                <span className="text-xs text-tertiary truncate max-w-[200px]">{contract.title}</span>
              </div>
              <div className="text-label-upper text-brand mb-1.5">Contract</div>
              <h1 className="tb-hero-title">{contract.title}</h1>
              <div className="flex items-center gap-2.5 mt-2">
                <StatusBadge status={contract.status||"draft"} />
                {contract.renewal_count > 0 && (
                  <span className="text-sm text-tertiary">Renewal #{contract.renewal_count}</span>
                )}
              </div>
            </div>
            <div className="tb-action-bar">
              {contract.status==="pending_signature" && (
                <button onClick={()=>activate.mutate()} disabled={activate.isLoading} className="tb-btn tb-btn-primary">
                  {activate.isLoading?"Activating...":"✓ Activate Contract"}
                </button>
              )}
            </div>
          </div>

          <div className="tb-grid-4 mt-6">
            {[
              {label:"Contract Value",value:fmtEGP(contract.total_value)},
              {label:"Monthly Value", value:fmtEGP(contract.monthly_value)},
              {label:"Duration",      value:`${contract.duration_months||"—"} months`},
              {label:"Period",        value:`${fmtDate(contract.start_date)} — ${fmtDate(contract.end_date)}`},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{fontSize:i===0?"1.1rem":"0.85rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid gap-6" style={{gridTemplateColumns:"2fr 1fr"}}>

          <div className="flex flex-col gap-4">
            {contract.description && (
              <div className="tb-section">
                <div className="tb-section-title">Description</div>
                <p className="text-sm text-secondary leading-relaxed m-0">{contract.description}</p>
              </div>
            )}
            {contract.services && (
              <div className="tb-section">
                <div className="tb-section-title">Services Included</div>
                <div className="text-sm text-secondary leading-relaxed">
                  {typeof contract.services==="string"?contract.services:Array.isArray(contract.services)?contract.services.join(", "):JSON.stringify(contract.services)}
                </div>
              </div>
            )}
            {contract.notes && (
              <div className="tb-section">
                <div className="tb-section-title">Notes</div>
                <p className="text-sm text-secondary leading-relaxed m-0">{contract.notes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">Contract Details</div>
              {[
                ["Contract ID",   contract.id?.slice(0,16)+"..."],
                ["Status",        contract.status||"—"],
                ["Total Value",   fmtEGP(contract.total_value)],
                ["Monthly Value", fmtEGP(contract.monthly_value)],
                ["Duration",      `${contract.duration_months||"—"} months`],
                ["Start Date",    fmtDate(contract.start_date)],
                ["End Date",      fmtDate(contract.end_date)],
                ["Renewals",      contract.renewal_count||0],
              ].map(([label,value],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{label}</span>
                  <span className="tb-detail-value">
                    {label==="Status"?<StatusBadge status={value||"draft"}/>:value}
                  </span>
                </div>
              ))}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Actions</div>
              <div className="flex flex-col gap-2">
                {contract.status==="active" && (
                  <button onClick={()=>authFetch(`/api/v1/contracts/${id}/renew`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})}).then(()=>window.location.reload())}
                    className="tb-btn tb-btn-secondary w-full justify-center">
                    🔄 Renew Contract
                  </button>
                )}
                <button onClick={()=>router.push("/commercial/contracts")} className="tb-btn tb-btn-ghost w-full justify-center">
                  ← All Contracts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
