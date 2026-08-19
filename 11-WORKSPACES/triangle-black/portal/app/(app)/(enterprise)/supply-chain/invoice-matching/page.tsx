"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };

export default function InvoiceMatchingPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: dash, isLoading: loadingDash } = useQuery({ queryKey:["inv-dash"], queryFn:()=>authFetch("/api/v1/supplier-invoices/dashboard").then(r=>r.json()), staleTime:60000 });
  const { data: rawInv, isLoading: loadingInv } = useQuery({ queryKey:["inv-list-matching"], queryFn:()=>authFetch("/api/v1/supplier-invoices/").then(r=>r.json()), staleTime:60000 });

  const invoices = toArr(rawInv);
  const totals = dash?.totals||{};
  const byStatus = dash?.by_status||{};
  const overdue = toArr(dash?.overdue);
  const isLoading = loadingDash||loadingInv;

  const filtered = useMemo(()=>invoices.filter(inv=>{
    const q = search.toLowerCase();
    return (!search||(inv.invoice_number||"").toLowerCase().includes(q)||(inv.vendor_name||inv.supplier_name||"").toLowerCase().includes(q))
      && (filterStatus==="all"||inv.status===filterStatus);
  }),[invoices,search,filterStatus]);

  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize,page*pageSize);
  const hasFilters = search||filterStatus!=="all";
  const clearFilters = ()=>{ setSearch(""); setFilterStatus("all"); setPage(1); };

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Invoice Matching</h1>
              <p className="tb-hero-description">3-way match: PO · GRN · Invoice · Payment tracking</p>
            </div>
            <button onClick={()=>router.push("/supply-chain")} className="tb-btn tb-btn-secondary">← Supply Chain</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{totals.total_invoices||invoices.length}</div><div className="tb-hero-kpi-label">Total Invoices</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand" style={{fontSize:"15px"}}>{fmtEGP(totals.total_amount||0)}</div><div className="tb-hero-kpi-label">Total Value</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)",fontSize:"15px"}}>{fmtEGP(totals.paid_amount||0)}</div><div className="tb-hero-kpi-label">Paid</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:overdue.length>0?"var(--color-danger)":"var(--color-text-inv)"}}>{overdue.length}</div><div className="tb-hero-kpi-label">Overdue</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {overdue.length>0 && (
          <div className="tb-alert tb-alert-critical">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <span className="font-bold">{overdue.length} overdue invoice{overdue.length!==1?"s":""}</span>
              <span className="text-sm ml-2 opacity-70">— payment required</span>
            </div>
            <button onClick={()=>{setFilterStatus("overdue");setPage(1);}} className="tb-btn tb-btn-danger tb-btn-sm">View Overdue</button>
          </div>
        )}

        {!isLoading && Object.keys(byStatus).length>0 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12}}>
            {Object.entries(byStatus).map(([status,data])=>(
              <button key={status} onClick={()=>{setFilterStatus(filterStatus===status?"all":status);setPage(1);}}
                className="tb-section text-left cursor-pointer tb-hover-lift"
                style={{border:filterStatus===status?"2px solid var(--color-brand)":"1px solid var(--color-border)",background:filterStatus===status?"var(--color-brand-muted)":"var(--color-surface)"}}>
                <div className="text-xl font-extrabold text-primary">{data.count||0}</div>
                <div className="text-xs text-tertiary mt-0.5">{status.replace(/_/g," ")}</div>
                <div className="text-xs font-semibold text-brand mt-1">{fmtEGP(data.amount||0)}</div>
              </button>
            ))}
          </div>
        )}

        <div className="tb-section">
          <div className="flex gap-2.5 mb-4 flex-wrap items-center">
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search invoices..." className="tb-input" style={{minWidth:"200px",width:"auto"}} />
            <div className="tb-tabs border-0 mb-0">
              {["all","submitted","matching","approved","paid","disputed"].map((s: any) =>(
                <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} className={`tb-tab ${filterStatus===s?"active":""}`}>
                  {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
                  {s!=="all"&&<span className="ml-1 opacity-60">{invoices.filter((i: any) =>i.status===s).length}</span>}
                </button>
              ))}
            </div>
            {hasFilters && <button onClick={clearFilters} className="tb-btn tb-btn-ghost tb-btn-sm">✕ Clear</button>}
            <span className="ml-auto text-xs text-tertiary">{filtered.length} invoices</span>
          </div>

          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="🧾" title="No invoices found" description={hasFilters?"Try adjusting filters":"No supplier invoices yet"} />
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead>
                    <tr>
                      <th>Invoice</th><th>Vendor</th><th style={{textAlign:"right"}}>Amount</th>
                      <th style={{textAlign:"right"}}>PO Link</th><th style={{textAlign:"right"}}>Status</th>
                      <th style={{textAlign:"right"}}>Date</th><th style={{textAlign:"right"}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((inv,i)=>(
                      <tr key={inv.id||i} onClick={()=>router.push(`/supply-chain/invoices/${inv.id}`)} className="cursor-pointer">
                        <td>
                          <div className="font-semibold text-sm text-primary">{inv.invoice_number||"—"}</div>
                          <div className="text-xs text-tertiary">{inv.id?.slice(0,8)}</div>
                        </td>
                        <td className="text-sm text-secondary">{inv.vendor_name||inv.supplier_name||"—"}</td>
                        <td className="text-right font-bold text-brand">{fmtEGP(inv.total_amount||inv.amount||0)}</td>
                        <td className={`text-right text-xs ${inv.po_id?"text-success":"text-tertiary"}`}>{inv.po_id?"✓ Linked":"— None"}</td>
                        <td className="text-right"><StatusBadge status={inv.status||"submitted"} /></td>
                        <td className="text-right text-xs text-tertiary">{fmtDate(inv.created_at)}</td>
                        <td className="text-right">
                          <button onClick={e=>{e.stopPropagation();router.push(`/supply-chain/invoices/${inv.id}`);}}
                            className="tb-btn tb-btn-sm" style={{background:"var(--color-brand-light)",color:"var(--color-brand)",border:"1px solid var(--color-brand-border)"}}>Review</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length>pageSize && (
                <div className="mt-4 pt-4 border-t border-default">
                  <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={pageSize} onPageSize={(s)=>{setPageSize(s);setPage(1);}} pageSizes={[10,25,50]} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
