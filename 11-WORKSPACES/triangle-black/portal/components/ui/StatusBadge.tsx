"use client";
// @ts-nocheck
// Triangle Black — Status Badge v2.0
// One source of truth for ALL status values across the platform
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  // ── Work Orders ───────────────────────────────────────
  open:           { label: "Open",           cls: "bg-info-bg text-info-text border border-info-border" },
  in_progress:    { label: "In Progress",    cls: "bg-warning-bg text-warning-text border border-warning-border" },
  completed:      { label: "Completed",      cls: "bg-success-bg text-success-text border border-success-border" },
  cancelled:      { label: "Cancelled",      cls: "bg-base-alt text-tertiary border border-border" },
  assigned:       { label: "Assigned",       cls: "bg-[var(--color-purple-bg)] text-[var(--color-purple-text)] border border-[var(--color-purple-border)]" },

  // ── Contracts ─────────────────────────────────────────
  active:              { label: "Active",             cls: "bg-success-bg text-success-text border border-success-border" },
  pending_signature:   { label: "Pending Signature",  cls: "bg-warning-bg text-warning-text border border-warning-border" },
  expired:             { label: "Expired",            cls: "bg-danger-bg text-danger-text border border-danger-border" },
  draft:               { label: "Draft",              cls: "bg-base-alt text-secondary border border-border" },

  // ── Invoices ──────────────────────────────────────────
  paid:           { label: "Paid",           cls: "bg-success-bg text-success-text border border-success-border font-semibold" },
  pending:        { label: "Pending",        cls: "bg-warning-bg text-warning-text border border-warning-border" },
  overdue:        { label: "Overdue",        cls: "bg-danger-bg text-danger-text border border-danger-border font-bold" },
  sent:           { label: "Sent",           cls: "bg-info-bg text-info-text border border-info-border" },

  // ── Assets ────────────────────────────────────────────
  Operational:         { label: "Operational",        cls: "bg-success-bg text-success-text border border-success-border" },
  "In Fault":          { label: "In Fault",           cls: "bg-danger-bg text-danger-text border border-danger-border" },
  "Under Maintenance": { label: "Under Maintenance",  cls: "bg-warning-bg text-warning-text border border-warning-border" },

  // ── Leads ─────────────────────────────────────────────
  new:            { label: "New",            cls: "bg-info-bg text-info-text border border-info-border" },
  qualified:      { label: "Qualified",      cls: "bg-[var(--color-purple-bg)] text-[var(--color-purple-text)] border border-[var(--color-purple-border)]" },
  proposal:       { label: "Proposal",       cls: "bg-[var(--color-indigo-bg)] text-[var(--color-indigo-text)] border border-[var(--color-indigo-border)]" },
  negotiation:    { label: "Negotiation",    cls: "bg-warning-bg text-warning-text border border-warning-border" },
  won:            { label: "Won ✓",          cls: "bg-success-bg text-success-text border border-success-border font-semibold" },
  lost:           { label: "Lost",           cls: "bg-danger-bg text-danger-text border border-danger-border" },

  // ── Priority ──────────────────────────────────────────
  critical:       { label: "Critical",       cls: "bg-danger text-inverse border border-danger font-bold" },
  high:           { label: "High",           cls: "bg-[var(--color-orange-bg)] text-[var(--color-orange-text)] border border-[var(--color-orange-border)]" },
  medium:         { label: "Medium",         cls: "bg-warning-bg text-warning-text border border-warning-border" },
  low:            { label: "Low",            cls: "bg-base-alt text-secondary border border-border" },

  // ── Generic ───────────────────────────────────────────
  approved:       { label: "Approved",       cls: "bg-success-bg text-success-text border border-success-border" },
  rejected:       { label: "Rejected",       cls: "bg-danger-bg text-danger-text border border-danger-border" },
  submitted:      { label: "Submitted",      cls: "bg-info-bg text-info-text border border-info-border" },
  urgent:         { label: "Urgent",         cls: "bg-danger-bg text-danger-text border border-danger-border font-bold" },
  normal:         { label: "Normal",         cls: "bg-base-alt text-secondary border border-border" },
  active:         { label: "Active",         cls: "bg-success-bg text-success-text border border-success-border" },
  inactive:       { label: "Inactive",       cls: "bg-base-alt text-tertiary border border-border" },
  planning:       { label: "Planning",       cls: "bg-info-bg text-info-text border border-info-border" },
};

interface StatusBadgeProps {
  status: string;
  size?: "xs" | "sm";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const key = status || "";
  const config = STATUS_CONFIG[key] || STATUS_CONFIG[key?.toLowerCase()] || {
    label: key.replace(/_/g, " ") || "—",
    cls:   "bg-base-alt text-secondary border border-border",
  };

  const padding = size === "xs"
    ? "px-1.5 py-0.5 text-2xs"
    : "px-2.5 py-0.5 text-xs";

  return (
    <span className={`inline-flex items-center rounded-lg font-medium capitalize ${padding} ${config.cls}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
