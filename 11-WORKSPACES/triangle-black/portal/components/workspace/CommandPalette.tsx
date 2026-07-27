// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CommandItem = {
  title: string;
  subtitle: string;
  href: string;
  category: string;
};

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

const COMMANDS: CommandItem[] = [
  { title: "Executive Command Workspace", subtitle: "Leadership control surface", href: "/executive/command", category: "Centers" },
  { title: "Commercial Command Workspace", subtitle: "Leads, quotes, and contracts", href: "/commercial/command", category: "Centers" },

  { title: "Operations Command Workspace", subtitle: "Execution, technicians, and service demand", href: "/operations/command", category: "Centers" },


  { title: "Engineering Center", subtitle: "BOQ, specifications, drawings, inspections, and engineering knowledge", href: "/engineering", category: "Centers" },


  { title: "Maintenance Center", subtitle: "Assets, plans, schedules, warranties, parts, downtime, and maintenance intelligence", href: "/maintenance", category: "Centers" },

  { title: "Projects Center", subtitle: "Projects, phases, milestones, budgets, resources, and project documents", href: "/projects-center", category: "Centers" },
  { title: "Projects Review", subtitle: "Project review signals across tasks, risks, issues, and budgets", href: "/projects-center/review", category: "Centers" },
  { title: "Projects Actions", subtitle: "Task, risk, and issue review actions", href: "/projects-center/actions", category: "Centers" },
  { title: "Projects Schedule Review", subtitle: "Milestones, phases, and task timing review", href: "/projects-center/review/schedule", category: "Centers" },
  { title: "Maintenance Review", subtitle: "Maintenance review signals and attention summary", href: "/maintenance/review", category: "Centers" },
  { title: "Maintenance Actions", subtitle: "PM, corrective, emergency, downtime, and cost action workspace", href: "/maintenance/actions", category: "Centers" },
  { title: "Maintenance Asset Tree", subtitle: "Maintenance hierarchy and asset structure", href: "/maintenance/asset-tree", category: "Centers" },
  { title: "Maintenance Intelligence", subtitle: "High-level maintenance intelligence summary", href: "/maintenance/intelligence", category: "Centers" },
  { title: "Engineering Intelligence", subtitle: "Cross-section engineering intelligence and counts", href: "/engineering/intelligence", category: "Centers" },
  { title: "Engineering Review", subtitle: "Inspection, quality, safety, and document review", href: "/engineering/review", category: "Centers" },

  { title: "Engineering AI", subtitle: "Engineering AI workspace placeholder", href: "/engineering/ai", category: "Centers" },
  { title: "Engineering Review Actions", subtitle: "Site visit, inspection, quality, and safety actions", href: "/engineering/actions", category: "Centers" },


  { title: "Supply Chain Command Workspace", subtitle: "Procurement, vendors, and inventory visibility", href: "/supply-chain/command", category: "Centers" },

  { title: "Supplier Foundation", subtitle: "Enterprise supplier master and governance", href: "/supply-chain/suppliers", category: "Centers" },
  { title: "RFQ and Sourcing", subtitle: "RFQ, supplier invitations, quotations, and comparison", href: "/supply-chain/rfqs", category: "Centers" },
  { title: "Supplier Quotations", subtitle: "Quotation capture and sourcing review", href: "/supply-chain/quotations", category: "Centers" },

  { title: "Comparison Matrix", subtitle: "Supplier comparison and sourcing decision layer", href: "/supply-chain/comparison", category: "Centers" },
  { title: "Purchase Requests", subtitle: "Demand intake and purchasing approvals", href: "/supply-chain/purchase-requests", category: "Centers" },
  { title: "Purchase Orders", subtitle: "Supplier commitments and purchasing execution", href: "/supply-chain/purchase-orders", category: "Centers" },

  { title: "Goods Receipts", subtitle: "Inbound receipt recording and acceptance", href: "/supply-chain/goods-receipts", category: "Centers" },
  { title: "Supplier Invoices", subtitle: "Supplier invoice capture and review", href: "/supply-chain/supplier-invoices", category: "Centers" },
  { title: "Invoice Matching", subtitle: "PO and GRN matching with variance review", href: "/supply-chain/invoice-matching", category: "Centers" },
  { title: "Actions Center", subtitle: "Cross-object enterprise action orchestration", href: "/actions/center", category: "Centers" },

  { title: "Workflow Launcher", subtitle: "Cross-capability enterprise workflow catalog", href: "/workflows/launcher", category: "Centers" },

  { title: "Enterprise Graph", subtitle: "Cross-object navigation map across the platform", href: "/graph", category: "Centers" },

  { title: "Recommendations Workspace", subtitle: "Cross-object enterprise recommendations and next actions", href: "/recommendations", category: "Centers" },


  { title: "Backend Alignment Workspace", subtitle: "Target backend contract for enterprise entity detail pages", href: "/integration/backend", category: "Centers" },
  { title: "Entity Integration Workspace", subtitle: "Live validation of backend entity detail endpoints", href: "/integration/entities", category: "Centers" },
  { title: "Workspace Hub", subtitle: "Pinned entities, recent entities, and personal workspace memory", href: "/workspace", category: "Centers" },
  { title: "My Day Workspace", subtitle: "Daily role-oriented launch and continuity surface", href: "/workspace/my-day", category: "Centers" },
  { title: "Executive Workbench", subtitle: "Daily strategic leadership workbench", href: "/executive/workbench", category: "Centers" },
  { title: "Commercial Workbench", subtitle: "Daily sales and customer movement workbench", href: "/commercial/workbench", category: "Centers" },
  { title: "Operations Workbench", subtitle: "Daily execution and service workbench", href: "/operations/workbench", category: "Centers" },

  { title: "Supply Chain Workbench", subtitle: "Daily procurement and supplier workbench", href: "/supply-chain/workbench", category: "Centers" },
  { title: "Executive Intelligence Workspace", subtitle: "Leadership intelligence and enterprise scorecards", href: "/executive/intelligence", category: "Centers" },

  { title: "Analytics Scorecards Workspace", subtitle: "Cross-center health and enterprise scorecards", href: "/analytics/scorecards", category: "Centers" },

  { title: "Alerts Center", subtitle: "Enterprise alerts, escalations, and next-action routing", href: "/alerts", category: "Centers" },


  { title: "Role Inbox", subtitle: "Role-based notification inbox and follow-up tracking", href: "/inbox", category: "Centers" },

  { title: "Operations Calendar", subtitle: "Service timing and scheduling workspace", href: "/operations/calendar", category: "Centers" },

  { title: "Supply Chain Queue Board", subtitle: "Request, order, vendor, and item review board", href: "/supply-chain/queue", category: "Centers" },

  { title: "Commercial Review Board", subtitle: "Lead, quote, and contract review surface", href: "/commercial/review", category: "Centers" },


  { title: "Supply Chain Review Intelligence", subtitle: "Procurement, supplier, and item review surface", href: "/supply-chain/review", category: "Centers" },
  { title: "Commercial Review Intelligence", subtitle: "Commercial movement and proposal pressure review surface", href: "/commercial/review-intelligence", category: "Centers" },
  { title: "Executive Exception Dashboard", subtitle: "Leadership review of high-friction enterprise exceptions", href: "/executive/exceptions", category: "Centers" },
  { title: "Operations SLA Review Board", subtitle: "Execution, demand, and capacity review surface", href: "/operations/sla-review", category: "Centers" },
  { title: "Executive Daily Review Board", subtitle: "Leadership review surface for daily signals and watchlists", href: "/executive/daily-review", category: "Centers" },
  { title: "Customer Success Review Board", subtitle: "Relationship continuity and billing review board", href: "/customers/review", category: "Centers" },
  { title: "Dispatch Board Workspace", subtitle: "Assignment, technician capacity, and urgent demand", href: "/operations/dispatch", category: "Centers" },
  { title: "Inbox Presets", subtitle: "Role-aligned default inbox models", href: "/inbox/presets", category: "Centers" },
  { title: "Notification Rules Studio", subtitle: "Enterprise routing rules for alerts and attention", href: "/admin/notification-rules", category: "Centers" },
  { title: "Legacy Leads", subtitle: "Current lead management surface", href: "/leads", category: "Legacy" },
  { title: "Legacy Quotes", subtitle: "Current quotation surface", href: "/quotes", category: "Legacy" },
  { title: "Legacy Contracts", subtitle: "Current contract surface", href: "/contracts", category: "Legacy" },
  { title: "Legacy Reports", subtitle: "Current reporting surface", href: "/reports", category: "Legacy" },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((item) =>
      [item.title, item.subtitle, item.category, item.href].join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div
      className={[
        "fixed inset-0 z-[80]",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 bg-slate-950/50 transition",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <div className="absolute inset-x-0 top-8 mx-auto w-[94vw] max-w-3xl">
        <div
          className={[
            "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition",
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          ].join(" ")}
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Command Palette
            </div>
            <input
              autoFocus={open}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search centers, legacy pages, and commands..."
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-tertiary focus:border-slate-400"
            />
            <div className="mt-2 text-xs text-secondary">
              Tip: use Ctrl+K or Cmd+K to launch search
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto p-3">
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-secondary">
                No results found for this query.
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-slate-200 hover:bg-white"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{item.title}</div>
                        <div className="mt-1 text-sm text-slate-600">{item.subtitle}</div>
                      </div>
                      <div className="text-xs uppercase tracking-wide text-secondary">
                        {item.category}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-secondary">{item.href}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
