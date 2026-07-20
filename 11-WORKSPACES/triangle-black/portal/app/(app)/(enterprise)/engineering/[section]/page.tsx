// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { engineeringApi } from "../../../../../lib/engineering-api";

export default function EngineeringSectionPage() {
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
    discipline: "",
    category: "",
    reference_code: "",
    revision: "",
    document_url: "",
    project_id: "",
    contract_id: "",
    site_id: "",
    asset_id: "",
    owner: "",
    notes: "",
    tags: "",
    visit_date: "",
    inspection_date: "",
    result: "",
    priority: "",
    risk_level: "",
  });

  async function load() {
    setError("");
    try {
      const data = await engineeringApi.list(section, {
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
      await engineeringApi.create(section, {
        title: form.title,
        description: form.description || null,
        status: form.status || null,
        discipline: form.discipline || null,
        category: form.category || null,
        reference_code: form.reference_code || null,
        revision: form.revision || null,
        document_url: form.document_url || null,
        project_id: form.project_id || null,
        contract_id: form.contract_id || null,
        site_id: form.site_id || null,
        asset_id: form.asset_id || null,
        owner: form.owner || null,
        notes: form.notes || null,
        tags: form.tags || null,
        visit_date: form.visit_date || null,
        inspection_date: form.inspection_date || null,
        result: form.result || null,
        priority: form.priority || null,
        risk_level: form.risk_level || null,
      });

      setForm({
        title: "",
        description: "",
        status: "draft",
        discipline: "",
        category: "",
        reference_code: "",
        revision: "",
        document_url: "",
        project_id: "",
        contract_id: "",
        site_id: "",
        asset_id: "",
        owner: "",
        notes: "",
        tags: "",
        visit_date: "",
        inspection_date: "",
        result: "",
        priority: "",
        risk_level: "",
      });

      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  const sectionTitle = useMemo(() => section.replace(/-/g, " "), [section]);

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Engineering Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {sectionTitle}
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Manage engineering records in the {sectionTitle} section.
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
            Engineering Foundation
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
                No engineering records yet.
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
                        {item.reference_code || "No reference code"}
                      </div>
                    </div>

                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                      {item.status || "draft"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Discipline:</span>{" "}
                      {item.discipline || "—"}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Category:</span>{" "}
                      {item.category || "—"}
                    </div>
                  </div>

                  <div className="mt-3 text-sm leading-6 text-slate-700">
                    {item.description || "No description."}
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
                value={form.discipline}
                onChange={(e) => setForm({ ...form, discipline: e.target.value })}
                placeholder="Discipline"
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
                value={form.reference_code}
                onChange={(e) => setForm({ ...form, reference_code: e.target.value })}
                placeholder="Reference code"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.revision}
                onChange={(e) => setForm({ ...form, revision: e.target.value })}
                placeholder="Revision"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <input
              value={form.document_url}
              onChange={(e) => setForm({ ...form, document_url: e.target.value })}
              placeholder="Document URL"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                placeholder="Project ID"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.contract_id}
                onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
                placeholder="Contract ID"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.site_id}
                onChange={(e) => setForm({ ...form, site_id: e.target.value })}
                placeholder="Site ID"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.asset_id}
                onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
                placeholder="Asset ID"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <input
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              placeholder="Owner"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes"
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Tags"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={form.visit_date}
                onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
                placeholder="Visit date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.inspection_date}
                onChange={(e) => setForm({ ...form, inspection_date: e.target.value })}
                placeholder="Inspection date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
                placeholder="Result"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                placeholder="Priority"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.risk_level}
                onChange={(e) => setForm({ ...form, risk_level: e.target.value })}
                placeholder="Risk level"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            >
              Create Engineering Record
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
