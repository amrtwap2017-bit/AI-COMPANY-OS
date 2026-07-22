"use client";

import { useAuthFetch } from "@/lib/hooks/useAuthFetch";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  ActionBar,
  Button,
} from "@/components/ui";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

const SupplyChainWorkbenchPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("hvac");
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  const fetchInventoryCheck = useQuery(
    ["inventory-check", selectedCategory],
    async () => {
      const response = await useAuthFetch(`/api/v1/ai/supply/inventory-check?work_order_type=${selectedCategory}`);
      if (!response.ok) throw new Error("Failed to fetch inventory check");
      return response.json();
    },
    { initialData: { available: [], categories_searched: [] } }
  );

  const createPRMutation = useMutation(
    async (data) => {
      const response = await useAuthFetch("/api/v1/ai/supply/auto-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create PR");
      return response.json();
    },
    {
      onSuccess: (data) => {
        toast.success(`PR created successfully with number ${data.pr_number}`);
      },
    }
  );

  const handleCreatePR = () => {
    createPRMutation.mutate({ work_order_id: "SYSTEM", notes: "" });
  };

  const fetchPurchaseRequests = useQuery(
    ["purchase-requests"],
    async () => {
      const response = await useAuthFetch("/api/v1/inventory/purchase-requests/");
      if (!response.ok) throw new Error("Failed to fetch purchase requests");
      return response.json();
    },
    { initialData: [] }
  );

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const outOfStockCount = fetchInventoryCheck.data.available.filter(item => item.qty_on_hand < item.min_stock).length;
  const belowMinimumCount = fetchInventoryCheck.data.available.filter(item => item.qty_on_hand >= item.min_stock && item.qty_on_hand <= item.min_stock * 2).length;
  const availableCount = fetchInventoryCheck.data.available.length - outOfStockCount - belowMinimumCount;

  return (
    <PageWrapper>
      <PageHeader title="Supply Chain Workbench" />
      <SectionCard>
        <MetricStrip>
          <MetricCard
            label="Available Items"
            value={availableCount}
            color="green"
          />
          <MetricCard
            label="Items Below Minimum"
            value={belowMinimumCount}
            color="amber"
          />
          <MetricCard
            label="Out of Stock Items"
            value={outOfStockCount}
            color="red"
          />
          <MetricCard
            label="Open PRs"
            value={fetchPurchaseRequests.data.length}
            color="blue"
          />
        </MetricStrip>
      </SectionCard>

      <div className="flex flex-wrap gap-4">
        {["hvac", "electrical", "plumbing", "mechanical"].map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-md ${
              selectedCategory === category ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <SectionCard>
        {fetchInventoryCheck.isLoading && (
          <LoadingState message="Fetching inventory data..." />
        )}
        {fetchInventoryCheck.isError && (
          <EmptyState message="Failed to fetch inventory data." />
        )}
        {fetchInventoryCheck.isSuccess && (
          <>
            <h3 className="text-lg font-semibold mb-4">Available Items</h3>
            <ul>
              {fetchInventoryCheck.data.available
                .filter(item => item.qty_on_hand >= item.min_stock * 2)
                .map(item => (
                  <li key={item.id} className="flex items-center justify-between">
                    {item.name}
                    <StatusBadge status="green" />
                  </li>
                ))}
            </ul>

            <h3 className="text-lg font-semibold mb-4">Items Below Minimum</h3>
            <ul>
              {fetchInventoryCheck.data.available
                .filter(item => item.qty_on_hand >= item.min_stock && item.qty_on_hand <= item.min_stock * 2)
                .map(item => (
                  <li key={item.id} className="flex items-center justify-between">
                    {item.name}
                    <StatusBadge status="amber" />
                  </li>
                ))}
            </ul>

            <h3 className="text-lg font-semibold mb-4">Out of Stock Items</h3>
            <ul>
              {fetchInventoryCheck.data.available
                .filter(item => item.qty_on_hand < item.min_stock)
                .map(item => (
                  <li key={item.id} className="flex items-center justify-between">
                    {item.name}
                    <StatusBadge status="red" />
                  </li>
                ))}
            </ul>
          </>
        )}
      </SectionCard>

      {outOfStockCount > 0 && (
        <ActionBar>
          <Button onClick={handleCreatePR}>
            Create Purchase Request for {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </Button>
        </ActionBar>
      )}

      <SectionCard>
        {fetchPurchaseRequests.isLoading && (
          <LoadingState message="Fetching purchase requests..." />
        )}
        {fetchPurchaseRequests.isError && (
          <EmptyState message="Failed to fetch purchase requests." />
        )}
        {fetchPurchaseRequests.isSuccess && (
          <ul>
            {fetchPurchaseRequests.data.slice(0, 5).map(pr => (
              <li key={pr.id} className="flex items-center justify-between">
                PR #{pr.pr_number}
                <StatusBadge status={pr.status} />
                {pr.urgency}
                {new Date(pr.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default SupplyChainWorkbenchPage;