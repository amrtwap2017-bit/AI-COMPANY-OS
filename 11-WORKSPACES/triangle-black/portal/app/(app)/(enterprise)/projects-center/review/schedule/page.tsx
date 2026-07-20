// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { projectsReviewApi } from "../../../../../../lib/projects-review-api";

export default function ProjectsScheduleReviewPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const review = await projectsReviewApi.scheduleReview();
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
  const queues = data?.queues || {};

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Project Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Schedule Review
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Review schedule-oriented project pressure across milestones, phases, and tasks.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Milestones</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.milestones ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phases</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.phases ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tasks</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.tasks ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Open Tasks</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.open_tasks ?? 0}</div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Milestones</h2>
          <div className="mt-4 space-y-3">
            {(queues.milestones || []).map((x: any) => (
              <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                <div className="mt-2 text-sm text-slate-600">{x.milestone_date || "—"} • {x.status || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Phases</h2>
          <div className="mt-4 space-y-3">
            {(queues.phases || []).map((x: any) => (
              <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                <div className="mt-2 text-sm text-slate-600">{x.status || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Tasks</h2>
          <div className="mt-4 space-y-3">
            {(queues.tasks || []).map((x: any) => (
              <div key={x.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                <div className="mt-2 text-sm text-slate-600">{x.due_date || "—"} • {x.status || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
