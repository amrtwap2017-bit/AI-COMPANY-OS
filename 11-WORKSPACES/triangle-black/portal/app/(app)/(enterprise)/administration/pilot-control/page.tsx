"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck, Activity, Cpu, DollarSign,
  ArrowRight, RefreshCw, Layers, Wrench, Package
} from "lucide-react";

export default function PilotControlRoomPage() {
  const { data: report, isLoading, refetch } = useQuery(
    ["pilot-control-room-status"],
    () => authFetch("/api/v1/pilot-control/status").then(r => r.json()),
    { staleTime: 15000 }
  );

  const pilots = report?.pilots || [];

  if (isLoading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-secondary">Synchronizing Multi-Tenant SRE Control Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-brand" />
              SRE Pilot Control Room
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Super-Admin Session
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Consolidated operational health index, maintenance backlog metrics, and budget variance across all active pilot hotels.
          </p>
        </div>
        <div>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Force Sync
          </Button>
        </div>
      </div>

      {/* Grid: Pilot Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {pilots.map((p: any) => (
          <div
            key={p.hotel_id}
            className="p-6 rounded-xl border border-border bg-surface flex flex-col justify-between hover:border-brand/40 transition-colors shadow-sm space-y-5"
          >
            {/* Property Title */}
            <div className="border-b border-divider pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-primary">{p.name}</h3>
                <span className="text-xs text-secondary">{p.brand} • {p.city}</span>
              </div>
              <StatusBadge
                status={`${p.health_index}/100 Health`}
                variant={p.health_index < 75 ? "danger" : (p.health_index < 90 ? "warning" : "success")}
              />
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg border border-border bg-surface-alt flex items-center justify-between">
                <span className="text-secondary">Monitored Assets:</span>
                <span className="font-bold text-primary">{p.kpis.total_assets}</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-surface-alt flex items-center justify-between">
                <span className="text-secondary">SLA Breaches:</span>
                <span className={`font-bold ${p.kpis.sla_breaches > 0 ? "text-danger-text" : "text-primary"}`}>
                  {p.kpis.sla_breaches}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-surface-alt flex items-center justify-between col-span-2">
                <span className="text-secondary">Procurement Spend (30d):</span>
                <span className="font-bold text-primary">${p.kpis.procurement_spend_usd.toLocaleString()}</span>
              </div>
            </div>

            {/* Admin CTA */}
            <div className="pt-3 border-t border-divider text-xs text-secondary flex items-center justify-between">
              <span className="font-mono text-[10px]">ID: {p.hotel_id.slice(0, 15)}...</span>
              <span className="font-bold text-brand flex items-center gap-1 cursor-pointer">
                Impersonate Tenant Context
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
