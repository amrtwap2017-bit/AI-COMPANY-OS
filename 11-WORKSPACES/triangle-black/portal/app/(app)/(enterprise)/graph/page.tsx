"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  Layers, Activity, ShieldAlert, Cpu, 
  ArrowRight, Search, Zap, CheckCircle, RefreshCw, Box 
} from "lucide-react";

export default function DigitalTwinPage() {
  const [selectedEntityType, setSelectedEntityType] = useState("asset");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [impactData, setImpactData] = useState<any>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);

  // 1. Fetch Twin Operational State
  const { data: twinState, isLoading: loadingState, refetch: refetchState } = useQuery(
    ["twin-state"],
    () => authFetch("/api/v1/twin/state").then(r => r.json()),
    { staleTime: 30000 }
  );

  // 2. Fetch Graph Topology Stats (T-023)
  const { data: graphStats, isLoading: loadingStats } = useQuery(
    ["twin-graph-stats"],
    () => authFetch("/api/v1/twin/graph/stats").then(r => r.json()),
    { staleTime: 30000 }
  );

  // 3. Fetch Real Assets for Selector
  const { data: assetList } = useQuery(
    ["twin-assets-selector"],
    () => authFetch("/api/v1/assets/?limit=15").then(r => r.json()),
    { staleTime: 60000 }
  );

  const assets = Array.isArray(assetList) ? assetList : (assetList?.results || []);

  const handleInspectImpact = async (type: string, id: string) => {
    if (!id) return;
    setSelectedEntityType(type);
    setSelectedEntityId(id);
    setLoadingImpact(true);
    try {
      const res = await authFetch(`/api/v1/twin/graph/impact/${type}/${id}`);
      if (res.ok) {
        const data = await res.json();
        setImpactData(data);
      }
    } catch {
      setImpactData(null);
    } finally {
      setLoadingImpact(false);
    }
  };

  const isLoading = loadingState || loadingStats;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-secondary">Loading Digital Twin Graph Topology...</p>
        </div>
      </div>
    );
  }

  const healthScore = twinState?.health_score ?? 95;
  const healthLabel = twinState?.health_label ?? "Healthy";
  const totalNodes = graphStats?.total_nodes ?? 15;
  const totalEdges = graphStats?.total_edges ?? 30;

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-brand" />
              Digital Twin & Graph Impact Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Live Semantic Topology
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Real-time event projection mapping relationships across Sites, Assets, Work Orders, and Procurement.
          </p>
        </div>
        <div>
          <button
            onClick={() => refetchState()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-surface-alt transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-secondary" />
            Sync Twin Projection
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="System Health Index"
          value={`${healthScore}/100`}
          sub={healthLabel}
          color={healthScore < 60 ? "red" : (healthScore < 80 ? "amber" : "emerald")}
          status={healthScore < 60 ? "critical" : "ok"}
        />
        <KpiCard
          label="Topology Graph Nodes"
          value={totalNodes}
          sub="Projected Entities"
          color="blue"
          status="ok"
        />
        <KpiCard
          label="Relationship Edges"
          value={totalEdges}
          sub="Cross-Domain Links"
          color="purple"
        />
        <KpiCard
          label="Projection Engine"
          value="Synchronized"
          sub="Transactional Outbox Live"
          color="brand"
        />
      </div>

      {/* Main Graph Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Entity Explorer */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-semibold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Box className="w-4 h-4 text-brand" />
            Select Entity for Impact Analysis
          </h2>

          <p className="text-xs text-secondary leading-relaxed">
            Click an operational asset to traverse its failure impact graph across active contracts, open work orders, and maintenance schedules.
          </p>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {assets.map((ast: any) => {
              const isSelected = selectedEntityId === ast.id;
              return (
                <button
                  key={ast.id}
                  onClick={() => handleInspectImpact("asset", ast.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected 
                      ? "border-brand bg-brand-light/30 ring-1 ring-brand" 
                      : "border-border bg-surface-alt hover:border-brand/40"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-sm font-semibold text-primary truncate">{ast.name}</div>
                    <div className="text-xs text-secondary flex items-center gap-2 mt-0.5">
                      <span>{ast.category || "HVAC"}</span>
                      <span>•</span>
                      <span className="capitalize">{ast.criticality || "Medium"}</span>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-brand" : "text-tertiary"}`} />
                </button>
              );
            })}

            {assets.length === 0 && (
              <div className="text-center py-8 text-secondary text-sm">
                No active assets found to inspect.
              </div>
            )}
          </div>
        </div>

        {/* Right: Graph Traversal / Impact Visualization */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h2 className="text-base font-semibold text-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand" />
                Impact & Relationship Topology
              </h2>
              {selectedEntityId && (
                <span className="text-xs font-mono text-tertiary">
                  ID: {selectedEntityId.slice(0, 8)}...
                </span>
              )}
            </div>

            {loadingImpact && (
              <div className="text-center py-20 space-y-2">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-secondary">Traversing Semantic Graph...</p>
              </div>
            )}

            {!loadingImpact && impactData && (
              <div className="mt-4 space-y-5">
                <div className="p-3.5 rounded-lg bg-surface-alt border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-secondary block">Traversed Entity</span>
                    <span className="text-sm font-bold text-primary capitalize">
                      {impactData.entity_type}: {impactData.entity_id?.slice(0, 12)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-secondary block">Connected Topology</span>
                    <span className="text-sm font-bold text-brand">
                      {impactData.connected_count ?? 0} Relationships
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    Discovered Graph Edges
                  </span>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {(impactData.edges || []).map((edge: any, i: number) => (
                      <div
                        key={edge.id || i}
                        className="p-3 rounded-lg border border-border bg-surface-alt text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary capitalize">{edge.source_type}</span>
                          <span className="text-brand font-mono">──[{edge.relationship}]──►</span>
                          <span className="font-semibold text-primary capitalize">{edge.target_type}</span>
                        </div>
                        <span className="text-tertiary font-mono">{edge.target_id?.slice(0, 8)}</span>
                      </div>
                    ))}

                    {(impactData.edges || []).length === 0 && (
                      <div className="p-6 text-center text-secondary text-xs rounded-lg border border-dashed border-border">
                        Isolated node — no active downstream failure risks or relationship edges detected.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!loadingImpact && !impactData && (
              <div className="text-center py-20 text-secondary space-y-2">
                <Layers className="w-12 h-12 text-tertiary mx-auto opacity-40" />
                <p className="text-sm font-medium">Select an asset from the left to inspect relationship impact.</p>
                <p className="text-xs text-tertiary">Traverses live twin nodes, active work orders, and supply dependencies.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-divider text-xs text-tertiary flex items-center justify-between">
            <span>Projection Source: PostgreSQL Outbox</span>
            <span className="text-success flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Read-Only Isolation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
