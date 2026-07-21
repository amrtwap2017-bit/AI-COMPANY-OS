"use client";
// @ts-nocheck
"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { fmtDate } from "@/lib/design-tokens";
import { ArrowLeft, Edit, TrendingUp, Mail, Phone, Building2, Clock } from "lucide-react";
import Link from "next/link";

export default function LeadDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const { data: lead, isLoading, isError, error } = useQuery({
    queryKey:  ["lead", id],
    queryFn:   () => authFetchJSON("/api/v1/actions/leads/" + id),
    staleTime: 30_000,
    enabled:   !!id,
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ["lead-timeline", id],
    queryFn:  () => authFetchJSON("/api/v1/actions/leads/" + id + "/timeline"),
    enabled:  !!id,
  });

  const timelineItems = Array.isArray(timeline) ? timeline : timeline?.events || [];

  if (isLoading) return <PageWrapper><LoadingState type="table" rows={6}/></PageWrapper>;
  if (isError || !lead) return <PageWrapper><AlertBanner type="error" title={error instanceof Error ? error.message : "Lead not found"}/></PageWrapper>;

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader
        title={lead.company_name || "Lead"}
        subtitle={lead.contact_name + " · " + lead.email}
        badge="LEAD"
        actions={
          <div className="flex gap-2">
            <Link href="/leads" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-4 h-4"/> Back
            </Link>
            <Link href={"/leads/" + id + "/edit"} className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700">
              <Edit className="w-4 h-4"/> Edit
            </Link>
          </div>
        }/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600"/> Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Status",       <span className={"text-xs font-bold px-2.5 py-1 rounded-full "+getStateColor(lead.status)}>{lead.status}</span>],
                ["Source",       lead.source || "—"],
                ["Email",        lead.email || "—"],
                ["Phone",        lead.phone || "—"],
                ["Created",      fmtDate(lead.created_at)],
                ["Updated",      fmtDate(lead.updated_at)],
              ].map(([label, value]: any) => (
                <div key={String(label)} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <div className="text-sm font-medium text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {lead.notes && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Notes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600"/> Timeline
            </h3>
            {timelineItems.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {timelineItems.slice(0,8).map((event: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"/>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{event.title || event.action || "Activity"}</p>
                      <p className="text-[10px] text-slate-400">{fmtDate(event.created_at || event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <h3 className="font-semibold text-amber-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Qualify Lead",   href: "#" },
                { label: "Create Quote",   href: "/quotes/new" },
                { label: "Add Note",       href: "#" },
              ].map(action => (
                <Link key={action.label} href={action.href}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-700 hover:bg-amber-100 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4"/> {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
