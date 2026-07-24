"use client"; // @ts-nocheck
// @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";
import { useState, useEffect } from "react";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchWorkOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
  return response.json();
};

const fetchAssets = async () => {
  const response = await fetch(`${BACK}/api/v1/assets`, { credentials: "include" });
  return response.json();
};

const fetchPurchaseOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/purchase-orders/`, {
    credentials: "include",
  });
  return response.json();
};

export default function MaintenanceCostsReviewPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      const [woData, assetData, poData] = await Promise.all([
        fetchWorkOrders(),
        fetchAssets(),
        fetchPurchaseOrders(),
      ]);
      setWorkOrders(woData);
      setAssets(assetData);
      setPurchaseOrders(poData);
    };

    fetchAllData();
  }, []);

  const completedWorkOrders = (workOrders || []).filter(
    (wo) => wo.status === "completed"
  );

  const totalWOsClosed = completedWorkOrders.length;
  const avgResolutionTime =
    completedWorkOrders.reduce((acc: any, wo: any) => {
      if (wo.started_at && wo.completed_at) {
        return acc + (new Date(wo.completed_at).getTime() - new Date(wo.started_at).getTime()) / 3600000;
      }
      return acc;
    }, 0) / totalWOsClosed;

  const poCount = purchaseOrders.length;
  const poTotalValueEGP = purchaseOrders.reduce((acc: any, po: any) => acc + po.amount, 0);

  const workOrderTypeCounts = completedWorkOrders.reduce((acc: any, wo: any) => {
    if (!acc[wo.type]) {
      acc[wo.type] = 1;
    } else {
      acc[wo.type]++;
    }
    return acc;
  }, {});

  const resolutionTimes = completedWorkOrders
    .filter((wo: any) => wo.started_at && wo.completed_at)
    .map((wo: any) => (new Date(wo.completed_at).getTime() - new Date(wo.started_at).getTime()) / 3600000);

  const top5LongestWOs = completedWorkOrders
    .filter((wo: any) => wo.started_at && wo.completed_at)
    .sort((a: any, b: any) =>
      (new Date(b.completed_at).getTime() - new Date(b.started_at).getTime()) -
      (new Date(a.completed_at).getTime() - new Date(a.started_at).getTime())
    )
    .slice(0, 5);

  const recentPOs = purchaseOrders.slice(-5);

  return (
    <PageWrapper>
      <PageHeader title="Maintenance Cost Analysis" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStrip
          label="Total WOs Closed"
          value={totalWOsClosed}
          icon="check-circle"
        />
        <MetricStrip
          label="Avg Resolution Time (hours)"
          value={(Number(avgResolutionTime) || 0).toFixed(2)}
          icon="clock"
        />
        <MetricStrip
          label="PO Count"
          value={poCount}
          icon="shopping-cart"
        />
        <MetricStrip
          label="PO Total Value EGP"
          value={(Number(poTotalValueEGP) || 0).toFixed(2)}
          icon="dollar-sign"
        />
      </div>
      <SectionCard title="Cost by WO Type">
        {/* Bar chart for work order type counts */}
      </SectionCard>
      <SectionCard title="Resolution Time Analysis">
        <p>AVG: {(Number(avgResolutionTime) || 0).toFixed(2)} hours</p>
        <p>MAX: {Math.max(...resolutionTimes).toFixed(2)} hours</p>
        <p>MIN: {Math.min(...resolutionTimes).toFixed(2)} hours</p>
        <ul>
          {top5LongestWOs.map((wo: any) => (
            <li key={wo.id}>
              {wo.title} - {wo.type} - {(Number(wo.hours) || 0).toFixed(2)} hours
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Recent POs">
        <ul>
          {recentPOs.map((po: any) => (
            <li key={po.id}>
              {po.po_number} - {(Number(po.amount) || 0).toFixed(2)} EGP -{" "}
              <StatusBadge status={po.status} />
            </li>
          ))}
        </ul>
      </SectionCard>
    </PageWrapper>
  );
}