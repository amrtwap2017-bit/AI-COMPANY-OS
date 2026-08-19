"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const STARS = (r: any) => { const s=Math.round(r||0); return "★".repeat(s)+"☆".repeat(5-s); };

export default function VendorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const { data: raw, isLoading } = useQuery({queryKey:["vendors-list"],queryFn:()=>authFetch("/api/v1/vendors/").then(r => r.json())});
  const all = toArr(raw).filter((v: any) =>!v.deleted_at);
  const categories = ["all",...Array.from(new Set(all.map((v: any) =>v.category).filter(Boolean)))];
  const filtered = all.filter((v: any) =>{
    const ms = !search||(v.company_name||"").toLowerCase().includes(search.toLowerCase())||(v.contact_person||"").toLowerCase().includes(search.toLowerCase())||(v.email||"").toLowerCase().includes(search.toLowerCase());
    return ms&&(filterCat==="all"||v.category===filterCat);
  });

  const approved = all.filter((v: any) =>v.is_approved).length;
  const totalOrders = all.reduce((s: any, v: any) =>s+(v.total_orders||0),0);
  const avgRating = all.length?(all.reduce((s: any, v: any) =>s+(v.rating||0),0)/all.length).toFixed(1):"0.0";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Vendor Management</h1>
              <p className="tb-hero-description">Approved suppliers · Performance tracking · Procurement partners</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/vendor-management")} className="tb-btn tb-btn-primary">+ New Vendor</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{all.length}</div><div className="tb-hero-kpi-label">Total Vendors</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{approved}</div><div className="tb-hero-kpi-label">Approved</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{totalOrders}</div><div className="tb-hero-kpi-label">Total Orders</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{avgRating}</div><div className="tb-hero-kpi-label">Avg Rating</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <input value={search} onChange={(e: any) =>setSearch(e.target.value)} placeholder="Search vendors..." className="tb-input" style={{minWidth:"240px",width:"auto"}} />
          <div className="tb-tabs border-0 mb-0">
            {categories.map((cat: any) =>(
              <button key={cat} onClick={()=>setFilterCat(cat)} className={`tb-tab ${filterCat===cat?"active":""}`}>
                {cat==="all"?"All Categories":cat}
              </button>
            ))}
          </div>
        </div>

        <div className="tb-section">
          <div className="flex justify-between items-center mb-4">
            <div className="tb-section-title" style={{margin:0}}>
              Vendors <span className="ml-2 text-sm font-normal text-tertiary">{filtered.length} of {all.length}</span>
            </div>
          </div>
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="🏢" title="No vendors found"
              description={search?"Try adjusting your search or filter":"Add your first vendor to get started"}
              action={{label:"Add Vendor",onClick:()=>router.push("/supply-chain/vendor-management")}} />
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>Vendor</th><th>Category</th><th>Contact</th><th>Rating</th><th>Orders</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map((v: any) =>(
                    <tr key={v.id} onClick={()=>router.push(`/supply-chain/vendor-management/${v.id}`)} className="cursor-pointer">
                      <td>
                        <div className="font-semibold text-sm text-primary">{v.company_name||"—"}</div>
                        <div className="text-xs text-tertiary mt-0.5">{v.vendor_code} · {v.city||"Cairo"}</div>
                      </td>
                      <td className="text-sm text-secondary">{v.category||"General"}</td>
                      <td>
                        <div className="text-sm text-primary">{v.contact_person||"—"}</div>
                        <div className="text-xs text-tertiary">{v.email||""}</div>
                      </td>
                      <td className="text-brand font-medium text-sm">{STARS(v.rating)} <span className="text-tertiary ml-1">{(v.rating||0).toFixed(1)}</span></td>
                      <td className="text-sm text-secondary">{v.total_orders||0}</td>
                      <td><StatusBadge status={v.is_approved?"approved":"pending"} /></td>
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
