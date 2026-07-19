"use client";
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { leadsApi, extendedLeadsApi, extendedLeadsApi, extendedLeadsApi } from "@/lib/api";
import { Lead, Activity } from "@/lib/types";
import { Card, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { LEAD_STATUS_CONFIG, PRIORITY_CONFIG, formatDate, formatRelative } from "@/lib/utils";
import {
  ArrowLeft, Zap, UserCheck, FileText,
  Building2, Mail, Phone, Clock, CheckCircle,
} from "lucide-react";

interface Timeline {
  lead_id: string;
  lead_name: string;
  lead_status: string;
  lead_score: number;
  timeline: Activity[];
}

const ACTIVITY_ICONS: Record<string, string> = {
  qualification: "🎯",
  assignment: "👤",
  quote_generated: "📄",
  quote_submitted: "📤",
  quote_sent: "✉️",
  quote_approved: "✅",
  quote_rejected: "❌",
  note: "💬",
};

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => leadsApi.get(id).then((r) => r as Lead),
  });

  const { data: timeline } = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => extendedLeadsApi.timeline(id).then((r) => r.data as Timeline),
  });

  async function doAction(action: string, fn: () => Promise<unknown>) {
    setActionLoading(action);
    try {
      await fn();
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["timeline", id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  if (leadLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status">
        <div className="w-8 h-8 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading lead...</span>
      </div>
    );
  }

  if (!lead) return <div role="alert">Lead not found</div>;

  const sc = LEAD_STATUS_CONFIG[lead.status];
  const pc = PRIORITY_CONFIG[lead.priority];
  const canQualify = lead.status === "new";
  const canAssign = lead.status === "qualified";
  const canQuote = lead.status === "assigned";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded"
          aria-label="Go back to leads list"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Leads
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
              <Badge color={sc.color} bg={sc.bg}>{sc.label}</Badge>
              <span className={`text-sm font-medium ${pc.color}`}>{pc.label} priority</span>
            </div>
            {lead.company && (
              <p className="flex items-center gap-1 text-gray-500 mt-1">
                <Building2 className="w-4 h-4" aria-hidden="true" /> {lead.company}
              </p>
            )}
          </div>
          {lead.score > 0 && (
            <div className="text-center px-4 py-2 bg-[#1B2B4B] rounded-xl text-white">
              <p className="text-2xl font-bold">{lead.score}</p>
              <p className="text-xs text-white/70">Score</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details + actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader title="Contact Information" />
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" aria-hidden="true" /> Email
                </dt>
                <dd className="text-sm font-medium text-gray-900">{lead.email}</dd>
              </div>
              {lead.phone && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" aria-hidden="true" /> Phone
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">{lead.phone}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 mb-1">Source</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">{lead.source}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" /> Created
                </dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(lead.created_at)}</dd>
              </div>
            </dl>
            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{lead.notes}</p>
              </div>
            )}
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader title="Activity Timeline" subtitle={`${timeline?.timeline.length || 0} events`} />
            {!timeline?.timeline.length ? (
              <p className="text-sm text-gray-400 text-center py-8">No activities yet</p>
            ) : (
              <ol className="relative border-l border-gray-200 space-y-6 ml-3">
                {timeline.timeline.map((act) => (
                  <li key={act.id} className="ml-6">
                    <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-white border-2 border-gray-200 rounded-full text-xs">
                      {ACTIVITY_ICONS[act.type] || "•"}
                    </span>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-800">{act.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {act.actor} · {formatRelative(act.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Actions" />
            <div className="space-y-3">
              <Button
                className="w-full"
                variant={canQualify ? "primary" : "ghost"}
                disabled={!canQualify}
                loading={actionLoading === "qualify"}
                onClick={() => doAction("qualify", () => extendedLeadsApi.qualify(id))}
                aria-label="Qualify this lead"
              >
                <Zap className="w-4 h-4" aria-hidden="true" />
                Qualify Lead
              </Button>

              <Button
                className="w-full"
                variant={canAssign ? "primary" : "ghost"}
                disabled={!canAssign}
                loading={actionLoading === "assign"}
                onClick={() => doAction("assign", () => extendedLeadsApi.assign(id))}
                aria-label="Auto-assign to best available agent"
              >
                <UserCheck className="w-4 h-4" aria-hidden="true" />
                Auto-Assign Agent
              </Button>

              <Button
                className="w-full"
                variant={canQuote ? "primary" : "ghost"}
                disabled={!canQuote}
                loading={actionLoading === "quote"}
                onClick={() => doAction("quote", () => extendedLeadsApi.generateQuote(id, 12))}
                aria-label="Generate a quote from this lead"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                Generate Quote
              </Button>
            </div>

            {/* Status flow indicator */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3 font-medium">Revenue Loop</p>
              <div className="space-y-1.5">
                {(["new","qualified","assigned","converted"] as LeadStatus[]).map((s) => {
                  const cfg = LEAD_STATUS_CONFIG[s];
                  const done = ["qualified","assigned","converted"].includes(lead.status)
                    && (s === "new" || (s === "qualified" && ["assigned","converted"].includes(lead.status))
                    || (s === "assigned" && lead.status === "converted")
                    || lead.status === s);
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-3.5 h-3.5 ${lead.status === s ? "text-[#1B2B4B]" : done ? "text-green-500" : "text-gray-200"}`}
                        aria-hidden="true"
                      />
                      <span className={`text-xs ${lead.status === s ? "font-semibold text-[#1B2B4B]" : done ? "text-green-600" : "text-gray-400"}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card>
            <p className="text-xs text-gray-500 mb-3 font-medium">Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge color={sc.color} bg={sc.bg}>{sc.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Priority</span>
                <span className={`font-medium ${pc.color}`}>{pc.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Score</span>
                <span className="font-medium">{lead.score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Source</span>
                <span className="capitalize">{lead.source}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
