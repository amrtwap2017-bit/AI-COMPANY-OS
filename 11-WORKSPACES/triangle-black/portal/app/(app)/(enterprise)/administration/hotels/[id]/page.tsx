"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Building, Wrench, FileText, Activity, MapPin, Star } from "lucide-react";

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};


export default function HotelDetailPage() {
  const { id } = useParams();

  const { data: hotel, isLoading } = useQuery({
    queryKey: ["hotel", id],
    queryFn: () => authFetch(`/api/v1/hotels/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: assetsData = {} } = useQuery({
    queryKey: ["hotel-assets", id],
    queryFn: () => authFetch(`/api/v1/assets/?hotel_id=${id}&limit=30`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: contractsData = {} } = useQuery({
    queryKey: ["hotel-contracts", id],
    queryFn: () => authFetch(`/api/v1/contracts/?hotel_id=${id}&limit=10`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: wosData = {} } = useQuery({
    queryKey: ["hotel-wos", id],
    queryFn: () => authFetch(`/api/v1/work-orders/?hotel_id=${id}&status=open&limit=10`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: techsData = {} } = useQuery({
    queryKey: ["hotel-techs", id],
    queryFn: () => authFetch(`/api/v1/technicians/?hotel_id=${id}&limit=20`).then(r => r.json()),
    enabled: !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading hotel..." /></PageWrapper>;
  if (!hotel || hotel.detail) return (
    <PageWrapper><p className="p-8 text-tertiary">Hotel not found</p></PageWrapper>
  );

  const assets    = Array.isArray(assetsData)    ? assetsData    : assetsData?.data    ?? assetsData?.items    ?? [];
  const contracts = Array.isArray(contractsData) ? contractsData : contractsData?.data ?? contractsData?.items ?? [];
  const wos       = Array.isArray(wosData)       ? wosData       : wosData?.data       ?? wosData?.items       ?? [];
  const techs     = Array.isArray(techsData)     ? techsData     : techsData?.data     ?? techsData?.items     ?? [];

  const activeContracts = toArr(contracts).filter((c: any) => c.status === "active");
  const totalContractValue = toArr(activeContracts).reduce((s: number, c: any) => s + Number(c.total_value || 0), 0);
  const criticalAssets = toArr(assets).filter((a: any) => a.criticality === "critical").length;

  return (
    <PageWrapper>
      <PageHeader
        title={hotel.name || "Hotel"}
        subtitle={`${hotel.city ?? ""} · ${hotel.stars ? `${hotel.stars}★` : ""}`}
        badge={hotel.is_active !== false ? "Active" : "Inactive"}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {[
          { label: "Total Assets",     value: (assets || []).length,         icon: Wrench,    color: "text-blue-600" },
          { label: "Critical Assets",  value: criticalAssets,        icon: Activity,  color: "text-red-600" },
          { label: "Active Contracts", value: activeContracts.length, icon: FileText,  color: "text-emerald-600" },
          { label: "Open WOs",         value: (wos || []).length,            icon: Building,  color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-secondary mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Hotel info */}
        <div className="space-y-6">
          <SectionCard title="Hotel Information">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">{hotel.name}</div>
                {hotel.stars && (
                  <div className="flex">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["City",        hotel.city],
                ["Address",     hotel.address],
                ["Phone",       hotel.phone],
                ["Email",       hotel.email],
                ["Manager",     hotel.manager ?? hotel.contact_name],
                ["Rooms",       hotel.room_count],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-secondary">{k}</span>
                  <span className="text-slate-800 font-medium text-right max-w-36 truncate">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Contract value */}
          {totalContractValue > 0 && (
            <SectionCard title="Contract Portfolio">
              <div className="text-center py-3">
                <div className="text-2xl font-bold text-emerald-600">
                  {totalContractValue.toLocaleString()}
                </div>
                <div className="text-xs text-secondary mt-1">Annual Contract Value (EGP)</div>
              </div>
              <div className="space-y-2">
                {(activeContracts || []).slice(0, 3).map((c: any) => (
                  <div key={c.id} className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="text-xs font-medium text-slate-700 truncate">{c.title}</div>
                    <div className="text-xs text-tertiary">
                      {Number(c.total_value||0).toLocaleString()} EGP
                      · expires {String(c.end_date||"").slice(0,10)}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Technicians */}
          {techs.length > 0 && (
            <SectionCard title={`Technicians (${techs.length})`}>
              {(techs || []).slice(0, 5).map((t: any) => {
                const util = t.max_work_orders > 0
                  ? Math.round(t.current_work_orders / t.max_work_orders * 100) : 0;
                return (
                  <div key={t.id} className="flex items-center justify-between p-2 mb-1">
                    <span className="text-sm text-slate-700">{t.name}</span>
                    <span className={`text-xs font-semibold
                      ${util >= 90 ? "text-red-600" : util >= 70 ? "text-amber-600" : "text-emerald-600"}`}>
                      {util}%
                    </span>
                  </div>
                );
              })}
            </SectionCard>
          )}
        </div>

        {/* Assets + Open WOs */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title={`Assets (${(assets || []).length})`}>
            {(assets || []).length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {toArr(assets).map((asset: any) => (
                  <div key={asset.id}
                       className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Wrench className="w-4 h-4 text-tertiary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{asset.name}</div>
                      <div className="text-xs text-tertiary">{asset.category}</div>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0
                      ${asset.criticality === "critical" ? "bg-red-100 text-red-600" :
                        asset.criticality === "high" ? "bg-amber-100 text-amber-600" :
                        "bg-slate-100 text-secondary"}`}>
                      {asset.criticality ?? "medium"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-tertiary text-center py-6">No assets registered</p>
            )}
          </SectionCard>

          {(wos || []).length > 0 && (
            <SectionCard title={`Open Work Orders (${(wos || []).length})`}>
              <div className="space-y-2">
                {toArr(wos).map((wo: any) => (
                  <div key={wo.id}
                       className={`flex items-center justify-between p-3 rounded-lg border
                         ${wo.priority === "critical" ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"}`}>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{wo.title}</div>
                      <div className="text-xs text-tertiary">{wo.type}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0
                      ${wo.priority === "critical" ? "bg-red-100 text-red-700" :
                        wo.priority === "high" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-secondary"}`}>
                      {wo.priority}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
