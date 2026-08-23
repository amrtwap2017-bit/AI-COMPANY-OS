"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import {
  Layers, Activity, ShieldAlert, Cpu,
  ArrowRight, Search, Zap, CheckCircle2, RefreshCw, Box, AlertTriangle
} from "lucide-react";

export default function DigitalTwinPage() {
  const [selectedAssetId, setSelectedAssetId] = useState("ast-chiller-01");
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // 1. Fetch Twin Topology Stats
  const { data: graphStats, refetch: refetchStats } = useQuery(
    ["twin-graph-stats"],
    () => authFetch("/api/v1/twin/graph/stats").then(r => r.json()),
    { staleTime: 30000 }
  );

  // 2. Fetch Multi-Hop Semantic Graph Traversal
  const { data: traversalData, isLoading: loadingTraversal, refetch: refetchTraversal } = useQuery(
    ["semantic-graph-traversal", selectedAssetId],
    () => authFetch(`/api/v1/twin/semantic-graph/traverse/asset/${selectedAssetId}`).then(r => r.json()),
    { staleTime: 30000 }
  );

  // 3. Failure Simulation Mutation
  const simulateMutation = useMutation(
    (assetId: string) =>
      authFetch("/api/v1/twin/semantic-graph/simulate-failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id: assetId })
      }).then(r => r.json()),
    {
      onSuccess: (data) => setSimulationResult(data)
    }
  );

  const nodes = traversalData?.nodes || [];
  const edges = traversalData?.edges || [];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-brand" />
              Digital Twin 2.0 Semantic Graph & Impact Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Multi-Hop Topology Live
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Real-time projection traversing dependencies across physical assets, work orders, suppliers, and guest impact zones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => { refetchStats(); refetchTraversal(); }}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Sync Twin
          </Button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Semantic Graph Nodes" value={traversalData?.total_nodes ?? 8} sub="Multi-Domain Topology" color="emerald" status="ok" />
        <KpiCard label="Relationship Edges" value={traversalData?.total_edges ?? 6} sub="Cross-System Links" color="blue" status="ok" />
        <KpiCard label="Blast Radius Simulator" value="Active" sub="SLA Financial Modeling" color="purple" />
        <KpiCard label="Transactional Outbox" value="Synchronized" sub="PostgreSQL Outbox Stream" color="brand" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Multi-Hop Relationship Graph */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <Box className="w-4 h-4 text-brand" />
              Multi-Hop Dependency Traversal ({selectedAssetId})
            </h2>
            <Button
              size="xs"
              variant="danger"
              loading={simulateMutation.isLoading}
              onClick={() => simulateMutation.mutate(selectedAssetId)}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Simulate Breakdown
            </Button>
          </div>

          {loadingTraversal ? (
            <div className="py-12 text-center text-secondary text-sm">Traversing semantic graph...</div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {edges.map((edge: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-border bg-surface-alt text-xs flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{edge.source}</span>
                    <span className="text-brand">──[{edge.relationship}]──►</span>
                    <span className="font-bold text-primary">{edge.target}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Blast Radius Simulation Panel */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-surface p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
              <ShieldAlert className="w-4 h-4 text-danger" />
              Downstream Failure Blast Radius
            </h2>

            {simulationResult ? (
              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-lg border border-danger-border bg-danger-bg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-danger-text uppercase">Financial Penalty Risk</span>
                    <span className="font-extrabold text-danger-text text-sm">
                      ${Number(simulationResult.blast_radius?.estimated_unplanned_cost_usd ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    SLA Breach Probability: <strong className="text-primary">{simulationResult.blast_radius?.sla_breach_probability_pct}%</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Downstream Guest Zones Impacted:
                  </span>
                  <div className="space-y-1.5">
                    {(simulationResult.blast_radius?.affected_zones || []).map((z: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-md border border-border bg-surface-alt text-xs flex items-center justify-between">
                        <span className="font-semibold text-primary">{z.zone}</span>
                        <StatusBadge status={z.severity} variant={z.severity === "HIGH" ? "danger" : "warning"} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-secondary space-y-2">
                <Cpu className="w-10 h-10 text-tertiary mx-auto opacity-50" />
                <p className="text-sm font-medium">No failure simulation active.</p>
                <p className="text-xs text-tertiary">Click "Simulate Breakdown" on the left to evaluate guest & financial blast radius.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-divider text-xs text-tertiary flex items-center justify-between">
            <span>Projection Engine: Live Outbox</span>
            <span className="text-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Multi-Tenant Bound
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
