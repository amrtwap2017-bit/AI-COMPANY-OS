"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, RefreshCw, Users, AlertTriangle } from "lucide-react";

export default function SLAIntelligencePage() {
  const { data: report, refetch } = useQuery(
    ["sla-intelligence-report"],
    () => authFetch("/api/v1/sla-intelligence/report").then(r => r.json()),
    { staleTime: 30000 }
  );

  const sc = report?.compliance_scorecard || {};
  const techs = report?.technician_performance || [];
  const recs = report?.governance_recommendations || [];
  const esc = report?.escalation_intelligence || {};

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-success" />
            SLA Compliance & Governance
          </h1>
          <p className="text-sm text-secondary mt-1">
            SLA scorecard, technician performance, escalation intelligence
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="SLA Compliance" value={`${sc.overall_sla_compliance_pct ?? "—"}%`} sub={`Grade: ${sc.compliance_grade || "—"}`} color="emerald" status="ok" />
        <KpiCard label="Breach Rate" value={`${sc.sla_breach_rate_pct ?? "—"}%`} sub="Target: < 2%" color={sc.sla_breach_rate_pct < 2 ? "blue" : "amber"} />
        <KpiCard label="Open Backlog" value={sc.open_backlog ?? "—"} sub="Work Orders Pending" color="purple" />
        <KpiCard label="Escalations" value={esc.total_escalations ?? "—"} sub={`Rate: ${esc.escalation_rate_pct ?? 0}%`} color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand" />
            Technician Performance
          </h2>
          {techs.map((t: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-alt">
              <div>
                <p className="text-xs font-bold text-primary">{t.technician_name}</p>
                <p className="text-[11px] text-tertiary">SLA: {t.sla_compliance_pct}% · MTTR: {t.avg_resolution_hours}h</p>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                t.rating === "EXCELLENT" ? "bg-success-bg text-success-text" :
                t.rating === "GOOD" ? "bg-brand-light text-brand" :
                "bg-surface text-secondary border border-border"
              }`}>{t.rating}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-bold text-primary border-b border-divider pb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-text" />
            Governance Recommendations
          </h2>
          {recs.map((r: any) => (
            <div key={r.rec_id} className="p-3 rounded-lg border border-border bg-surface-alt space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  r.priority === "HIGH" ? "bg-danger-bg text-danger-text" : "bg-warning-bg text-warning-text"
                }`}>{r.priority}</span>
                <span className="text-[11px] text-tertiary">{r.timeline_days}d</span>
              </div>
              <p className="text-xs font-semibold text-primary">{r.title}</p>
              <p className="text-[11px] text-secondary">{r.expected_improvement}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
