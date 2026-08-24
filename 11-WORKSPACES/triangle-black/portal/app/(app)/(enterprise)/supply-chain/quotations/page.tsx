"use client";
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

export default function QuotationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: rawRFQs, isLoading } = useQuery({queryKey:["quot-rfqs"],queryFn:()=>authFetch("/api/v1/rfq/").then(r => (r as any).data ?? r),staleTime:60000});
  const rfqs = toArr(rawRFQs);
  const withQuotes = rfqs.filter((r: any) =>r.quotation_count>0||["responses_received","evaluated","awarded"].includes(r.status));
  const totalQuotes = rfqs.reduce((s: any, r: any) =>s+(r.quotation_count||0),0);

  const filtered = useMemo(()=>rfqs.filter((r: any) =>{
    const ms = !search||(r.rfq_number||"").toLowerCase().includes(search.toLowerCase())||(r.title||"").toLowerCase().includes(search.toLowerCase());
    return ms&&(filterStatus==="all"||r.status===filterStatus);
  }),[rfqs,search,filterStatus]);

  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize,page*pageSize);
  const hasFilters = search||filterStatus!=="all";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Vendor Quotations</h1>
              <p className="tb-hero-description">RFQ responses · Bid comparison · Vendor scoring</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/rfq-management")} className="tb-btn tb-btn-primary">+ New RFQ</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{rfqs.length}</div><div className="tb-hero-kpi-label">Total RFQs</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand">{totalQuotes}</div><div className="tb-hero-kpi-label">Total Quotes</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{rfqs.filter((r: any) =>r.status==="awarded").length}</div><div className="tb-hero-kpi-label">Awarded</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-info)"}}>{withQuotes.length}</div><div className="tb-hero-kpi-label">With Responses</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={(e: any) =>{setSearch(e.target.value);setPage(1);}} placeholder="Search RFQs..." className="tb-input" style={{minWidth:"200px",width:"auto"}} />
          <div className="tb-tabs border-0 mb-0">
            {["all","draft","sent","responses_received","evaluated","awarded","cancelled"].map((s: any) =>(
              <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} className={`tb-tab ${filterStatus===s?"active":""}`}>
                {s==="all"?"All":s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
                {s!=="all"&&<span className="ml-1 opacity-60">{rfqs.filter((r: any) =>r.status===s).length}</span>}
              </button>
            ))}
          </div>
          {hasFilters&&<button onClick={()=>{setSearch("");setFilterStatus("all");setPage(1);}} className="tb-btn tb-btn-ghost tb-btn-sm">✕</button>}
        </div>

        <div className="tb-section">
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="📨" title="No RFQs found" description={hasFilters?"Try adjusting filters":"No RFQs issued yet"} action={{label:"Create RFQ",onClick:()=>router.push("/supply-chain/rfq-management")}} />
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>RFQ</th><th>Title</th><th>Status</th><th>Quotes</th><th style={{textAlign:"right"}}>Lowest Bid</th><th>Deadline</th><th></th></tr></thead>
                  <tbody>
                    {paged.map((r: any, i: number) =>{
                      const isExpired = r.submission_deadline&&new Date(r.submission_deadline)<new Date();
                      return (
                        <tr key={r.id||i} onClick={()=>router.push(`/supply-chain/rfqs/${r.id}`)} className="cursor-pointer">
                          <td className="font-bold text-sm text-primary">{r.rfq_number||"—"}</td>
                          <td className="text-sm text-secondary">{(r.title||"—").slice(0,40)}</td>
                          <td><StatusBadge status={r.status||"draft"} /></td>
                          <td className="font-bold text-brand">{r.quotation_count||0}</td>
                          <td className="text-right font-bold text-success">{r.lowest_price?fmtEGP(r.lowest_price):"—"}</td>
                          <td className={`text-xs ${isExpired?"font-bold text-danger":"text-tertiary"}`}>{fmtDate(r.submission_deadline)}</td>
                          <td>
                            <button onClick={(e: any) =>{e.stopPropagation();router.push(`/supply-chain/rfqs/${r.id}`);}}
                              className="tb-btn tb-btn-sm" style={{background:"var(--color-brand-light)",color:"var(--color-brand)",border:"1px solid var(--color-brand-border)"}}>Compare</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length>pageSize&&<div className="mt-4 pt-4 border-t border-default"><Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={pageSize} onPageSize={(s)=>{setPageSize(s);setPage(1);}} pageSizes={[10,25,50]} /></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
