"use client";

import { useEffect, useState } from "react";
import { projectsReviewApi } from "../../../../../lib/projects-review-api";

export default function ProjectsActionsPage() {
  const [data, setData] = useState<any>(null);
  const [detailMap, setDetailMap] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const review = await projectsReviewApi.reviewSummary();
      setData(review);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setDetail(id: string, value: string) {
    setDetailMap((prev) => ({ ...prev, [id]: value }));
  }

  async function review(kind: string, id: string) {
    try {
      if (kind === "task") await projectsReviewApi.reviewTask(id, detailMap[id] || "Task reviewed");
      if (kind === "risk") await projectsReviewApi.reviewRisk(id, detailMap[id] || "Risk reviewed");
      if (kind === "issue") await projectsReviewApi.reviewIssue(id, detailMap[id] || "Issue reviewed");
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  const queues = data?.queues || {};

  const groups = [
    { title: "Tasks", kind: "task", items: queues["tasks"] || [] },
    { title: "Risks", kind: "risk", items: queues["risks"] || [] },
    { title: "Issues", kind: "issue", items: queues["issues"] || [] },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Project Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Project Actions
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Review and process task, risk, and issue actions from one project action workspace.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-3">
        {groups.map((group) => (
          <div key={group.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">{group.title}</h2>

            <div className="mt-5 space-y-4">
              {group.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                  No records in this queue.
                </div>
              ) : (
                group.items.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-base font-semibold text-slate-950">{item.title || item.id}</div>
                    <div className="mt-2 text-sm text-slate-600">{item.status || "open"}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-700">{item.description || item.notes || "No details."}</div>

                    <textarea
                      value={detailMap[item.id] || ""}
                      onChange={(e) => setDetail(item.id, e.target.value)}
                      placeholder="Review detail"
                      rows={3}
                      className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                    />

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => review(group.kind, item.id)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
