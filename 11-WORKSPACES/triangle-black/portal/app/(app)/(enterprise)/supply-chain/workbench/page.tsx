"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Button,
} from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

const CATEGORIES = ["hvac", "electrical", "plumbing", "mechanical"];

const CATEGORY_LABELS: Record<string, string> = {
  hvac: "HVAC",
  electrical: "Electrical",
  plumbing: "Plumbing",
  mechanical: "Mechanical",
};

async function fetchInventory(category: string) {
  try {  
    const res = await fetch(
      `${BACK
  } catch { return []; }
}/api/v1/ai/supply/inventory-check?work_order_type=${category}`,
    { credentials: "include" }
  );
  if (!res.ok) return [];
  return res.json();
}

async function fetchPRs() {
  try {  
    const res = await fetch(`${BACK
  } catch { return []; }
}/api/v1/inventory/purchase-requests/`, {
    credentials: "include",
  });
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

async function createAutoPR(category: string) {
  const res = await fetch(`${BACK}/api/v1/ai/supply/auto-pr`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      work_order_id: "SYSTEM",
      notes: `Auto-PR for ${category.toUpperCase()} out-of-stock items`,
      requester: "Supply Chain Workbench",
    }),
  });
  if (!res.ok) return [];
  return res.json();
}

export default function SupplyChainWorkbenchPage() {
  const [selectedCategory, setSelectedCategory] = useState("hvac");
  const [prMessage, setPrMessage] = useState<string | null>(null);

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ["inventory-check", selectedCategory],
    queryFn: () => fetchInventory(selectedCategory),
    refetchInterval: 120000,
  });

  const { data: prsData, isLoading: prLoading } = useQuery({
    queryKey: ["purchase-requests"],
    queryFn: fetchPRs,
  });

  const autoPRMutation = useMutation({
    mutationFn: () => createAutoPR(selectedCategory),
    onSuccess: (data) => {
      setPrMessage(`✅ PR Created: ${data.pr_number}`);
      setTimeout(() => setPrMessage(null), 5000);
    },
    onError: () => {
      setPrMessage("❌ Failed to create PR — check logs");
      setTimeout(() => setPrMessage(null), 4000);
    },
  });

  const summary = inventory?.summary ?? {};
  const available = inventory?.available ?? [];
  const belowMin = inventory?.below_minimum ?? [];
  const outOfStock = inventory?.out_of_stock ?? [];
  const prs = Array.isArray(prsData)
    ? prsData
    : prsData?.items ?? prsData?.data ?? [];

  const metrics = [
    {
      label: "Out of Stock",
      value: summary.out_of_stock_count ?? outOfStock.length,
      color: "red" as const,
    },
    {
      label: "Below Minimum",
      value: summary.below_minimum_count ?? belowMin.length,
      color: "amber" as const,
    },
    {
      label: "Available",
      value: summary.available_count ?? available.length,
      color: "green" as const,
    },
    {
      label: "Open PRs",
      value: prs.filter((p: any) => p.status === "draft" || p.status === "pending").length,
      color: "blue" as const,
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Supply Chain Workbench"
        subtitle="Live inventory intelligence and procurement automation"
        badge="AI"
      />

      <MetricStrip metrics={Array.isArray(metrics) ? metrics : []} />

      {/* Category Tabs */}
      <SectionCard title="Inventory by Category">
        <div className="flex gap-2 mb-4">
          {CATEGORIES.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {invLoading ? (
          <LoadingState message={`Loading ${CATEGORY_LABELS[selectedCategory]} inventory...`} />
        ) : (
          <div className="space-y-4">
            {/* Out of Stock */}
            {outOfStock.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-600 mb-2">
                  Out of Stock ({outOfStock.length})
                </h4>
                <div className="space-y-1">
                  {outOfStock.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg border border-red-100"
                    >
                      <span className="text-sm font-medium text-slate-800">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          on hand: {item.qty_on_hand} {item.unit}
                        </span>
                        <StatusBadge status="out_of_stock" label="Out of Stock" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Below Minimum */}
            {belowMin.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-amber-600 mb-2">
                  Below Minimum ({belowMin.length})
                </h4>
                <div className="space-y-1">
                  {belowMin.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 bg-amber-50 rounded-lg border border-amber-100"
                    >
                      <span className="text-sm font-medium text-slate-800">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {item.qty_on_hand} / min {item.min_stock} {item.unit}
                        </span>
                        <StatusBadge status="warning" label="Low Stock" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available */}
            {available.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-600 mb-2">
                  Available ({available.length})
                </h4>
                <div className="space-y-1">
                  {available.slice(0, 5).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg border border-green-100"
                    >
                      <span className="text-sm font-medium text-slate-800">{item.name}</span>
                      <span className="text-xs text-slate-500">
                        {item.qty_available} {item.unit} available
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {outOfStock.length === 0 && belowMin.length === 0 && available.length === 0 && (
              <EmptyState
                title="No inventory data"
                description={`No items found for ${CATEGORY_LABELS[selectedCategory]}`}
              />
            )}
          </div>
        )}

        {/* Auto-PR Action */}
        {outOfStock.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-4">
            <Button
              onClick={() => autoPRMutation.mutate()}
              disabled={autoPRMutation.isPending}
              variant="primary"
            >
              {autoPRMutation.isPending
                ? "Creating PR..."
                : `Create Purchase Request for ${CATEGORY_LABELS[selectedCategory]}`}
            </Button>
            {prMessage && (
              <span className="text-sm font-medium text-slate-700">{prMessage}</span>
            )}
          </div>
        )}
      </SectionCard>

      {/* Recent Purchase Requests */}
      <SectionCard title="Recent Purchase Requests">
        {prLoading ? (
          <LoadingState message="Loading purchase requests..." />
        ) : prs.length === 0 ? (
          <EmptyState
            title="No purchase requests"
            description="Create a purchase request from the inventory section above"
          />
        ) : (
          <div className="space-y-2">
            {prs.slice(0, 5).map((pr: any) => (
              <div
                key={pr.id}
                className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {pr.pr_number || `PR-${pr.id?.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {pr.requester} · {pr.department || "Engineering"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={pr.urgency || "normal"} />
                  <StatusBadge status={pr.status || "draft"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
