// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";

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


// Safe date formatter
const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};

const workOrders: any[] = [];
const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchWorkOrders = async () => {
  const res = await authFetch(`/api/v1/work-orders`);
  return res.json();
};

const fetchAssets = async () => {
  const res = await authFetch(`/api/v1/assets`);
  return res.json();
};

const fetchPurchaseOrders = async () => {
  const res = await authFetch(`/api/v1/purchase-orders/`);
  return res.json();
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

  const completedWorkOrders = toArr(workOrders).filter(
    (wo) => wo.status === "completed"
  );

  const totalWOsClosed = completedWorkOrders.length;
  const avgResolutionTime =
    toArr(completedWorkOrders).reduce((acc: any, wo: any) => {
      if (wo.started_at && wo.completed_at) {
        return acc + (new Date(wo.completed_at).getTime() - new Date(wo.started_at).getTime()) / 3600000;
      }
      return acc;
    }, 0) / totalWOsClosed;

  const poCount = purchaseOrders.length;
  const poTotalValueEGP = toArr(purchaseOrders).reduce((acc: any, po: any) => acc + po.amount, 0);

  const workOrderTypeCounts = toArr(completedWorkOrders).reduce((acc: any, wo: any) => {
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

  const recentPOs = toArr(purchaseOrders).slice(-5);

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
          {toArr(top5LongestWOs).map((wo: any) => (
            <li key={wo.id}>
              {wo.title} - {wo.type} - {(Number(wo.hours) || 0).toFixed(2)} hours
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Recent POs">
        <ul>
          {toArr(recentPOs).map((po: any) => (
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