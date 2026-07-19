"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { projectsEnterpriseApi } from "@/lib/projects-enterprise-api";

export default function ProjectSectionPage() {
  const params = useParams();
  const section = String(params.section || "");

  const [items, setItems] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft",
    project_code: "",
    parent_project_id: "",
    phase_key: "",
    milestone_date: "",
    start_date: "",
    end_date: "",
    due_date: "",
    owner: "",
    assigned_to: "",
    resource_type: "",
    category: "",
    risk_level: "",
    issue_type: "",
    progress_percent: "",
    budget_amount: "",
    forecast_amount: "",
    actual_amount: "",
    currency: "EGP",
    document_url: "",
    contract_id: "",
    site_id: "",
    notes: "",
    tags: "",
  });

  async function load() {
    setError("");
    try {
      const data = await projectsEnterpriseApi.list(section, {
        status: status || undefined,
        search: search || undefined,
      });
      setItems(Array.isArray(data?.items) ? data.items : []);
      setCount(Number(data?.count || 0));
    } catch (e: any) {
      setError(String(e?.message || e));
      setItems([]);
      setCount(0);
    }
  }

  useEffect(() => {
    load();
  }, [section]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await projectsEnterpriseApi.create(section, {
        title: form.title,
        description: form.description || null,
        status: form.status || null,
        project_code: form.project_code || null,
        parent_project_id: form.parent_project_id || null,
        phase_key: form.phase_key || null,
        milestone_date: form.milestone_date || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        due_date: form.due_date || null,
        owner: form.owner || null,
        assigned_to: form.assigned_to || null,
        resource_type: form.resource_type || null,
        category: form.category || null,
        risk_level: form.risk_level || null,
        issue_type: form.issue_type || null,
        progress_percent: form.progress_percent ? Number(form.progress_percent) : null,
        budget_amount: form.budget_amount ? Number(form.budget_amount) : null,
        forecast_amount: form.forecast_amount ? Number(form.forecast_amount) : null,
        actual_amount: form.actual_amount ? Number(form.actual_amount) : null,
        currency: form.currency || null,
        document_url: form.document_url || null,
        contract_id: form.contract_id || null,
        site_id: form.site_id || null,
        notes: form.notes || null,
        tags: form.tags || null,
      });

      setForm({
        title: "",
        description: "",
        status: "draft",
        project_code: "",
        parent_project_id: "",
        phase_key: "",
        milestone_date: "",
        start_date: "",
        end_date: "",
        due_date: "",
        owner: "",
        assigned_to: "",
        resource_type: "",
        category: "",
        risk_level: "",
        issue_type: "",
        progress_percent: "",
        budget_amount: "",
        forecast_amount: "",
        actual_amount: "",
        currency: "EGP",
        document_url: "",
        contract_id: "",
        site_id: "",
        notes: "",
        tags: "",
      });

      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  const sectionTitle = useMemo(() => section.replace(/-/g, " "), [section]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Project Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {sectionTitle}
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Manage project records in the {sectionTitle} section.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Records
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {count}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Section
          </div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            {sectionTitle}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Sprint
          </div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Projects Foundation
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Mode
          </div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Unified
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="open">Open</option>
              <option value="planned">Planned</option>
              <option value="published">Published</option>
            </select>
            <button
              onClick={load}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            >
              Refresh
            </button>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                No project records yet.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-950">
                        {item.title || "Untitled Record"}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {item.project_code || item.phase_key || "No code"}
                      </div>
                    </div>

                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                      {item.status || "draft"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Owner:</span>{" "}
                      {item.owner || "—"}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Progress:</span>{" "}
                      {item.progress_percent ?? "—"}
                    </div>
                  </div>

                  <div className="mt-3 text-sm leading-6 text-slate-700">
                    {item.description || item.notes || "No details."}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Create Record</h2>

          <form onSubmit={onCreate} className="mt-5 space-y-4">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.project_code}
                onChange={(e) => setForm({ ...form, project_code: e.target.value })}
                placeholder="Project code"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.phase_key}
                onChange={(e) => setForm({ ...form, phase_key: e.target.value })}
                placeholder="Phase key"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                placeholder="Start date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                placeholder="End date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.milestone_date}
                onChange={(e) => setForm({ ...form, milestone_date: e.target.value })}
                placeholder="Milestone date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                placeholder="Due date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.progress_percent}
                onChange={(e) => setForm({ ...form, progress_percent: e.target.value })}
                placeholder="Progress %"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="Owner"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                placeholder="Assigned to"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.resource_type}
                onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
                placeholder="Resource type"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Category"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.risk_level}
                onChange={(e) => setForm({ ...form, risk_level: e.target.value })}
                placeholder="Risk level"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.issue_type}
                onChange={(e) => setForm({ ...form, issue_type: e.target.value })}
                placeholder="Issue type"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.budget_amount}
                onChange={(e) => setForm({ ...form, budget_amount: e.target.value })}
                placeholder="Budget amount"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.forecast_amount}
                onChange={(e) => setForm({ ...form, forecast_amount: e.target.value })}
                placeholder="Forecast amount"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.actual_amount}
                onChange={(e) => setForm({ ...form, actual_amount: e.target.value })}
                placeholder="Actual amount"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <input
              value={form.document_url}
              onChange={(e) => setForm({ ...form, document_url: e.target.value })}
              placeholder="Document URL"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            >
              Create Project Record
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
