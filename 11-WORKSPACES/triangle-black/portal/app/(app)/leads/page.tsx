"use client";
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { leadsApi, searchApi } from "@/lib/api";
import { Lead, LeadStatus } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  LEAD_STATUS_CONFIG, PRIORITY_CONFIG, formatRelative,
} from "@/lib/utils";
import {
  Plus, List, LayoutGrid, Search, Building2, X,
} from "lucide-react";
import Link from "next/link";

const COLUMNS: LeadStatus[] = ["new", "qualified", "assigned", "converted", "lost"];

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "web",      label: "Web" },
  { value: "referral", label: "Referral" },
  { value: "direct",   label: "Direct" },
  { value: "import",   label: "Import" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "new",       label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "assigned",  label: "Assigned" },
  { value: "converted", label: "Converted" },
  { value: "lost",      label: "Lost" },
];

const PRIORITY_OPTIONS = [
  { value: "",       label: "All Priorities" },
  { value: "high",   label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low" },
];

function LeadCard({ lead }: { lead: Lead }) {
  const sc = LEAD_STATUS_CONFIG[lead.status];
  const pc = PRIORITY_CONFIG[lead.priority];
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1B2B4B] hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B]"
      aria-label={`Lead: ${lead.name}, status: ${lead.status}, priority: ${lead.priority}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-gray-900 text-sm leading-tight">
          {lead.name}
        </p>
        <span className={`text-xs font-medium ${pc.color} flex-shrink-0`}>
          {pc.label}
        </span>
      </div>
      {lead.company && (
        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
          <Building2 className="w-3 h-3" aria-hidden="true" /> {lead.company}
        </p>
      )}
      <div className="flex items-center justify-between mt-3">
        <Badge color={sc.color} bg={sc.bg}>{sc.label}</Badge>
        {lead.score > 0 && (
          <span className="text-xs text-gray-400">Score: {lead.score}</span>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">{formatRelative(lead.created_at)}</p>
    </Link>
  );
}

export default function LeadsPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  const hasFilters = q !== "" || statusFilter !== "" || sourceFilter !== "" || priorityFilter !== "";

  /* Base leads (always loaded) */
  const { data: allLeads = [], isLoading: baseLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadsApi.list().then((r) => r.data as Lead[]),
    refetchInterval: 15000,
  });

  /* API search (only when filters active) */
  const { data: searchResults, isFetching: searchLoading } = useQuery({
    queryKey: ["leads-search", q, statusFilter, sourceFilter, priorityFilter],
    queryFn: async () => {
      const res = await searchApi.leads(q, {
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        priority: priorityFilter || undefined,
      });
      return res.data as Lead[];
    },
    enabled: hasFilters,
    refetchInterval: false,
  });

  const leads = hasFilters ? (searchResults ?? []) : allLeads;
  const isLoading = baseLoading || (hasFilters && searchLoading);

  function clearFilters() {
    setQ("");
    setStatusFilter("");
    setSourceFilter("");
    setPriorityFilter("");
  }

  const byStatus = COLUMNS.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {hasFilters
              ? `${leads.length} result${leads.length !== 1 ? "s" : ""} found`
              : `${allLeads.length} total leads`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle */}
          <div
            className="flex border border-gray-200 rounded-lg overflow-hidden"
            role="group"
            aria-label="View toggle"
          >
            <button
              onClick={() => setView("kanban")}
              aria-pressed={view === "kanban"}
              className={`p-2 ${view === "kanban" ? "bg-[#1B2B4B] text-white" : "text-gray-500 hover:bg-gray-50"}`}
              aria-label="Kanban view"
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`p-2 ${view === "list" ? "bg-[#1B2B4B] text-white" : "text-gray-500 hover:bg-gray-50"}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <Button onClick={() => router.push("/leads/new")}>
            <Plus className="w-4 h-4" aria-hidden="true" /> New Lead
          </Button>
        </div>
      </div>

      {/* ── SEARCH + FILTER BAR ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search input */}
          <div className="relative flex-1 min-w-48">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by name, company, email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search leads"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B4B] bg-white text-gray-700"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label="Filter by source"
            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B4B] bg-white text-gray-700"
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
            className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B4B] bg-white text-gray-700"
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Clear button */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 py-2 px-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              aria-label="Clear all filters"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" /> Clear
            </button>
          )}

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap" aria-live="polite">
              {q && (
                <span className="text-xs bg-[#1B2B4B] text-white px-2.5 py-1 rounded-full">
                  &quot;{q}&quot;
                </span>
              )}
              {statusFilter && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full capitalize">
                  {statusFilter}
                </span>
              )}
              {sourceFilter && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full capitalize">
                  {sourceFilter}
                </span>
              )}
              {priorityFilter && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full capitalize">
                  {priorityFilter} priority
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div role="status" aria-live="polite" className="text-center py-12 text-gray-400">
          <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          {hasFilters ? "Searching..." : "Loading leads..."}
        </div>
      )}

      {/* No results */}
      {!isLoading && hasFilters && leads.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-500 font-medium">No leads match your search</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-[#1B2B4B] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* KANBAN VIEW */}
      {!isLoading && leads.length > 0 && view === "kanban" && (
        <div
          className="grid gap-4 overflow-x-auto pb-4"
          style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(220px, 1fr))` }}
          role="region"
          aria-label="Lead kanban board"
        >
          {COLUMNS.map((status) => {
            const cfg = LEAD_STATUS_CONFIG[status];
            const col = byStatus[status];
            return (
              <section key={status} aria-label={`${cfg.label} column`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge color={cfg.color} bg={cfg.bg}>{cfg.label}</Badge>
                    <span className="text-sm font-semibold text-gray-700">
                      {col.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-24">
                  {col.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                      No leads
                    </div>
                  ) : (
                    col.map((lead) => <LeadCard key={lead.id} lead={lead} />)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {!isLoading && leads.length > 0 && view === "list" && (
        <Card padding={false}>
          <table className="w-full text-sm" role="grid" aria-label="Leads table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Hotel / Client", "Company", "Source",
                  "Status", "Priority", "Score", "Created",
                ].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => {
                const sc = LEAD_STATUS_CONFIG[lead.status];
                const pc = PRIORITY_CONFIG[lead.priority];
                return (
                  <tr
                    key={lead.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    role="row"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {lead.company || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">
                      {lead.source}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={sc.color} bg={sc.bg}>{sc.label}</Badge>
                    </td>
                    <td className={`px-4 py-3 font-medium ${pc.color}`}>
                      {pc.label}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {lead.score || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {formatRelative(lead.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
