"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState, Button, Textarea
} from "@/components/ui";
import Link from "next/link";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";

async function fetchWOs() {
  const r = await fetch(`${BACK}/api/v1/work-orders`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? d.work_orders ?? [];
}
async function fetchTechs() {
  const r = await fetch(`${BACK}/api/v1/technicians`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}
async function fetchAssets() {
  const r = await fetch(`${BACK}/api/v1/assets`, { credentials: "include" });
  if (!r.ok) return [];
  const d = await r.json();
  return Array.isArray(d) ? d : d.items ?? [];
}

export default function WODetailPage() {
  const params  = useParams();
  const id      = String(params?.id || "");
  const [notes, setNotes]   = useState("");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const { data: wos    = [], isLoading: l1 } = useQuery({ queryKey: ["wo-detail-wos"],    queryFn: fetchWOs,    refetchInterval: 60000 });
  const { data: techs  = [], isLoading: l2 } = useQuery({ queryKey: ["wo-detail-techs"],  queryFn: fetchTechs,  refetchInterval: 300000 });
  const { data: assets = [], isLoading: l3 } = useQuery({ queryKey: ["wo-detail-assets"], queryFn: fetchAssets, refetchInterval: 300000 });

  const isLoading = l1 || l2 || l3;
  const wo        = wos.find((w) => w.id === id);
  const tech      = techs.find((t) => t.id === wo?.technician_id);
  const asset     = assets.find((a) => a.id === wo?.asset_id);

  if (isLoading) return <LoadingState message="Loading work order..." />;

  if (!wo) {
    return (
      <PageWrapper>
        <PageHeader title="Work Order Not Found" />
        <EmptyState title="Work order not found" description={`No WO found with id: ${id}`} />
        <div className="px-6 mt-4">
          <Link href="/operations/work-orders" className="text-sm text-blue-600 underline">
            Back to Work Orders
          </Link>
        </div>
      </PageWrapper>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`${BACK}/api/v1/work-orders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  }

  async function updateStatus(status) {
    await fetch(`${BACK}/api/v1/work-orders/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = wo.due_date && wo.due_date.slice(0, 10) < today && wo.status !== "completed";

  return (
    <PageWrapper>
      <PageHeader
        title={wo.title}
        subtitle={`${wo.type} · ${wo.status}`}
        badge={wo.priority}
      />

      <MetricStrip metrics={[
        { label: "Priority",  value: wo.priority || "medium" },
        { label: "Status",    value: wo.status   || "open" },
        { label: "Type",      value: wo.type     || "corrective" },
        { label: "Due Date",  value: wo.due_date ? wo.due_date.slice(0, 10) : "No date",
          color: isOverdue ? "red" as const : "slate" as const },
      ]} />

      <SectionCard title="Work Order Details">
        <div className="space-y-3">
          {wo.description && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Description</p>
              <p className="text-sm text-slate-700">{wo.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Technician</p>
              <p className="text-sm text-slate-700">{tech?.name || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Asset</p>
              <p className="text-sm text-slate-700">{asset?.name || "No asset linked"}</p>
            </div>
            {wo.started_at && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Started</p>
                <p className="text-sm text-slate-700">{wo.started_at.slice(0, 10)}</p>
              </div>
            )}
            {wo.completed_at && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Completed</p>
                <p className="text-sm text-slate-700">{wo.completed_at.slice(0, 10)}</p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Status Update">
        <div className="flex gap-2 flex-wrap">
          {["open", "in_progress", "completed"].map((s) => (
            <Button
              key={s}
              onClick={() => updateStatus(s)}
              variant={wo.status === s ? "primary" : undefined}
            >
              {s.replace("_", " ")}
            </Button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Notes">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes or observations..."
          rows={4}
        />
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} variant="primary">
            {saving ? "Saving..." : "Save Notes"}
          </Button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved</span>}
        </div>
      </SectionCard>

      <div className="px-1">
        <Link href="/operations/work-orders" className="text-sm text-blue-600 underline">
          Back to Work Orders
        </Link>
      </div>
    </PageWrapper>
  );
}
