// @ts-nocheck

"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { maintenanceApi } from "../../../../../lib/maintenance-api";

export default function MaintenanceSectionPage() {
  const params = useParams();
  const section = String(params.section || "");

  const [items, setItems] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    parent_id: "",
    node_type: "equipment",
    title: "",
    asset_code: "",
    site_id: "",
    contract_id: "",
    supplier_id: "",
    status: "active",
    manufacturer: "",
    model: "",
    serial_number: "",
    warranty_expiry: "",
    plan_type: "preventive",
    frequency: "",
    next_due_date: "",
    owner: "",
    work_type: "corrective",
    priority: "",
    scheduled_date: "",
    due_date: "",
    assigned_technician_id: "",
    summary: "",
    schedule_date: "",
    related_plan_id: "",
    warranty_number: "",
    start_date: "",
    end_date: "",
    part_number: "",
    unit_cost: "",
    quantity_on_hand: "",
    history_type: "",
    event_date: "",
    result: "",
    downtime_hours: "",
    cause: "",
    cost_type: "",
    amount: "",
    currency: "EGP",
    notes: "",
  });

  async function load() {
    setError("");
    try {
      const data = await maintenanceApi.list(section, {
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
      await maintenanceApi.create(section, {
        parent_id: form.parent_id || null,
        node_type: form.node_type || null,
        title: form.title,
        asset_code: form.asset_code || null,
        site_id: form.site_id || null,
        contract_id: form.contract_id || null,
        supplier_id: form.supplier_id || null,
        status: form.status || null,
        manufacturer: form.manufacturer || null,
        model: form.model || null,
        serial_number: form.serial_number || null,
        warranty_expiry: form.warranty_expiry || null,
        plan_type: form.plan_type || null,
        frequency: form.frequency || null,
        next_due_date: form.next_due_date || null,
        owner: form.owner || null,
        work_type: form.work_type || null,
        priority: form.priority || null,
        scheduled_date: form.scheduled_date || null,
        due_date: form.due_date || null,
        assigned_technician_id: form.assigned_technician_id || null,
        summary: form.summary || null,
        schedule_date: form.schedule_date || null,
        related_plan_id: form.related_plan_id || null,
        warranty_number: form.warranty_number || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        part_number: form.part_number || null,
        unit_cost: form.unit_cost ? Number(form.unit_cost) : null,
        quantity_on_hand: form.quantity_on_hand ? Number(form.quantity_on_hand) : null,
        history_type: form.history_type || null,
        event_date: form.event_date || null,
        result: form.result || null,
        downtime_hours: form.downtime_hours ? Number(form.downtime_hours) : null,
        cause: form.cause || null,
        cost_type: form.cost_type || null,
        amount: form.amount ? Number(form.amount) : null,
        currency: form.currency || null,
        notes: form.notes || null,
      });

      setForm({
        parent_id: "",
        node_type: "equipment",
        title: "",
        asset_code: "",
        site_id: "",
        contract_id: "",
        supplier_id: "",
        status: "active",
        manufacturer: "",
        model: "",
        serial_number: "",
        warranty_expiry: "",
        plan_type: "preventive",
        frequency: "",
        next_due_date: "",
        owner: "",
        work_type: "corrective",
        priority: "",
        scheduled_date: "",
        due_date: "",
        assigned_technician_id: "",
        summary: "",
        schedule_date: "",
        related_plan_id: "",
        warranty_number: "",
        start_date: "",
        end_date: "",
        part_number: "",
        unit_cost: "",
        quantity_on_hand: "",
        history_type: "",
        event_date: "",
        result: "",
        downtime_hours: "",
        cause: "",
        cost_type: "",
        amount: "",
        currency: "EGP",
        notes: "",
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
          Maintenance Center
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {sectionTitle}
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          Manage maintenance records in the {sectionTitle} section.
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
            Maintenance Foundation
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
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="planned">Planned</option>
              <option value="logged">Logged</option>
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
                No maintenance records yet.
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
                        {item.asset_code || item.part_number || item.warranty_number || item.node_type || "No code"}
                      </div>
                    </div>

                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                      {item.status || "active"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Type:</span>{" "}
                      {item.node_type || item.plan_type || item.work_type || item.cost_type || item.history_type || "—"}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Owner:</span>{" "}
                      {item.owner || "—"}
                    </div>
                  </div>

                  <div className="mt-3 text-sm leading-6 text-slate-700">
                    {item.notes || item.summary || item.cause || "No notes."}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.node_type}
                onChange={(e) => setForm({ ...form, node_type: e.target.value })}
                placeholder="Node type"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.asset_code}
                onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
                placeholder="Asset code"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.plan_type}
                onChange={(e) => setForm({ ...form, plan_type: e.target.value })}
                placeholder="Plan type"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                placeholder="Frequency"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.work_type}
                onChange={(e) => setForm({ ...form, work_type: e.target.value })}
                placeholder="Work type"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                placeholder="Priority"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.next_due_date}
                onChange={(e) => setForm({ ...form, next_due_date: e.target.value })}
                placeholder="Next due date"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.schedule_date}
                onChange={(e) => setForm({ ...form, schedule_date: e.target.value })}
                placeholder="Schedule date"
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
                value={form.downtime_hours}
                onChange={(e) => setForm({ ...form, downtime_hours: e.target.value })}
                placeholder="Downtime hours"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Amount"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
              <input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                placeholder="Currency"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />
            </div>

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
              Create Maintenance Record
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
