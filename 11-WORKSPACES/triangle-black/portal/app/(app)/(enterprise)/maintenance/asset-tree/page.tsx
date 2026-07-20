"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, LoadingState, EmptyState,
  AlertBanner, StatusBadge, Progress, SectionCard,
} from "@/components/ui";
import { maintenanceApi } from "@/lib/maintenance-api";
import { RefreshCw, ChevronDown, ChevronRight, Package, Wrench } from "lucide-react";
import { toast } from "@/lib/toast";

export default function AssetTreePage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["asset-tree"],
    queryFn:  () => maintenanceApi.assetTree()
                     .then((r: any) => r.data || r),
    staleTime: 60_000,
  });

  const tree = data?.tree || [];
  const totalAssets = data?.total_assets || tree.reduce((s: number, g: any) => s + (g.count || 0), 0);

  function toggleCategory(cat: string) {
    setExpanded(e => ({ ...e, [cat]: !e[cat] }));
  }

  function expandAll() {
    const all: Record<string, boolean> = {};
    tree.forEach((g: any) => { all[g.category] = true; });
    setExpanded(all);
  }

  const STATUS_ICON: Record<string, string> = {
    operational:  "bg-emerald-500",
    maintenance:  "bg-amber-500",
    offline:      "bg-red-500",
    default:      "bg-slate-400",
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Asset Tree"
        subtitle={totalAssets + " assets organized by category"}
        badge="TREE"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpanded({})}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Collapse All
            </button>
            <button
              onClick={() => { refetch(); toast.success("Refreshed"); }}
              disabled={isFetching}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
            </button>
          </div>
        }
      />

      {isError && (
        <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load"} />
      )}

      {isLoading ? (
        <LoadingState type="list" rows={6} />
      ) : tree.length === 0 ? (
        <EmptyState
          icon="🌳"
          title="No assets in tree"
          description="Add assets to see them organized here"
        />
      ) : (
        <div className="space-y-3">
          {tree.map((group: any) => {
            const isOpen = expanded[group.category] ?? false;
            const assets = group.assets || [];
            const opCount = assets.filter((a: any) => a.status === "operational").length;
            return (
              <div key={group.category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className={"w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 " +
                    (group.category === "HVAC" ? "bg-blue-100" :
                     group.category === "Electrical" ? "bg-yellow-100" :
                     group.category === "Plumbing" ? "bg-cyan-100" :
                     "bg-slate-100")}>
                    <Wrench className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-sm text-slate-900 capitalize">{group.category}</p>
                    <p className="text-xs text-slate-400">{group.count} assets · {opCount} operational</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20">
                      <Progress value={opCount} max={group.count || 1} size="sm" color="emerald" />
                    </div>
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-slate-400" />
                      : <ChevronRight className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100">
                    {assets.map((asset: any, i: number) => (
                      <div
                        key={asset.id}
                        className={"flex items-center gap-3 px-4 py-3 " +
                          (i < assets.length - 1 ? "border-b border-slate-50" : "")}
                      >
                        <div className="w-5 flex items-center justify-center flex-shrink-0">
                          <div className={"w-2 h-2 rounded-full " +
                            (STATUS_ICON[asset.status] || STATUS_ICON.default)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900">{asset.name}</p>
                          <p className="text-xs text-slate-400">
                            {asset.serial_number || "—"} · {asset.location_description || "—"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={asset.criticality || "medium"} />
                          <StatusBadge status={asset.status || "operational"} dot />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
