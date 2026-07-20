// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { projectsEnterpriseApi } from "@/lib/projects-enterprise-api";
import { PageHeader, Button, SectionCard, StatusPill, LoadingState, EmptyState } from "@/components/ui";
import { fmtDate, fmtCurrency, getStatus } from "@/lib/design-tokens";
import { ArrowLeft, HardHat, Building2, FileText, DollarSign, CheckCircle, AlertTriangle, Calendar } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["project-detail", id],
    queryFn: async () => {
      if (projectsEnterpriseApi?.get) return projectsEnterpriseApi.get(id as string);
      return { data: { 
        id, name: "Grand Cairo Hotel - Lobby Renovation", client: "Grand Cairo Hotel", type: "Fit-out", 
        budget: 450000, spent: 210000, invoiced: 180000, collected: 150000,
        progress: 65, status: "in_progress", start_date: "2026-05-01", end_date: "2026-09-30",
        project_manager: "Amr (You)", site_engineer: "Mohamed Ali"
      }};
    },
    enabled: !!id,
  });

  const p = data?.data;
  const statusStyle = p ? getStatus(p.status) : getStatus("draft");
  const profitMargin = p ? Math.round(((p.budget - p.spent) / p.budget) * 100) : 0;

  if (isLoading) return <LoadingState type="detail" />;
  if (error || !p) return <EmptyState icon="️" title="Project not found" />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader title={p.name} subtitle={`${p.type} · Client: ${p.client}`} badge={undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={() => router.back()}>Back</Button>
            <Button variant="secondary" size="sm" icon={<FileText className="w-3.5 h-3.5" />}>Variation Order</Button>
            <Button variant="primary" size="sm" icon={<DollarSign className="w-3.5 h-3.5" />}>Submit Invoice</Button>
          </div>
        } />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SectionCard title="Contract Value">
          <div className="text-2xl font-bold text-slate-900">{fmtCurrency(p.budget)}</div>
          <div className="text-xs text-slate-500 mt-1">Original BOQ Value</div>
        </SectionCard>
        <SectionCard title="Cost Incurred (Actual)">
          <div className="text-2xl font-bold text-amber-600">{fmtCurrency(p.spent)}</div>
          <div className="text-xs text-slate-500 mt-1">{Math.round((p.spent/p.budget)*100)}% of Budget Used</div>
        </SectionCard>
        <SectionCard title="Invoiced / Collected">
          <div className="text-2xl font-bold text-emerald-600">{fmtCurrency(p.invoiced)}</div>
          <div className="text-xs text-slate-500 mt-1">{fmtCurrency(p.collected)} Collected</div>
        </SectionCard>
        <SectionCard title="Est. Gross Margin">
          <div className={`text-2xl font-bold ${profitMargin > 20 ? 'text-emerald-600' : 'text-amber-600'}`}>{profitMargin}%</div>
          <div className="text-xs text-slate-500 mt-1">Based on current spend</div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Bill of Quantities (BOQ) Summary">
            <div className="space-y-3">
              {[
                { item: "Demolition & Site Prep", budget: 45000, spent: 42000, status: "completed" },
                { item: "MEP Rough-in (HVAC & Plumbing)", budget: 120000, spent: 95000, status: "in_progress" },
                { item: "Architectural Finishes (Marble & Wood)", budget: 180000, spent: 60000, status: "in_progress" },
                { item: "FF&E Installation", budget: 105000, spent: 13000, status: "pending" }
              ].map((boq, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">{boq.item}</span>
                      <span className="text-xs font-semibold text-slate-600">{fmtCurrency(boq.budget)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(boq.spent/boq.budget)*100}%` }}></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right w-24">
                    <div className="text-xs text-slate-500">Spent</div>
                    <div className="text-sm font-semibold text-slate-900">{fmtCurrency(boq.spent)}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Pending Client Approvals">
            <div className="space-y-3">
              {[
                { title: "Material Approval: Italian Marble Sample", date: "2026-07-14", type: "Material" },
                { title: "Variation Order #002: Additional Lighting Points", date: "2026-07-12", type: "Variation" }
              ].map((app, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{app.title}</div>
                      <div className="text-xs text-slate-500">{app.type} · Submitted {fmtDate(app.date)}</div>
                    </div>
                  </div>
                  <Button variant="secondary" size="xs">Follow Up</Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Project Team">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">AM</div>
                <div><div className="text-sm font-medium text-slate-900">{p.project_manager}</div><div className="text-xs text-slate-500">Project Manager</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">MA</div>
                <div><div className="text-sm font-medium text-slate-900">{p.site_engineer}</div><div className="text-xs text-slate-500">Site Engineer</div></div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Key Milestones">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <div className="flex-1"><div className="text-sm text-slate-900">Site Handover</div><div className="text-xs text-slate-500">{fmtDate(p.start_date)}</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-amber-500"></div>
                <div className="flex-1"><div className="text-sm text-slate-900">MEP Completion</div><div className="text-xs text-amber-600 font-medium">Due Aug 15, 2026</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                <div className="flex-1"><div className="text-sm text-slate-900">Final Snagging</div><div className="text-xs text-slate-500">{fmtDate(p.end_date)}</div></div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
