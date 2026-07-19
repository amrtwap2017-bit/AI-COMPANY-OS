"use client";

import { useEffect, useState } from "react";
import { projectsReviewApi } from "../../../../../lib/projects-review-api";

export default function ProjectsReviewPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const review = await projectsReviewApi.reviewSummary();
        if (!active) return;
        setData(review);
      } catch (e: any) {
        if (!active) return;
        setError(String(e?.message || e));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const counts = data?.counts || {};
  const attention = data?.attention || {};

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Project Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Projects Review
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Review current project signals across tasks, milestones, risks, issues, budgets, and site reports.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Projects
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {counts.projects ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Tasks
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {counts.tasks ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Open Risks
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {attention.open_risks ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Open Issues
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {attention.open_issues ?? 0}
          </div>
        </div>
      </section>
    </div>
  );
}
