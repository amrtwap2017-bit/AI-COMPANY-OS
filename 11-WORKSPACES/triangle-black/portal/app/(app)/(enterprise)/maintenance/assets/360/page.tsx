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
const fmtDate = (d: any) => { try { return d?new Date(d).toLocaleDateString("en-GB"):"—"; } catch { return "—"; } };

export default function Assets360Page() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterCrit, setFilterCrit] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: raw, isLoading } = useQuery({ queryKey:["assets-360"], queryFn:()=>authFetch("/api/v1/assets-portal").then(r=>r.json()), staleTime:60000 });
  const assets = toArr(raw).filter((a: any) =>!a.deleted_at);
  const cats = useMemo(()=>["all",...Array.from(new Set(assets.map((a: any) =>a.category).filter(Boolean)))],[assets]);
  const crits = useMemo(()=>["all",...Array.from(new Set(assets.map((a: any) =>a.criticality).filter(Boolean)))],[assets]);

  const now = new Date();
  const overdueAssets = assets.filter((a: any) =>a.next_maintenance_date&&new Date(a.next_maintenance_date)<now);
  const criticalCount = assets.filter((a: any) =>a.criticality==="critical").length;

  const filtered = useMemo(()=>assets.filter((a: any) =>{
    const ms = !search||(a.name||"").toLowerCase().includes(search.toLowerCase())||(a.location_description||"").toLowerCase().includes(search.toLowerCase());
    return ms&&(filterCat==="all"||a.category===filterCat)&&(filterCrit==="all"||a.criticality===filterCrit)&&(filterStatus==="all"||a.status===filterStatus);
  }),[assets,search,filterCat,filterCrit,filterStatus]);

  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize,page*pageSize);
  const hasFilters = search||filterCat!=="all"||filterCrit!=="all"||filterStatus!=="all";
  const clearFilters = ()=>{setSearch("");setFilterCat("all");setFilterCrit("all");setFilterStatus("all");setPage(1);};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">Asset Portfolio 360°</h1>
              <p className="tb-hero-description">Full asset registry · Maintenance status · Criticality overview</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/operations/assets/qr")} className="tb-btn tb-btn-primary">QR Codes</button>
              <button onClick={()=>router.push("/maintenance")} className="tb-btn tb-btn-secondary">← Maintenance</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{assets.length}</div><div className="tb-hero-kpi-label">Total Assets</div></div>
              <div className="tb-hero-kpi" onClick={()=>{setFilterCrit("critical");setPage(1);}} style={{cursor:"pointer"}}>
                <div className="tb-hero-kpi-value" style={{color:"var(--color-danger)"}}>{criticalCount}</div><div className="tb-hero-kpi-label">Critical</div>
              </div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-warning)"}}>{overdueAssets.length}</div><div className="tb-hero-kpi-label">Overdue PM</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{cats.length-1}</div><div className="tb-hero-kpi-label">Categories</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {overdueAssets.length>0 && (
          <div className="tb-alert tb-alert-warning">
            <span>⚠️</span>
            <span className="font-bold">{overdueAssets.length} assets overdue for preventive maintenance</span>
          </div>
        )}

        <div className="tb-section" style={{padding:"12px 16px"}}>
          <div className="flex gap-2.5 flex-wrap items-center">
            <input value={search} onChange={(e: any) =>{setSearch(e.target.value);setPage(1);}} placeholder="Search assets..." className="tb-input" style={{minWidth:"200px",width:"auto"}} />
            <select value={filterCat} onChange={(e: any) =>{setFilterCat(e.target.value);setPage(1);}} className="tb-select" style={{width:"auto"}}>
              {cats.map((c: any) =><option key={c} value={c}>{c==="all"?"All Categories":c}</option>)}
            </select>
            <select value={filterCrit} onChange={(e: any) =>{setFilterCrit(e.target.value);setPage(1);}} className="tb-select" style={{width:"auto"}}>
              {crits.map((c: any) =><option key={c} value={c}>{c==="all"?"All Criticality":c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
            <div className="tb-tabs border-0 mb-0">
              {["all","operational","maintenance","offline"].map((s: any) =>(
                <button key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} className={`tb-tab ${filterStatus===s?"active":""}`}>
                  {s==="all"?"All Status":s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
            {hasFilters&&<button onClick={clearFilters} className="tb-btn tb-btn-ghost tb-btn-sm">✕ Clear</button>}
            <span className="ml-auto text-xs text-tertiary">{filtered.length} of {assets.length}</span>
          </div>
        </div>

        <div className="tb-section">
          <div className="tb-section-title">Asset Registry</div>
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="⚙️" title="No assets found" description={hasFilters?"Try adjusting filters":"No assets registered"} />
          ) : (
            <>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead><tr><th>Asset</th><th>Category</th><th>Criticality</th><th>Status</th><th>Last PM</th><th>Next PM</th><th></th></tr></thead>
                  <tbody>
                    {paged.map((a: any, i: number) =>{
                      const isOverdue = a.next_maintenance_date&&new Date(a.next_maintenance_date)<now;
                      return (
                        <tr key={a.id||i} style={{borderLeft:isOverdue?"3px solid var(--color-warning-border)":a.criticality==="critical"?"3px solid var(--color-danger-border)":"3px solid transparent"}}>
                          <td>
                            <div className="font-semibold text-sm text-primary">{a.name}</div>
                            <div className="text-xs text-tertiary mt-0.5">{a.location_description?.slice(0,40)||"—"}</div>
                          </td>
                          <td className="text-sm text-secondary">{a.category||"—"}</td>
                          <td>
                            <span className={`tb-badge ${a.criticality==="critical"?"tb-badge-danger":a.criticality==="high"?"tb-badge-warning":"tb-badge-neutral"}`}>
                              {a.criticality||"—"}
                            </span>
                          </td>
                          <td><StatusBadge status={a.status||"operational"} /></td>
                          <td className="text-xs text-tertiary">{fmtDate(a.last_maintenance_date)}</td>
                          <td className={`text-xs ${isOverdue?"font-bold text-warning":"text-tertiary"}`}>
                            {fmtDate(a.next_maintenance_date)}{isOverdue?" ⚠":""}
                          </td>
                          <td>
                            <button onClick={()=>router.push(`/asset/${a.id}`)} className="tb-btn tb-btn-sm" style={{background:"var(--color-brand-light)",color:"var(--color-brand)",border:"1px solid var(--color-brand-border)"}}>View</button>
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
