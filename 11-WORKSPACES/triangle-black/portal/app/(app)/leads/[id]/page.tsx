"use client";
// @ts-nocheck
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PageHeader, PageWrapper, SectionCard, LoadingState,
  AlertBanner, StatusBadge, Avatar,
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { leadsApi } from "@/lib/api/leads";
import { fmtDate, fmtDateShort, timeAgo } from "@/lib/design-tokens";
import { toast } from "@/lib/toast";
import {
  ArrowLeft, Zap, UserCheck, FileText, Building2,
  Mail, Phone, Clock, CheckCircle2, MessageSquare, Edit,
} from "lucide-react";

const STAGE_ORDER = ["new", "qualified", "negotiation", "won", "lost"];

const ACTIVITY_ICONS: Record<string, string> = {
  qualification:   "🎯",
  assignment:      "👤",
  quote_generated: "📄",
  quote_submitted: "📤",
  quote_sent:      "✉️",
  quote_approved:  "✅",
  quote_rejected:  "❌",
  note:            "💬",
  default:         "📋",
};

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const router   = useRouter();
  const qc       = useQueryClient();
  const [acting, setActing]   = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote]         = useState("");

  const { data: lead, isLoading, isError, error } = useQuery({
    queryKey: ["lead", id],
    queryFn:  () => leadsApi.get(id).then(r => r.data),
    staleTime: 30_000,
  });

  const { data: timelineData } = useQuery({
    queryKey: ["lead-timeline", id],
    queryFn:  () => leadsApi.timeline(id).then(r => r.data),
    staleTime: 30_000,
  });

  const timeline = timelineData?.timeline || timelineData || [];

  async function doAction(action: string, fn: () => Promise<any>) {
    setActing(action);
    try {
      await fn();
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["lead-timeline", id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success(action + " successful");
    } catch (e: any) {
      toast.error(e.message || action + " failed");
    } finally {
      setActing(null);
    }
  }

  async function addNote() {
    if (!note.trim()) return;
    await doAction("Note added", () => leadsApi.addNote(id, note));
    setNote("");
    setNoteOpen(false);
  }

  if (isLoading) return <PageWrapper><LoadingState type="detail" /></PageWrapper>;
  if (isError || !lead) return (
    <PageWrapper>
      <AlertBanner type="error" title={error instanceof Error ? error.message : "Lead not found"} />
    </PageWrapper>
  );

  const currentStage = STAGE_ORDER.indexOf(lead.status);

  return (
    <PageWrapper>
      <PageHeader
        title={lead.company_name || lead.company || lead.name || "Lead"}
        subtitle={lead.contact_name || lead.email || ""}
        badge="LEAD"
        back={
          <Link href="/leads"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href={"/leads/" + id + "/edit"}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Edit className="w-4 h-4" /> Edit
            </Link>
            <StatusBadge status={lead.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          <SectionCard title="Pipeline Stage">
            <div className="flex items-center gap-0">
              {STAGE_ORDER.map((stage, i) => {
                const done    = i < currentStage;
                const current = i === currentStage;
                const future  = i > currentStage;
                return (
                  <div key={stage} className="flex items-center flex-1">
                    <div className={"flex flex-col items-center " + (i < STAGE_ORDER.length - 1 ? "flex-1" : "")}>
                      <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold " +
                        (done    ? "bg-emerald-500 text-white" :
                         current ? "bg-amber-600 text-white ring-2 ring-amber-300" :
                                   "bg-slate-200 text-slate-400")}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className={"text-[10px] font-medium mt-1 capitalize " +
                        (current ? "text-amber-700" : done ? "text-emerald-600" : "text-slate-400")}>
                        {stage}
                      </span>
                    </div>
                    {i < STAGE_ORDER.length - 1 && (
                      <div className={"h-0.5 flex-1 mx-1 " + (done ? "bg-emerald-300" : "bg-slate-200")} />
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Contact Information">
            <div className="flex items-start gap-4 mb-4">
              <Avatar name={lead.company_name || lead.company || lead.name} size="lg" />
              <div>
                <h3 className="font-bold text-slate-900">{lead.company_name || lead.company}</h3>
                <p className="text-sm text-slate-500">{lead.contact_name}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { icon: Mail,     label: "Email",    value: lead.email },
                { icon: Phone,    label: "Phone",    value: lead.phone },
                { icon: Building2,label: "Company",  value: lead.company_name || lead.company },
              ].filter(f => f.value).map(field => (
                <div key={field.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <field.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-500 w-16">{field.label}</span>
                  <span className="text-sm text-slate-900 font-medium">{field.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {timeline.length > 0 && (
            <SectionCard title="Activity Timeline" subtitle={timeline.length + " events"}>
              <div className="space-y-3">
                {timeline.slice(0, 10).map((event: any, i: number) => (
                  <div key={event.id || i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm flex-shrink-0">
                      {ACTIVITY_ICONS[event.activity_type] || ACTIVITY_ICONS.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">{event.description || event.activity_type}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{timeAgo(event.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

        </div>

        <div className="space-y-4">
          <SectionCard title="Details">
            <div className="space-y-2">
              {[
                { label: "Status",   value: <StatusBadge status={lead.status} /> },
                { label: "Source",   value: lead.source || "—" },
                { label: "Score",    value: lead.score ? lead.score + "/100" : "—" },
                { label: "Priority", value: lead.priority || "—" },
                { label: "Created",  value: fmtDate(lead.created_at) },
                { label: "Updated",  value: timeAgo(lead.updated_at) },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-xs font-medium text-slate-900">
                    {typeof item.value === "string" ? item.value : item.value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Actions">
            <div className="space-y-2">
              {lead.status === "new" && (
                <Button
                  variant="primary"
                  className="w-full justify-start"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  loading={acting === "Qualify"}
                  onClick={() => doAction("Qualify", () => leadsApi.qualify(id))}
                >
                  Qualify Lead
                </Button>
              )}
              <Button
                variant="secondary"
                className="w-full justify-start"
                icon={<FileText className="w-4 h-4" />}
                loading={acting === "Quote"}
                onClick={() => doAction("Quote created", () => leadsApi.createFromLead(id))}
              >
                Generate Quote
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                icon={<MessageSquare className="w-4 h-4" />}
                onClick={() => setNoteOpen(true)}
              >
                Add Note
              </Button>
            </div>
          </SectionCard>

          {lead.notes && (
            <SectionCard title="Notes">
              <p className="text-sm text-slate-600 leading-relaxed">{lead.notes}</p>
            </SectionCard>
          )}
        </div>
      </div>

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add Note"
        description="Add a note to this lead's activity timeline"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={addNote} loading={acting === "Note added"}>Save Note</Button>
          </div>
        }
      >
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Enter your note about this lead..."
          rows={4}
          className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 resize-none"
          autoFocus
        />
      </Modal>
    </PageWrapper>
  );
}
