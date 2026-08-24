"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useRouter } from "next/navigation";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { if (!d) return "—"; try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];

export default function CommercialInvoicesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: raw, isLoading } = useQuery(["comm-inv"],()=>authFetch("/api/v1/supplier-invoices/").then(r => (r as any).data ?? r),{staleTime:30000});
  const { data: dash } = useQuery(["comm-inv-dash"],()=>authFetch("/api/v1/supplier-invoices/dashboard").then(r => (r as any).data ?? r),{staleTime:60000});
  const invoices = toArr(raw);
  const filtered = filter==="all"?invoices:invoices.filter((i: any) =>i.status===filter);
  const totals = dash?.totals||{};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="text-label-upper text-brand mb-1.5">Finance</div>
          <h1 className="tb-hero-title">Invoices</h1>
          <p className="tb-hero-description">{invoices.length} invoices · {fmtEGP(totals.total_value||0)} total</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total Invoiced",value:fmtEGP(totals.total_value||0)},{label:"Outstanding",value:fmtEGP(totals.total_outstanding||0),warn:true},{label:"Paid",value:invoices.filter((i: any) =>i.status==="paid").length,good:true},{label:"Pending",value:invoices.filter((i: any) =>i.status==="submitted"||i.status==="matching").length}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.good?"var(--color-success)":k.warn?"var(--color-warning)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-tabs mb-4">
          {["all","draft","submitted","matching","approved","paid"].map((f: any) =>(
            <button key={f} onClick={()=>setFilter(f)} className={`tb-tab ${filter===f?"active":""}`}>
              {f==="all"?"All":f}{f!=="all"&&` (${invoices.filter((i: any) =>i.status===f).length})`}
            </button>
          ))}
        </div>

        <div className="tb-section">
          {isLoading ? <TableSkeleton rows={3} /> : filtered.length===0 ? (
            <EmptyState icon="🧾" title="No invoices found" description="No invoices match current filter" />
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>Invoice / Vendor</th><th style={{textAlign:"center"}}>Status</th><th style={{textAlign:"center"}}>Currency</th><th style={{textAlign:"right"}}>Amount</th><th style={{textAlign:"center"}}>Date</th></tr></thead>
                <tbody>
                  {filtered.map((inv: any, i: any) =>(
                    <tr key={i} onClick={()=>router.push("/commercial/invoices/"+inv.id)} className="cursor-pointer">
                      <td>
                        <div className="font-semibold text-sm text-primary truncate">{inv.invoice_number||"—"}</div>
                        <div className="text-xs text-tertiary mt-0.5">{inv.vendor_name||inv.vendor_id||"—"}</div>
                      </td>
                      <td className="text-center"><StatusBadge status={inv.status||"draft"} /></td>
                      <td className="text-center text-sm font-semibold text-secondary">{inv.currency||"EGP"}</td>
                      <td className="text-right font-bold text-brand">{fmtEGP(inv.total_amount||0)}</td>
                      <td className="text-center text-xs text-tertiary">{fmtDate(inv.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
