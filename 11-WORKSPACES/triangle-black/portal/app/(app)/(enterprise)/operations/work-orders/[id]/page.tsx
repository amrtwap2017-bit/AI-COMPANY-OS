"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";

import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
  Button,
  Textarea,
} from "@/components/ui";
import { fetchWorkOrders, fetchTechnicians, fetchAssets, updateWorkOrder } from "@/api/work-orders";

const WorkOrderDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { data: wos, isLoading, isError } = useQuery(["workOrders"], fetchWorkOrders);
  const { data: technicians, isTechniciansLoading, isTechniciansError } = useQuery(
    ["technicians"],
    fetchTechnicians
  );
  const { data: assets, isAssetsLoading, isAssetsError } = useQuery(["assets"], fetchAssets);

  if (isLoading || isTechniciansLoading || isAssetsLoading) return <LoadingState />;
  if (isError || isTechniciansError || isAssetsError) return <EmptyState />;

  const workOrder = wos.find(w => w.id === id);
  if (!workOrder) return <EmptyState title="Work Order Not Found" description={<Link href="/operations/work-orders">Back to Work Orders</Link>} />;

  const [notes, setNotes] = useState(workOrder.notes || "");

  const handleSaveNotes = async () => {
    await updateWorkOrder(id, { notes });
    setNotes(notes);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    await updateWorkOrder(id, { status: newStatus });
  };

  return (
    <PageWrapper>
      <PageHeader title={workOrder.title} />
      <SectionCard>
        <MetricStrip
          items={[
            { label: "Priority", value: workOrder.priority },
            { label: "Status", value: workOrder.status, badge: StatusBadge(workOrder.status) },
            { label: "Type", value: workOrder.type },
            { label: "Due Date", value: new Date(workOrder.due_date).toLocaleDateString() },
          ]}
        />
      </SectionCard>
      <SectionCard title="Details">
        <div className="flex flex-col gap-4">
          <p>{workOrder.description}</p>
          <p>Technician: {technicians.find(t => t.id === workOrder.technician_id)?.name || "Unknown"}</p>
          <p>Asset: {assets.find(a => a.id === workOrder.asset_id)?.name || "Unknown"}</p>
          <p>Dates: Created {new Date(workOrder.created_at).toLocaleDateString()} - Due {new Date(workOrder.due_date).toLocaleDateString()}</p>
        </div>
      </SectionCard>
      <SectionCard title="Notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button onClick={handleSaveNotes}>Save Notes</Button>
      </SectionCard>
      <SectionCard title="Status Update">
        <Button onClick={() => handleStatusUpdate("in_progress")}>In Progress</Button>
        <Button onClick={() => handleStatusUpdate("completed")}>Completed</Button>
      </SectionCard>
      <Link href="/operations/work-orders" className="mt-4 block text-center text-sm underline">Back to Work Orders</Link>
    </PageWrapper>
  );
};

export default WorkOrderDetailPage;