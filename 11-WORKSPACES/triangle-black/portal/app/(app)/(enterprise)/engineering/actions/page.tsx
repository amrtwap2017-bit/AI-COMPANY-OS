"use client";

import { useEffect, useState } from "react";
import { engineeringActionsApi } from "../../../../../lib/engineering-actions-api";

export default function EngineeringActionsPage() {
  const [data, setData] = useState<any>(null);
  const [detailMap, setDetailMap] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const summary = await engineeringActionsApi.reviewSummary();
      setData(summary);
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

  async function completeVisit(id: string) {
    try {
      await engineeringActionsApi.completeSiteVisit(id, detailMap[id] || "Site visit completed");
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  async function logIssue(id: string) {
    try {
      await engineeringActionsApi.logInspectionIssue(id, detailMap[id] || "Inspection issue logged");
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  async function qualityFollowup(id: string) {
    try {
      await engineeringActionsApi.qualityFollowup(id, detailMap[id] || "Quality follow-up required");
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  async function safetyFollowup(id: string) {
    try {
      await engineeringActionsApi.safetyFollowup(id, detailMap[id] || "Safety follow-up required");
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  const queues = data?.queues || {};
  const attention = data?.attention || {};
  const counts = data?.counts || {};

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Engineering Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Engineering Review Actions
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Use this workspace to drive site visit completion, inspection issue logging, quality follow-up, and safety follow-up.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Site Visits</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{counts.site_visits ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Open Inspections</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.open_inspections ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Open Quality</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.open_quality ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Open Safety</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{attention.open_safety ?? 0}</div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Site Visits + Inspections</h2>
          <div className="mt-5 space-y-4">
            {[(queues.site_visits || []), (queues.inspections || [])].flat().map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-base font-semibold text-slate-950">{item.title || item.id}</div>
                <div className="mt-1 text-sm text-slate-500">{item.status || "open"}</div>
                <div className="mt-2 text-sm leading-6 text-slate-700">{item.description || "No description."}</div>

                <textarea
                  value={detailMap[item.id] || ""}
                  onChange={(e) => setDetail(item.id, e.target.value)}
                  placeholder="Action detail"
                  rows={3}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />

                <div className="mt-4 flex gap-2">
                  {"visit_date" in item ? (
                    <button
                      onClick={() => completeVisit(item.id)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Complete Visit
                    </button>
                  ) : (
                    <button
                      onClick={() => logIssue(item.id)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Log Issue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Quality + Safety Follow-up</h2>
          <div className="mt-5 space-y-4">
            {[(queues.quality || []), (queues.safety || [])].flat().map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-base font-semibold text-slate-950">{item.title || item.id}</div>
                <div className="mt-1 text-sm text-slate-500">{item.status || "open"}</div>
                <div className="mt-2 text-sm leading-6 text-slate-700">{item.description || "No description."}</div>

                <textarea
                  value={detailMap[item.id] || ""}
                  onChange={(e) => setDetail(item.id, e.target.value)}
                  placeholder="Follow-up detail"
                  rows={3}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                />

                <div className="mt-4 flex gap-2">
                  {"risk_level" in item ? (
                    <button
                      onClick={() => safetyFollowup(item.id)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Safety Follow-up
                    </button>
                  ) : (
                    <button
                      onClick={() => qualityFollowup(item.id)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Quality Follow-up
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
