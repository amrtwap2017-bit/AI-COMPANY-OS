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
const fmtDate = (d: any) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };
const fmtEGP = (n: any) => n?"EGP "+Number(n).toLocaleString():"—";

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: raw, isLoading } = useQuery({queryKey:["leads-v2"],queryFn:()=>authFetch("/api/v1/leads-portal-v2").then(r => (r as any).data ?? r),staleTime:60000});
  const leads = toArr(raw);
  const active = leads.filter((l: any) =>l.status==="active"||l.status==="won");
  const totalValue = leads.reduce((s: any, l: any) =>s+Number(l.contract_value||l.deal_value||0),0);

  const filtered = useMemo(()=>leads.filter((l: any) =>{
    const ms = !search||(l.company_name||l.name||"").toLowerCase().includes(search.toLowerCase())||(l.contact_person||"").toLowerCase().includes(search.toLowerCase());
    return ms&&(filterStatus==="all"||l.status===filterStatus);
  }),[leads,search,filterStatus]);

  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize,page*pageSize);
  const hasFilters = search||filterStatus!=="all";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Commercial</div>
              <h1 className="tb-hero-title">Customers</h1>
              <p className="tb-hero-description">Hotel clients · Accounts · Relationship management</p>
            </div>
            <button onClick={()=>router.push("/commercial/leads")} className="tb-btn tb-btn-primary">+ New Lead</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{leads.length}</div><div className="tb-hero-kpi-label">Total</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{active.length}</div><div className="tb-hero-kpi-label">Active</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand" style={{fontSize:"14px"}}>{fmtEGP(totalValue)}</div><div className="tb-hero-kpi-label">Pipeline Value</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{leads.filter((l: any) =>l.status==="won").length}</div><div className="tb-hero-kpi-label">Won</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={(e: any) =>{setSearch(e.target.value);setPage(1);}} placeholder="Search customers..." className="tb-input" style={{minWidth:"200px",width:"auto"}} />
          <div className="tb-tabs border-0 mb-0">
            {["all","prospect","active","won","lost"].map((s: any) =>(
              <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} className={`tb-tab ${filterStatus===s?"active":""}`}>
                {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
                {s!=="all"&&<span className="ml-1 opacity-60">{leads.filter((l: any) =>l.status===s).length}</span>}
              </button>
            ))}
          </div>
          {hasFilters&&<button onClick={()=>{setSearch("");setFilterStatus("all");setPage(1);}} className="tb-btn tb-btn-ghost tb-btn-sm">✕</button>}
        </div>

        <div className="tb-section">
          {isLoading ? <TableSkeleton /> : leads.length===0 ? (
            <EmptyState icon="🏨" title="No customers yet" description="Start by adding your first hotel client lead" action={{label:"Add Lead",onClick:()=>router.push("/commercial/leads")}} />
          ) : filtered.length===0 ? (
            <EmptyState icon="🔍" title="No customers found" description="Try adjusting your search or filter" />
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Customer</th><th>Status</th><th>Contact</th><th className="text-right">Value</th><th>Created</th><th></th></tr></thead>
                  <tbody>
                    {paged.map((l: any, i: number) =>(
                      <tr key={l.id||i} onClick={()=>router.push(`/commercial/leads/${l.id}`)} className="cursor-pointer">
                        <td>
                          <div className="font-semibold text-sm text-primary">{l.company_name||l.name||"—"}</div>
                          <div className="text-xs text-tertiary">{l.industry||l.type||"Hotel"}</div>
                        </td>
                        <td><StatusBadge status={l.status||"prospect"} /></td>
                        <td>
                          <div className="text-sm text-secondary">{l.contact_person||l.contact_name||"—"}</div>
                          <div className="text-xs text-tertiary">{l.contact_email||l.email||""}</div>
                        </td>
                        <td className="text-right font-bold text-brand">{fmtEGP(l.contract_value||l.deal_value)}</td>
                        <td className="text-xs text-tertiary">{fmtDate(l.created_at)}</td>
                        <td>
                          <button onClick={(e: any) =>{e.stopPropagation();router.push(`/commercial/leads/${l.id}`);}}
                            className="tb-btn tb-btn-sm" style={{background:"var(--color-brand-light)",color:"var(--color-brand)",border:"1px solid var(--color-brand-border)"}}>View</button>
                        </td>
                      </tr>
                    ))}
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
