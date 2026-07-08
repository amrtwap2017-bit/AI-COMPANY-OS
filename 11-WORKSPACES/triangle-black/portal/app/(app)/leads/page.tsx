"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { leadsApi } from "@/lib/api";
import { Lead, LeadStatus } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  LEAD_STATUS_CONFIG, PRIORITY_CONFIG, formatEGP, formatRelative,
} from "@/lib/utils";
import { Plus, List, LayoutGrid, Search, Building2, Phone, Mail } from "lucide-react";
import Link from "next/link";

const COLUMNS: LeadStatus[] = ["new","qualified","assigned","converted","lost"];

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
        <p className="font-semibold text-gray-900 text-sm leading-tight">{lead.name}</p>
        <span className={`text-xs font-medium ${pc.color} flex-shrink-0`}>{pc.label}</span>
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
  const [view, setView] = useState<"kanban"|"list">("kanban");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadsApi.list().then((r) => r.data as Lead[]),
    refetchInterval: 15000,
  });

  const filtered = leads.filter((l) =>
    search === "" ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const byStatus = COLUMNS.reduce((acc, s) => {
    acc[s] = filtered.filter((l) => l.status === s);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} total leads</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search leads"
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2B4B] w-56"
            />
          </div>
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden" role="group" aria-label="View toggle">
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

      {isLoading && (
        <div role="status" aria-live="polite" className="text-center py-12 text-gray-400">
          <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading leads...
        </div>
      )}

      {/* KANBAN VIEW */}
      {!isLoading && view === "kanban" && (
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
                    <span className="text-sm font-semibold text-gray-700">{col.length}</span>
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
      {!isLoading && view === "list" && (
        <Card padding={false}>
          <table className="w-full text-sm" role="grid" aria-label="Leads table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Hotel / Client","Company","Source","Status","Priority","Score","Created"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => {
                const sc = LEAD_STATUS_CONFIG[lead.status];
                const pc = PRIORITY_CONFIG[lead.priority];
                return (
                  <tr
                    key={lead.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    role="row"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-500">{lead.company || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{lead.source}</td>
                    <td className="px-4 py-3">
                      <Badge color={sc.color} bg={sc.bg}>{sc.label}</Badge>
                    </td>
                    <td className={`px-4 py-3 font-medium ${pc.color}`}>{pc.label}</td>
                    <td className="px-4 py-3 text-gray-500">{lead.score || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{formatRelative(lead.created_at)}</td>
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
