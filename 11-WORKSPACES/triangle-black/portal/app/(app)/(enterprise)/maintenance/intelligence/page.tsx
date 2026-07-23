"use client"; // @ts-nocheck
import { useQuery } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { AlertTriangle, Activity, TrendingDown, CheckCircle } from "lucide-react";

const RISK_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-300",
  high:     "bg-orange-100 text-orange-700 border-orange-300",
  medium:   "bg-amber-100 text-amber-700 border-amber-300",
  low:      "bg-blue-100 text-blue-700 border-blue-300",
  healthy:  "bg-emerald-100 text-emerald-700 border-emerald-300",
};

function HealthBar({ score }: { score: number }) {
  const color = score < 20 ? "bg-red-500" : score < 40 ? "bg-orange-500" :
                score < 60 ? "bg-amber-500" : score < 80 ? "bg-blue-500" : "bg-emerald-500";
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default function PredictiveMaintenancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["pred-maint"],
    queryFn: () => authFetch("/api/v1/predictive-maintenance/health-scores").then(r => r.json()),
    refetchInterval: 120000,
  });

  const { data: riskData = {} } = useQuery({
    queryKey: ["pred-risk"],
    queryFn: () => authFetch("/api/v1/predictive-maintenance/risk-summary").then(r => r.json()),
  });

  if (isLoading) return <PageWrapper><LoadingState title="Calculating asset health..." /></PageWrapper>;

  const assets   = data?.assets ?? [];
  const atRisk   = data?.at_risk ?? 0;
  const critical = data?.critical_risk ?? 0;
  const avgHealth = data?.avg_health_score ?? 0;

  const byCategory = riskData?.by_category ?? {};

  return (
    <PageWrapper>
      <PageHeader
        title="Predictive Maintenance AI"
        subtitle="Asset health scoring + failure prediction"
        badge="Program L"
      />

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Assets",  value: data?.total ?? 0,       icon: Activity,     color: "text-slate-700" },
          { label: "At Risk",       value: atRisk,                  icon: AlertTriangle, color: "text-amber-600" },
          { label: "Critical Risk", value: critical,                icon: TrendingDown, color: "text-red-600" },
          { label: "Avg Health",    value: `${avgHealth}/100`,      icon: CheckCircle,  color: avgHealth >= 60 ? "text-emerald-600" : "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Asset list */}
        <div className="lg:col-span-2">
          <SectionCard title="Asset Health Scores (Worst First)">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assets.map((asset: any) => (
                <div key={asset.asset_id}
                     className={`p-3 rounded-lg border ${RISK_STYLES[asset.risk_level] ?? RISK_STYLES.healthy}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{asset.asset_name}</div>
                      <div className="text-xs opacity-70">{asset.category} · {asset.criticality}</div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <div className="text-lg font-bold">{asset.health_score}</div>
                      <div className="text-xs opacity-70">/ 100</div>
                    </div>
                  </div>
                  <HealthBar score={asset.health_score} />
                  <div className="text-xs opacity-80 mt-2">{asset.recommended_action}</div>
                  <div className="text-xs opacity-60 mt-1">
                    Predicted failure: {asset.predicted_failure_date}
                    ({asset.predicted_failure_days} days)
                  </div>
                </div>
              ))}
              {assets.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No assets found</p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* By category */}
        <SectionCard title="Risk by Category">
          <div className="space-y-3">
            {Object.entries(byCategory).map(([cat, stats]: [string, any]) => (
              <div key={cat} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-800 capitalize">{cat}</span>
                  <span className={`text-xs font-bold ${stats.at_risk > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {stats.at_risk}/{stats.total} at risk
                  </span>
                </div>
                <div className="text-xs text-slate-500">Avg health: {stats.avg_health}/100</div>
                <div className="mt-1 w-full bg-slate-200 rounded h-1.5">
                  <div
                    className={`h-1.5 rounded ${stats.avg_health >= 60 ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${stats.avg_health}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(byCategory).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No category data</p>
            )}
          </div>
        </SectionCard>
      </div>
    </PageWrapper>
  );
}
