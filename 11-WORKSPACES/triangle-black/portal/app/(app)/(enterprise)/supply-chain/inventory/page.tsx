"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PageHeader, PageWrapper, DataTable, LoadingState,
  EmptyState, AlertBanner, Progress, Pagination,
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ActionBar } from "@/components/ui/ActionBar";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { tokenManager } from "@/lib/auth/token-manager";
import { toast } from "@/lib/toast";
import { RefreshCw, Package, AlertTriangle, Plus, Minus } from "lucide-react";

async function adjustStock(itemId: string, qty: number, reason: string) {
  const token = tokenManager.getToken();
  const res = await fetch("/api/v1/actions/inventory/adjust", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: JSON.stringify({ item_id: itemId, quantity: qty, reason }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "Adjustment failed");
  }
  return res.json();
}

export default function SCInventoryPage() {
  const qc = useQueryClient();
  const [pageSize, setPageSize]       = useState(25);
  const [adjustItem, setAdjustItem]   = useState<any>(null);
  const [adjQty, setAdjQty]           = useState("");
  const [adjReason, setAdjReason]     = useState("");
  const [adjLoading, setAdjLoading]   = useState(false);

  const { data: items = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["sc-inventory"],
    queryFn: async () => {
      const r = await fetch("/api/v1/inventory/items/", { cache: "no-store" });
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d) ? d : d?.items || [];
    },
    staleTime: 30_000,
  });

  const lowStock = useMemo(
    () => items.filter((i: any) => (i.quantity || 0) < (i.min_stock || 5)).length,
    [items]
  );

  const { query, setQuery, filtered } = useSearch(
    items, ["name", "item_code", "category", "sku"]
  );
  const { page, totalPages, items: pageItems, goToPage } = usePagination(filtered, pageSize);

  async function handleAdjust() {
    if (!adjustItem) return;
    const qty = parseInt(adjQty);
    if (isNaN(qty) || qty === 0) { toast.error("Enter a valid quantity"); return; }
    if (!adjReason.trim()) { toast.error("Reason is required"); return; }
    setAdjLoading(true);
    try {
      await adjustStock(adjustItem.id, qty, adjReason);
      qc.invalidateQueries({ queryKey: ["sc-inventory"] });
      toast.success("Stock adjusted: " + adjustItem.name);
      setAdjustItem(null);
      setAdjQty("");
      setAdjReason("");
    } catch (e: any) {
      toast.error(e.message || "Adjustment failed");
    } finally {
      setAdjLoading(false);
    }
  }

  const columns = [
    { key: "name", label: "Item", sortable: true,
      render: (row: any) => (
        <div>
          <p className="font-semibold text-sm text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-400">{row.item_code || row.sku || "—"}</p>
        </div>
      )},
    { key: "category", label: "Category",
      render: (row: any) => (
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
          {row.category || "—"}
        </span>
      )},
    { key: "stock", label: "Stock Level",
      render: (row: any) => {
        const qty = row.quantity || 0;
        const min = row.min_stock || 5;
        const max = row.max_stock || 100;
        const pct = max > 0 ? Math.round((qty / max) * 100) : 0;
        const low = qty < min;
        return (
          <div className="w-32">
            <div className="flex justify-between text-xs mb-1">
              <span className={low ? "text-red-600 font-bold" : "text-slate-700 font-semibold"}>{qty}</span>
              <span className="text-slate-400">/{max}</span>
            </div>
            <Progress value={qty} max={max || 1} size="sm"
              color={low ? "red" : pct < 50 ? "amber" : "emerald"} />
            {low && (
              <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Below min ({min})
              </p>
            )}
          </div>
        );
      }},
    { key: "unit_of_measure", label: "Unit",
      render: (row: any) => (
        <span className="text-xs text-slate-500">{row.unit_of_measure || "pc"}</span>
      )},
    { key: "action", label: "",
      render: (row: any) => (
        <Button
          size="xs"
          variant="ghost"
          onClick={() => { setAdjustItem(row); setAdjQty(""); setAdjReason(""); }}
        >
          Adjust
        </Button>
      )},
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Inventory"
        subtitle={items.length + " items · " + lowStock + " low stock"}
        badge="INV"
        actions={
          <button
            onClick={() => { refetch(); toast.success("Refreshed"); }}
            disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
          >
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        }
      />

      {lowStock > 0 && (
        <AlertBanner
          type="warning"
          title={lowStock + " item(s) below minimum stock level"}
          description="Review and create purchase requests to replenish"
        />
      )}

      {isError && (
        <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed"} />
      )}

      <ActionBar
        search={{ value: query, onChange: setQuery, placeholder: "Search inventory..." }}
        resultCount={filtered.length}
        totalCount={items.length}
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <LoadingState type="table" rows={8} />
        ) : pageItems.length === 0 ? (
          <EmptyState icon="📦" title="No inventory items" description="Add items to track stock levels" />
        ) : (
          <DataTable columns={columns} data={pageItems} />
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPage={goToPage}
        total={filtered.length}
        pageSize={pageSize}
        onPageSize={s => { setPageSize(s); goToPage(1); }}
      />

      <Modal
        open={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        title={"Adjust Stock: " + (adjustItem?.name || "")}
        description="Enter the quantity change (positive to add, negative to remove)"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" onClick={() => setAdjustItem(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdjust} loading={adjLoading}>
              Apply Adjustment
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {adjustItem && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm font-semibold text-slate-900">{adjustItem.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Current: {adjustItem.quantity || 0} {adjustItem.unit_of_measure || "units"}
              </p>
            </div>
          )}
          <Input
            type="number"
            label="Quantity Change"
            placeholder="+10 to add, -5 to remove"
            value={adjQty}
            onChange={e => setAdjQty(e.target.value)}
            helper="Positive number adds stock, negative removes stock"
          />
          <Input
            label="Reason"
            required
            placeholder="e.g. Received delivery, Used in maintenance"
            value={adjReason}
            onChange={e => setAdjReason(e.target.value)}
          />
        </div>
      </Modal>
    </PageWrapper>
  );
}
