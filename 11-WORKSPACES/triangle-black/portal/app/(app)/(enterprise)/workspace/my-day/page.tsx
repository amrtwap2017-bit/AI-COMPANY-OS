"use client";
// @ts-nocheck
// Triangle Black — My Day Command Center
// Sprint 302: Program A — Component Library Adoption
// Migrated: inline KPIs → KpiCard, inline status → StatusBadge,
//           inline empty → EmptyState, inline header → PageHeader
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ── Component Library Imports (Sprint 302 adoption) ──────────────────────────
import { PageHeader }  from "@/components/ui/PageHeader";
import { KpiCard }     from "@/components/ui/KpiCard";
import { MetricCard }  from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState }  from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { DataTable }   from "@/components/ui/DataTable";

// ── Fetch helpers ─────────────────────────────────────────────────────────────
const fetchMyDay    = () => authFetch("/api/v1/workspace/my-day").then(r => r.json());
const fetchApprovals = () => authFetch("/api/v1/approval-requests/").then(r => r.json());
const fetchSLA      = () => authFetch("/api/v1/sla/breaches").then(r => r.json());
const fetchWOs      = () => authFetch("/api/v1/work-orders/?limit=10&status=open").then(r => r.json());

export default function MyDayPage() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: myDay,     isLoading: loadingMyDay }     = useQuery({ queryKey: ["my-day"],    queryFn: fetchMyDay,    staleTime: 60_000 });
  const { data: approvals, isLoading: loadingApprovals } = useQuery({ queryKey: ["approvals"], queryFn: fetchApprovals, staleTime: 60_000 });
  const { data: sla,       isLoading: loadingSLA }       = useQuery({ queryKey: ["sla"],       queryFn: fetchSLA,      staleTime: 60_000 });
  const { data: wos,       isLoading: loadingWOs }       = useQuery({ queryKey: ["my-wos"],    queryFn: fetchWOs,      staleTime: 60_000 });

  const approvalList = Array.isArray(approvals) ? approvals : (approvals?.items ?? []);
  const slaBreaches  = Array.isArray(sla) ? sla : (sla?.breaches ?? []);
  const woList       = Array.isArray(wos) ? wos : (wos?.items ?? wos?.work_orders ?? []);
  const pendingCount = approvalList.filter((a: any) => a.status === "pending").length;

  const approveMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const r = await authFetch(`/api/v1/approval-requests/${id}/${action}`, { method: "POST" });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      toast.success("Action recorded");
    },
    onError: () => toast.error("Action failed"),
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const userName  = user?.name?.split(" ")[0] ?? "there";

  // ── Work Orders table columns ─────────────────────────────────────────────
  const woColumns = [
    { key: "title",    label: "Work Order", render: (row: any) => (
      <span className="font-medium text-primary cursor-pointer hover:text-brand"
            onClick={() => router.push(`/operations/work-orders/${row.id}`)}>
        {row.title}
      </span>
    )},
    { key: "priority", label: "Priority", render: (row: any) => <StatusBadge status={row.priority ?? "medium"} /> },
    { key: "status",   label: "Status",   render: (row: any) => <StatusBadge status={row.status} /> },
    { key: "due_date", label: "Due",      render: (row: any) => row.due_date ? new Date(row.due_date).toLocaleDateString("en-GB") : "—" },
  ];

  // ── Approvals table columns ───────────────────────────────────────────────
  const approvalColumns = [
    { key: "document_type", label: "Type",    render: (row: any) => <span className="capitalize">{(row.document_type ?? "").replace(/_/g, " ")}</span> },
    { key: "requested_by",  label: "From",    render: (row: any) => row.requested_by ?? "—" },
    { key: "status",        label: "Status",  render: (row: any) => <StatusBadge status={row.status} /> },
    { key: "actions",       label: "Actions", render: (row: any) => row.status === "pending" ? (
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => approveMutation.mutate({ id: row.id, action: "approve" })}
          className="tb-btn-xs-success">Approve</button>
        <button onClick={() => approveMutation.mutate({ id: row.id, action: "reject" })}
          className="tb-btn-xs-danger">Reject</button>
      </div>
    ) : null },
  ];

  if (loadingMyDay && loadingApprovals) {
    return (
      <div>
        <div className="tb-hero">
          <div className="tb-hero-inner">
            <h1 className="tb-hero-title">{greeting}, {userName}</h1>
          </div>
        </div>
        <div className="tb-canvas">
          <LoadingState type="cards" rows={2} cols={4} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div>
            <h1 className="tb-hero-title">{greeting}, {userName} 👋</h1>
            <p className="tb-hero-description">
              {new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
              {pendingCount > 0 && <span style={{ marginLeft:12, color:"#B9924C", fontWeight:600 }}>· {pendingCount} pending approval{pendingCount > 1 ? "s" : ""}</span>}
            </p>
          </div>

          {/* ── KPI Strip ─────────────────────────────────────────────────── */}
          <div className="tb-hero-kpis" style={{ marginTop:24 }}>
            <KpiCard
              label="Open Work Orders"
              value={woList.length}
              sub="assigned to team"
              color="amber"
              icon="🔧"
              href="/operations/work-orders"
            />
            <KpiCard
              label="Pending Approvals"
              value={pendingCount}
              sub="awaiting action"
              color={pendingCount > 0 ? "red" : "emerald"}
              icon="✅"
              status={pendingCount > 0 ? "warn" : "ok"}
              href="/approvals"
            />
            <KpiCard
              label="SLA Breaches"
              value={slaBreaches.length}
              sub="overdue items"
              color={slaBreaches.length > 0 ? "red" : "emerald"}
              icon="⚠️"
              status={slaBreaches.length > 0 ? "critical" : "ok"}
              href="/operations/sla"
            />
            <KpiCard
              label="Today"
              value={new Date().toLocaleDateString("en-GB", { day:"numeric", month:"short" })}
              sub={new Date().toLocaleDateString("en-GB", { weekday:"long" })}
              color="slate"
              icon="📅"
            />
          </div>
        </div>
      </div>

      {/* ── Canvas ────────────────────────────────────────────────────────── */}
      <div className="tb-canvas">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>

          {/* ── My Work Orders ──────────────────────────────────────────── */}
          <SectionCard
            title="My Work Orders"
            subtitle="Open items assigned to team"
            actions={
              <button onClick={() => router.push("/operations/work-orders")}
                className="tb-section-link">View All →</button>
            }
          >
            {loadingWOs ? (
              <LoadingState type="table" rows={5} />
            ) : woList.length === 0 ? (
              <EmptyState
                icon="🔧"
                title="No open work orders"
                description="All clear — no open work orders assigned"
                action={{ label: "Create Work Order", href: "/operations/work-orders/new" }}
                size="sm"
              />
            ) : (
              <DataTable
                columns={woColumns}
                data={woList.slice(0, 8)}
                onRow={(row) => router.push(`/operations/work-orders/${row.id}`)}
                keyField="id"
              />
            )}
          </SectionCard>

          {/* ── Pending Approvals ────────────────────────────────────────── */}
          <SectionCard
            title="Pending Approvals"
            subtitle={`${pendingCount} item${pendingCount !== 1 ? "s" : ""} require your action`}
            actions={
              <button onClick={() => router.push("/approvals")}
                className="tb-section-link">View All →</button>
            }
          >
            {loadingApprovals ? (
              <LoadingState type="table" rows={5} />
            ) : approvalList.length === 0 ? (
              <EmptyState
                icon="✅"
                title="No pending approvals"
                description="You are all caught up"
                size="sm"
              />
            ) : (
              <DataTable
                columns={approvalColumns}
                data={approvalList.slice(0, 8)}
                keyField="id"
              />
            )}
          </SectionCard>

          {/* ── SLA Breaches ─────────────────────────────────────────────── */}
          <SectionCard
            title="SLA Breaches"
            subtitle="Items that have exceeded response time"
            actions={
              <button onClick={() => router.push("/operations/sla")}
                className="tb-section-link">SLA Dashboard →</button>
            }
          >
            {loadingSLA ? (
              <LoadingState type="list" rows={4} />
            ) : slaBreaches.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="No SLA breaches"
                description="All service requests are within SLA targets"
                size="sm"
              />
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {slaBreaches.slice(0, 6).map((b: any) => (
                  <div key={b.id}
                    onClick={() => router.push(`/operations/service-requests/${b.id}`)}
                    style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                             padding:"10px 12px", background:"var(--color-danger-bg)",
                             border:"1px solid var(--color-danger-border)",
                             borderRadius:8, cursor:"pointer" }}>
                    <div>
                      <p style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--color-text-1)" }}>{b.title}</p>
                      <p style={{ fontSize:"0.7rem", color:"var(--color-text-2)" }}>
                        {b.urgency ?? "medium"} · {b.hours_overdue ? `${b.hours_overdue}h overdue` : "overdue"}
                      </p>
                    </div>
                    <StatusBadge status={b.status ?? "open"} size="xs" />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Quick Actions ─────────────────────────────────────────────── */}
          <SectionCard title="Quick Actions" subtitle="Common tasks">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { label:"New Work Order",    href:"/operations/work-orders/new",        icon:"🔧" },
                { label:"New Service Request",href:"/operations/service-requests",     icon:"📋" },
                { label:"Log Time",           href:"/operations/time-tracking",         icon:"⏱️" },
                { label:"Dispatch Board",     href:"/operations/dispatch",              icon:"📍" },
                { label:"View All Approvals", href:"/approvals",                        icon:"✅" },
                { label:"Asset QR Scan",      href:"/operations/assets/qr",            icon:"📷" },
              ].map((action: any) => (
                <button key={action.href}
                  onClick={() => router.push(action.href)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px",
                           background:"var(--color-surface-alt)", border:"1px solid var(--color-border)",
                           borderRadius:10, cursor:"pointer", textAlign:"left",
                           fontSize:"0.8rem", fontWeight:500, color:"var(--color-text-1)",
                           transition:"all 0.15s ease" }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.borderColor = "#B9924C")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                  <span style={{ fontSize:"1.2rem" }}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
