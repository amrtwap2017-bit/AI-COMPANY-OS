// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { MapPin, Wrench, Users, Activity, Building } from "lucide-react";

export default function SiteDetailPage() {
  const { id } = useParams();

  const { data: site, isLoading } = useQuery({
    queryKey: ["site", id],
    queryFn: () => authFetch(`/api/v1/sites/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: assetsData = {} } = useQuery({
    queryKey: ["site-assets", id],
    queryFn: () => authFetch(`/api/v1/assets/?site_id=${id}&limit=30`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: techsData = {} } = useQuery({
    queryKey: ["site-techs", id],
    queryFn: () => authFetch(`/api/v1/technicians/?hotel_id=${site?.hotel_id}&limit=20`).then(r => r.json()),
    enabled: !!id && !!site?.hotel_id,
  });

  const { data: wosData = {} } = useQuery({
    queryKey: ["site-wos", id],
    queryFn: () => authFetch(`/api/v1/work-orders/?site_id=${id}&status=open&limit=10`).then(r => r.json()),
    enabled: !!id,
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading site..." /></PageWrapper>;
  if (!site || site.detail) return <PageWrapper><p className="p-8 text-slate-400">Site not found</p></PageWrapper>;

  const assets = Array.isArray(assetsData) ? assetsData : assetsData?.data ?? assetsData?.items ?? [];
  const techs  = Array.isArray(techsData)  ? techsData  : techsData?.data  ?? techsData?.items  ?? [];
  const wos    = Array.isArray(wosData)    ? wosData    : wosData?.data    ?? wosData?.items    ?? [];

  const criticalAssets = (assets || []).filter((a: any) => a.criticality === "critical").length;
  const activeTechs    = techs.filter((t: any) => t.is_active).length;

  return (
    <PageWrapper>
      <PageHeader
        title={site.name || "Site"}
        subtitle={site.address ?? site.location ?? ""}
        badge={site.status ?? "Active"}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {[
          { label: "Total Assets",     value: (assets || []).length, icon: Wrench,   color: "text-blue-600" },
          { label: "Critical Assets",  value: criticalAssets, icon: Activity, color: "text-red-600" },
          { label: "Active Techs",     value: activeTechs,   icon: Users,    color: "text-emerald-600" },
          { label: "Open WOs",         value: (wos || []).length,    icon: Building, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Site info */}
        <div className="space-y-6">
          <SectionCard title="Site Information">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-blue-400" />
              <div>
                <div className="font-semibold text-slate-800">{site.name}</div>
                <div className="text-sm text-slate-500">{site.address}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Type",     site.site_type ?? site.type],
                ["Hotel",    site.hotel_id],
                ["City",     site.city],
                ["Status",   site.status ?? "Active"],
                ["Manager",  site.manager ?? "—"],
              ].filter(([, v]) => v && v !== "—").map(([k, v]) => (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Open WOs */}
          {(wos || []).length > 0 && (
            <SectionCard title={`Open WOs (${(wos || []).length})`}>
              {(wos || []).slice(0, 5).map((wo: any) => (
                <div key={wo.id} className="p-2 mb-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-xs font-medium text-slate-700 truncate">{wo.title}</div>
                  <div className="text-xs text-slate-400">{wo.type} · {wo.priority}</div>
                </div>
              ))}
            </SectionCard>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Assets */}
          <SectionCard title={`Assets (${(assets || []).length})`}>
            {(assets || []).length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(assets || []).map((asset: any) => (
                  <div key={asset.id}
                       className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Wrench className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{asset.name}</div>
                      <div className="text-xs text-slate-400">{asset.category}</div>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0
                      ${asset.criticality === "critical" ? "bg-red-100 text-red-600" :
                        asset.criticality === "high" ? "bg-amber-100 text-amber-600" :
                        "bg-slate-100 text-slate-500"}`}>
                      {asset.criticality}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No assets at this site</p>
            )}
          </SectionCard>

          {/* Technicians */}
          <SectionCard title={`Technicians (${techs.length})`}>
            {techs.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {techs.map((tech: any) => {
                  const util = tech.max_work_orders > 0
                    ? Math.round(tech.current_work_orders / tech.max_work_orders * 100) : 0;
                  return (
                    <div key={tech.id}
                         className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800">{tech.name}</div>
                        <div className="w-full bg-slate-200 rounded h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded ${util >= 90 ? "bg-red-500" : util >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(util, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">{util}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No technicians at this site</p>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
