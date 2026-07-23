"use client"; // @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";;
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { AlertTriangle, ShoppingCart, Zap, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function ReorderPage() {
  const qc = useQueryClient();
  const [result, setResult] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reorder-alerts"],
    queryFn: () =>
      authFetch("/api/v1/inventory-items/reorder-alerts")
        .then(r => r.json())
        .catch(() =>
          authFetch("/api/v1/inventory/reorder-alerts")
            .then(r => r.json())
        ),
    retry: 1,
  });

  const autoReorder = useMutation({
    mutationFn: () => authFetch("/api/v1/inventory-items/auto-reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requested_by: "portal_user" }),
    }).then(r => r.json()),
    onSuccess: (data) => {
      setResult(data);
      qc.invalidateQueries({ queryKey: ["reorder-alerts"] });
    },
  });

  const alerts = data?.alerts ?? [];

  if (isLoading) return <PageWrapper><LoadingState title="Loading reorder alerts..." /></PageWrapper>;

  return (
    <PageWrapper>
      <PageHeader
        title="Reorder Automation"
        subtitle="Items below minimum stock — auto-generate purchase requests"
        badge="Program F"
      />

      {/* Result banner */}
      {result && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="font-semibold text-emerald-800">
            ✅ {result.prs_created} Purchase Requests Auto-Created
          </div>
          <div className="text-sm text-emerald-600 mt-1">{result.message}</div>
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-amber-600">{alerts.length}</div>
          <div className="text-xs text-slate-500">Items Below Min Stock</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <ShoppingCart className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">
            {alerts.filter((a: any) => a.current_stock === 0).length}
          </div>
          <div className="text-xs text-slate-500">Completely Out of Stock</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-4">
          <button
            onClick={() => autoReorder.mutate()}
            disabled={autoReorder.isPending || alerts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm
                       font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {autoReorder.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Auto-Create PRs ({alerts.length})
          </button>
          <div className="text-xs text-slate-400 mt-2">Creates purchase requests for all</div>
        </div>
      </div>

      <SectionCard title={`Low Stock Alerts (${alerts.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="text-left py-2 font-medium">Item</th>
                <th className="text-left py-2 font-medium">Category</th>
                <th className="text-right py-2 font-medium">Current</th>
                <th className="text-right py-2 font-medium">Min</th>
                <th className="text-right py-2 font-medium">Shortage</th>
                <th className="text-left py-2 font-medium">Vendors</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert: any) => (
                <tr key={alert.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2">
                    <div className="font-medium text-slate-800">{alert.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{alert.item_code}</div>
                  </td>
                  <td className="py-2 text-slate-600">{alert.category}</td>
                  <td className={`py-2 text-right font-semibold
                    ${alert.current_stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {alert.current_stock} {alert.unit_of_measure}
                  </td>
                  <td className="py-2 text-right text-slate-500">{alert.min_stock}</td>
                  <td className="py-2 text-right text-red-600 font-semibold">
                    -{Math.abs(Number(alert.shortage || 0))}
                  </td>
                  <td className="py-2">
                    {(alert.suggested_vendors || []).slice(0, 2).map((v: any) => (
                      <span key={v.id} className="text-xs bg-slate-100 text-slate-600
                                                   px-2 py-0.5 rounded mr-1">{v.name}</span>
                    ))}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    ✅ All items are above minimum stock levels
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
