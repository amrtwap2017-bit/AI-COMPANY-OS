"use client"; // @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

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

export default function WO360Page() {
  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("all");
  const [expanded, setExpanded] = useState(null);

  const { data: wos    = [], isLoading: w1 } = useQuery({ queryKey: ["wo360-wos"],    queryFn: fetchWOs,    refetchInterval: 60000 });
  const { data: techs  = [], isLoading: w2 } = useQuery({ queryKey: ["wo360-techs"],  queryFn: fetchTechs,  refetchInterval: 300000 });
  const { data: assets = [], isLoading: w3 } = useQuery({ queryKey: ["wo360-assets"], queryFn: fetchAssets, refetchInterval: 300000 });

  const isLoading = w1 || w2 || w3;
  const today = new Date().toISOString().slice(0, 10);

  const filtered = wos
    .filter((w) => statusF === "all" || w.status === statusF)
    .filter((w) => !search || w.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const open    = wos.filter((w) => w.status === "open").length;
  const inProg  = wos.filter((w) => w.status === "in_progress").length;
  const done    = wos.filter((w) => w.status === "completed").length;

  const techName  = (id) => techs.find((t) => t.id === id)?.name || null;
  const assetName = (id) => assets.find((a) => a.id === id)?.name || null;

  const STATUS_TABS = ["all", "open", "in_progress", "completed", "cancelled"];

  if (isLoading) return <LoadingState message="Loading work orders..." />;

  return (
    <PageWrapper>
      <PageHeader title="Work Orders 360" subtitle="Search and filter all work orders" badge={`${wos.length} Total`} />

      <MetricStrip metrics={[
        { label: "Total",       value: wos.length },
        { label: "Open",        value: open,   color: open > 0 ? "amber" as const : "slate" as const },
        { label: "In Progress", value: inProg, color: "blue" as const },
        { label: "Completed",   value: done,   color: "green" as const },
      ]} />

      <SectionCard title="Search & Filter">
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search work orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <div className="flex gap-1 flex-wrap">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusF(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusF === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No work orders found" description="Try a different search or filter" />
        ) : (
          <div className="space-y-2">
            {filtered.map((w) => {
              const isOverdue = w.due_date && w.due_date.slice(0,10) < today && w.status !== "completed";
              const isExpanded = expanded === w.id;
              const tech  = techName(w.technician_id);
              const asset = assetName(w.asset_id);
              return (
                <div
                  key={w.id}
                  className="border border-slate-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : w.id)}
                    className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{w.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {w.type} {tech ? `· ${tech}` : ""} {asset ? `· ${asset}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isOverdue && <span className="text-xs text-red-600 font-medium">Overdue</span>}
                        <StatusBadge status={w.priority || "medium"} />
                        <StatusBadge status={w.status || "open"} />
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 py-3 border-t border-slate-200 bg-white text-sm space-y-1">
                      {w.description && <p className="text-slate-600">{w.description}</p>}
                      {w.due_date && <p className="text-xs text-slate-500">Due: {w.due_date?.slice(0,10)}</p>}
                      {w.started_at && <p className="text-xs text-slate-500">Started: {w.started_at?.slice(0,10)}</p>}
                      {w.completed_at && <p className="text-xs text-slate-500">Completed: {w.completed_at?.slice(0,10)}</p>}
                      <p className="text-xs text-slate-400">Created: {w.created_at?.slice(0,10)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
