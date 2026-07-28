"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const STARS = (r) => { const s=Math.round(r||0); return "★".repeat(s)+"☆".repeat(5-s); };
export default function VendorManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const { data: raw, isLoading } = useQuery(
    ["vendors-list"],
    () => authFetch("/api/v1/vendors/").then(r=>r.json()),
    { staleTime: 60000 }
  );
  const vendors = toArr(raw);
  const cats = [...new Set(vendors.map(v=>v.category).filter(Boolean))];
  const filtered = vendors.filter(v=>
    (filterCat==="all" || v.category===filterCat) &&
    (!search || (v.company_name||"").toLowerCase().includes(search.toLowerCase()) ||
     (v.category||"").toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1E1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1">Procurement</div>
              <h1 className="tb-hero-title">Vendor Management</h1>
              <p className="tb-hero-description">{vendors.length} vendors · {vendors.filter(v=>v.is_approved).length} approved</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Total",value:vendors.length,color:"#F1F5F9"},
              {label:"Approved",value:vendors.filter(v=>v.is_approved).length,color:"#34D399"},
              {label:"Categories",value:cats.length,color:"#60A5FA"},
              {label:"Avg Rating",value:vendors.length>0?(vendors.reduce((s,v)=>s+(v.rating||0),0)/vendors.length).toFixed(1):0,color:"#FBBF24"},
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
          <div className="tb-flex-between gap-3 flex-wrap mb-4">
            <input className="tb-search flex-1" placeholder="Search vendors…" value={search} onChange={e=>setSearch(e.target.value)}/>
            <div className="flex gap-2 flex-wrap">
              <button onClick={()=>setFilterCat("all")} className={"tb-pill "+(filterCat==="all"?"tb-pill--active":"")}>All</button>
              {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} className={"tb-pill "+(filterCat===c?"tb-pill--active":"")}>{c}</button>)}
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : filtered.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">🏭</div><div className="tb-empty-title">No vendors found</div></div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {filtered.map((v,i)=>(
                <button key={i} onClick={()=>router.push("/supply-chain/vendor-management/"+v.id)} className="tb-section text-left hover:border-brand transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-base-alt flex items-center justify-center text-sm font-black text-secondary flex-shrink-0">
                      {(v.company_name||"?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-primary truncate">{v.company_name}</div>
                      <div className="text-xs text-tertiary">{v.category} · {v.city||"—"}</div>
                      <div className="text-xs" style={{color:"#FBBF24"}}>{STARS(v.rating)} {Number(v.rating||0).toFixed(1)}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="tb-badge" style={{background:v.is_approved?"#34D39918":"#94A3B818",color:v.is_approved?"#34D399":"#94A3B8",fontSize:"0.5rem"}}>
                        {v.is_approved?"Approved":"Pending"}
                      </span>
                      <div className="text-xs text-tertiary mt-1">{v.vendor_code}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
                    <span className="text-xs text-secondary">{v.contact_person||"—"}</span>
                    <span className="text-xs text-tertiary">{v.email||"—"}</span>
                    <span className="text-xs text-brand ml-auto">View →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
