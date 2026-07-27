"use client";
// @ts-nocheck
// Triangle Black — Unified Status Badge
// Usage: <StatusBadge status="completed" /> or <StatusBadge status="open" type="wo" />

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  // Work Order statuses
  open:           { label: "Open",           cls: "bg-blue-100 text-blue-700" },
  in_progress:    { label: "In Progress",    cls: "bg-amber-100 text-amber-700" },
  completed:      { label: "Completed",      cls: "bg-emerald-100 text-emerald-700" },
  cancelled:      { label: "Cancelled",      cls: "bg-slate-100 text-slate-600" },
  assigned:       { label: "Assigned",       cls: "bg-purple-100 text-purple-700" },

  // Contract statuses
  active:              { label: "Active",             cls: "bg-emerald-100 text-emerald-700" },
  pending_signature:   { label: "Pending Signature",  cls: "bg-amber-100 text-amber-700" },
  expired:             { label: "Expired",            cls: "bg-red-100 text-red-700" },
  draft:               { label: "Draft",              cls: "bg-slate-100 text-slate-600" },

  // Invoice statuses
  paid:           { label: "Paid",           cls: "bg-emerald-100 text-emerald-700" },
  pending:        { label: "Pending",        cls: "bg-amber-100 text-amber-700" },
  overdue:        { label: "Overdue",        cls: "bg-red-100 text-red-700 font-bold" },
  sent:           { label: "Sent",           cls: "bg-blue-100 text-blue-700" },

  // Asset statuses
  Operational:         { label: "Operational",        cls: "bg-emerald-100 text-emerald-700" },
  "In Fault":          { label: "In Fault",           cls: "bg-red-100 text-red-700" },
  "Under Maintenance": { label: "Under Maintenance",  cls: "bg-amber-100 text-amber-700" },

  // Lead statuses
  new:            { label: "New",            cls: "bg-blue-100 text-blue-700" },
  qualified:      { label: "Qualified",      cls: "bg-purple-100 text-purple-700" },
  proposal:       { label: "Proposal",       cls: "bg-indigo-100 text-indigo-700" },
  negotiation:    { label: "Negotiation",    cls: "bg-amber-100 text-amber-700" },
  won:            { label: "Won",            cls: "bg-emerald-100 text-emerald-700 font-bold" },
  lost:           { label: "Lost",           cls: "bg-red-100 text-red-700" },

  // Priority
  critical:       { label: "Critical",       cls: "bg-red-500 text-white font-bold" },
  high:           { label: "High",           cls: "bg-orange-100 text-orange-700" },
  medium:         { label: "Medium",         cls: "bg-amber-100 text-amber-700" },
  low:            { label: "Low",            cls: "bg-slate-100 text-slate-600" },

  // Generic
  approved:       { label: "Approved",       cls: "bg-emerald-100 text-emerald-700" },
  rejected:       { label: "Rejected",       cls: "bg-red-100 text-red-700" },
  submitted:      { label: "Submitted",      cls: "bg-blue-100 text-blue-700" },
  urgent:         { label: "Urgent",         cls: "bg-red-100 text-red-700 font-bold" },
  normal:         { label: "Normal",         cls: "bg-slate-100 text-slate-600" },
};

interface StatusBadgeProps {
  status: string;
  size?: "xs" | "sm";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[status?.toLowerCase()] || {
    label: status || "—",
    cls: "bg-slate-100 text-slate-600"
  };

  const padding = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs";

  return (
    <span className={`inline-flex items-center rounded-lg font-medium ${padding} ${config.cls}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
