"use client";
// @ts-nocheck
import { PageHeader, PageWrapper, SectionCard } from "@/components/ui";

export default function Page() {
  return (
    <PageWrapper>
      <PageHeader
        title="Project Actions"
        subtitle="Task and risk action workspace"
        badge="ACT"
      />
      <SectionCard title="Quick Navigation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href="/projects-center"
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all group">
          <span className="text-sm font-semibold text-slate-900 group-hover:text-amber-700">Projects</span>
          <span className="text-slate-300 group-hover:text-amber-500 text-lg">›</span>
        </a>
        <a href="/projects-center/review"
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all group">
          <span className="text-sm font-semibold text-slate-900 group-hover:text-amber-700">Review</span>
          <span className="text-slate-300 group-hover:text-amber-500 text-lg">›</span>
        </a>
        </div>
      </SectionCard>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏗️</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Project Actions</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">Task and risk action workspace. This section is being built and will show live data soon.</p>
      </div>
    </PageWrapper>
  );
}
