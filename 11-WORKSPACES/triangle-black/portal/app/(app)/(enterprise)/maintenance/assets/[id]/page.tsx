// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageWrapper, PageHeader, SectionCard, LoadingState, StatusBadge } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Activity, Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";

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


function HealthBar({ score }: { score: number }) {
  const color = score < 20 ? "bg-red-500" : score < 40 ? "bg-orange-500" :
                score < 60 ? "bg-amber-500" : score < 80 ? "bg-blue-500" : "bg-emerald-500";
  const label = score < 20 ? "Critical" : score < 40 ? "High Risk" :
                score < 60 ? "At Risk" : score < 80 ? "Good" : "Healthy";
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-slate-600">Health Score</span>
        <span className="text-sm font-semibold">{score}/100 — {label}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3">
        <div className={`${color} h-3 rounded-full transition-all`} style={{width:`${score}%`}} />
      </div>
    </div>
  );
}

export default function AssetDetailPage() {
  const { id } = useParams();

  const { data: asset, isLoading: al } = useQuery({
    queryKey: ["asset", id],
    queryFn: () => authFetch(`/api/v1/assets/${id}`).then(r => r.json()),
    enabled: !!id,
  });
  const assets: any[] = toArr(asset);
const maintenance: any[] = toArr(asset);
const items: any[] = toArr(asset);

  const { data: relationships = [] } = useQuery({
    queryKey: ["asset-graph", id],
    queryFn: () => authFetch(`/api/v1/knowledge-graph/entity/asset/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: healthData = [] } = useQuery({
    queryKey: ["asset-health", id],
    queryFn: () => authFetch(`/api/v1/predictive-maintenance/health-scores`)
      .then(r => r.json())
      .then(d => (d.assets ?? []).find((a: any) => a.asset_id === id)),
    enabled: !!id,
  });

  const { data: warranties = [] } = useQuery({
    queryKey: ["asset-warranty", id],
    queryFn: () => authFetch(`/api/v1/warranty/asset/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  if (al) return <PageWrapper><LoadingState title="Loading asset..." /></PageWrapper>;
  if (!asset) return <PageWrapper><p className="p-8 text-slate-400">Asset not found</p></PageWrapper>;

  const wos  = relationships?.relationships?.work_orders ?? [];
  const pms  = relationships?.relationships?.maintenance_plans ?? [];
  const warr = warranties?.warranties ?? [];
  const health = healthData ?? {};

  const STATUS_COLOR: Record<string, string> = {
    active: "text-emerald-600", inactive: "text-slate-400",
    maintenance: "text-amber-600", retired: "text-red-600",
  };

  return (
    <PageWrapper>
      <PageHeader
        title={asset.name || "Asset Detail"}
        subtitle={`${asset.category} · ${asset.criticality} criticality`}
        badge={<span className={STATUS_COLOR[asset.status] ?? "text-slate-600"}>{asset.status}</span>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Health + Info */}
        <div className="space-y-6">
          {health.health_score !== undefined && (
            <SectionCard title="AI Health Score">
              <HealthBar score={health.health_score} />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Risk Level</span>
                  <span className="font-medium capitalize">{health.risk_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Predicted Failure</span>
                  <span className="font-medium">{health.predicted_failure_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Days Since PM</span>
                  <span className="font-medium">{health.days_since_maintenance}d</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Corrective WOs (90d)</span>
                  <span className="font-medium">{health.corrective_wos_90d}</span>
                </div>
              </div>
              {health.recommended_action && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">{health.recommended_action}</p>
                </div>
              )}
            </SectionCard>
          )}

          <SectionCard title="Asset Information">
            <div className="space-y-2 text-sm">
              {[
                ["Category",     asset.category],
                ["Criticality",  asset.criticality],
                ["Manufacturer", asset.manufacturer],
                ["Model",        asset.model],
                ["Serial No",    asset.serial_number],
                ["Location",     asset.location_description],
                ["Status",       asset.status],
              ].map(([k, v]) => v && (
                <div key={k as string} className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-800 font-medium text-right max-w-32 truncate">{v}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {warr.length > 0 && (
            <SectionCard title="Warranties">
              {warr.map((w: any) => (
                <div key={w.id} className="p-3 bg-slate-50 rounded-lg mb-2">
                  <div className="text-xs font-medium text-slate-700">{w.warranty_type}</div>
                  <div className="text-xs text-slate-500">Expires: {String(w.end_date).slice(0,10)}</div>
                  <div className="text-xs text-slate-500">{w.provider}</div>
                </div>
              ))}
            </SectionCard>
          )}
        </div>

        {/* Right: WO History + PM Plans */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title={`Work Order History (${(wos || []).length})`}>
            {(wos || []).length > 0 ? (
              <div className="space-y-2">
                {toArr(wos).map((wo: any) => (
                  <div key={wo.id} className="flex items-center justify-between p-3
                                               bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{wo.title}</div>
                        <div className="text-xs text-slate-400">{wo.type} · {wo.priority}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium
                      ${wo.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        wo.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"}`}>
                      {wo.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No work order history</p>
            )}
          </SectionCard>

          <SectionCard title={`Maintenance Plans (${pms.length})`}>
            {pms.length > 0 ? (
              <div className="space-y-2">
                {toArr(pms).map((pm: any) => (
                  <div key={pm.id} className="flex items-center justify-between p-3
                                               bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{pm.title}</div>
                        <div className="text-xs text-slate-400">{pm.plan_type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Next due</div>
                      <div className="text-xs font-medium">{String(pm.next_due_date).slice(0,10)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No maintenance plans</p>
            )}
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
