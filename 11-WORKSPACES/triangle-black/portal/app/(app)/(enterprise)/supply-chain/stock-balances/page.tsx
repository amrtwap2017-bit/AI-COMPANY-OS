// @ts-nocheck

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PageHeader,
  SectionCard,
  MetricCard,
  DataTable,
  EmptyState,
  LoadingState,
  AlertBanner,
} from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { fmtCurrency } from "@/lib/design-tokens";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Warehouse,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import {
  fetchStockSummary,
  fetchStockBalances,
  type StockSummary,
  type StockBalanceItem,
} from "@/lib/stock-balances-api";

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: StockBalanceItem["status"] }) {
  const map = {
    ok:       { label: "In Stock",    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    low:      { label: "Low Stock",   cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    critical: { label: "Out of Stock",cls: "bg-red-50 text-red-700 border border-red-200" },
  };
  const { label, cls } = map[status] ?? map.ok;
  return (
    <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-medium " + cls}>
      {label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StockBalancesPage() {
  const [summary, setSummary]   = useState<StockSummary | null>(null);
  const [items, setItems]       = useState<StockBalanceItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]     = useState<"all" | "ok" | "low" | "critical">("all");

  async function load(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [sum, bal] = await Promise.all([fetchStockSummary(), fetchStockBalances()]);
      setSummary(sum);
      setItems(bal);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? "Failed to load stock data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? items : items.filter(i => i.status === filter);

  const totalValue   = summary?.portfolio_value ?? 0;
  const outOfStock   = summary?.out_of_stock ?? 0;
  const lowStock     = summary?.low_stock ?? 0;
  const healthyCount = summary?.healthy ?? 0;

  if (loading) return <LoadingState message="Loading stock balances..." />;

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb/>
      <PageHeader
        title="Stock Balances"
        subtitle="Live inventory levels across all warehouses"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <Link
              href="/supply-chain/purchase-orders"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              New Purchase Order
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      {error && (
        <AlertBanner
          type="error"
          title={error}
          onClose={() => setError(null)}
        />
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total SKUs"
          value={String(summary?.total_items ?? 0)}
          icon={<Package className="h-5 w-5 text-amber-600" />}
          
        />
        <MetricCard
          label="Portfolio Value"
          value={fmtCurrency(totalValue)}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          
        />
        <MetricCard
          label="Healthy Items"
          value={String(healthyCount)}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          
          highlight={healthyCount === (summary?.total_items ?? 0) ? "good" : undefined}
        />
        <MetricCard
          label="Needs Attention"
          value={String(outOfStock + lowStock)}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          
          highlight={outOfStock + lowStock > 0 ? "warn" : undefined}
        />
      </div>

      {/* Alert bar for critical items */}
      {outOfStock > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              {outOfStock} item{outOfStock > 1 ? "s" : ""} out of stock
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Create purchase orders to replenish critical items
            </p>
          </div>
          <Link
            href="/supply-chain/purchase-orders?create=1"
            className="ml-auto text-sm font-medium text-red-700 hover:text-red-900 flex items-center gap-1"
          >
            Order Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Filter tabs */}
      <SectionCard
        title="Inventory Items"
        subtitle={filtered.length + " items" + (filter !== "all" ? " (filtered)" : "")}
        actions={
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(["all", "ok", "low", "critical"] as const).map((f) => {
              const labels: Record<string, string> = {
                all: "All",
                ok: "In Stock",
                low: "Low",
                critical: "Out of Stock",
              };
              const counts: Record<string, number> = {
                all:      items.length,
                ok:       items.filter(i => i.status === "ok").length,
                low:      items.filter(i => i.status === "low").length,
                critical: items.filter(i => i.status === "critical").length,
              };
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors " +
                    (filter === f
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900")
                  }
                >
                  {labels[f]}
                  <span className="ml-1.5 text-slate-400">{counts[f]}</span>
                </button>
              );
            })}
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No items found"
            description={
              filter === "all"
                ? "No stock balance records exist. Receive goods to populate inventory."
                : "No items match this filter."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Item</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Warehouse</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">On Hand</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Available</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Cost</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Total Value</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.item_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.sku && <span className="mr-2">SKU: {item.sku}</span>}
                          <span className="capitalize">{item.category}</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Warehouse className="h-3.5 w-3.5 text-slate-400" />
                        {item.warehouse_name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900">
                      {item.qty_on_hand.toLocaleString()}
                      <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {item.qty_available.toLocaleString()}
                      <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {fmtCurrency(item.avg_cost)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {fmtCurrency(item.total_value)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200">
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-sm font-medium text-slate-700 text-right">
                    Portfolio Total
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-bold text-slate-900">
                    {fmtCurrency(filtered.reduce((s, i) => s + i.total_value, 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
