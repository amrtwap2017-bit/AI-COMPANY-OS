"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];

export default function SitesPage() {
  const router = useRouter();
  const [search,       setSearch]       = useState("");
  const [filterActive, setFilterActive] = useState("all");

  const { data: raw, isLoading } = useQuery({
    queryKey:["sites-list"],
    queryFn:()=>authFetch("/api/v1/sites-portal").then(r => (r as any).data ?? r),
  });

  const all      = toArr(raw);
  const filtered = all.filter((s: any) =>{
    const matchSearch = !search||(s.name||"").toLowerCase().includes(search.toLowerCase())||(s.city||"").toLowerCase().includes(search.toLowerCase())||(s.contact_person||"").toLowerCase().includes(search.toLowerCase());
    const matchActive = filterActive==="all"||(filterActive==="active"&&s.is_active)||(filterActive==="inactive"&&!s.is_active);
    return matchSearch&&matchActive;
  });

  const active   = all.filter((s: any) =>s.is_active).length;
  const inactive = all.filter((s: any) =>!s.is_active).length;
  const cities   = Array.from(new Set(all.map((s: any) =>s.city).filter(Boolean)));

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div>
            <div className="text-label-upper text-brand mb-1.5">Operations</div>
            <h1 className="tb-hero-title">Hotel Sites</h1>
            <p className="tb-hero-description">Managed properties · Field operations · Asset locations</p>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{all.length}</div><div className="tb-hero-kpi-label">Total Sites</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-success">{active}</div><div className="tb-hero-kpi-label">Active</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-tertiary">{inactive}</div><div className="tb-hero-kpi-label">Inactive</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{cities.length}</div><div className="tb-hero-kpi-label">Cities</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-2.5 flex-wrap items-center mb-5">
          <input value={search} onChange={(e: any) =>setSearch(e.target.value)} placeholder="Search sites..."
            className="tb-input" style={{minWidth:"240px"}}/>
          <div className="tb-tabs border-0 mb-0">
            {["all","active","inactive"].map((f: any) =>(
              <button key={f} onClick={()=>setFilterActive(f)} className={`tb-tab ${filterActive===f?"active":""}`}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="tb-grid-3">{[1,2,3,4,5,6].map((i: any) =><div key={i} className="tb-section tb-shimmer-block" style={{height:160}}/>)}</div>
        ) : filtered.length===0 ? (
          <EmptyState icon="🏨" title="No sites found" description={search?"Try adjusting your search":"No hotel sites configured yet"}/>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
            {filtered.map((s: any) =>(
              <div key={s.id} className="tb-section tb-hover-lift cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-base font-bold text-primary">{s.name}</div>
                    <div className="text-xs text-tertiary mt-1">
                      📍 {s.city||"Cairo"}{s.address?` · ${s.address.slice(0,40)}`:""}
                    </div>
                  </div>
                  <StatusBadge status={s.is_active?"active":"inactive"}/>
                </div>
                {s.contact_person&&(
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-xs font-bold flex-shrink-0" style={{color:"#181614"}}>
                      {(s.contact_person||"?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary">{s.contact_person}</div>
                      {s.contact_phone&&<div className="text-xs text-tertiary">{s.contact_phone}</div>}
                    </div>
                  </div>
                )}
                {s.notes&&(
                  <div className="mt-3 p-2.5 bg-surface-alt rounded-lg text-xs text-secondary">
                    {s.notes.slice(0,100)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
