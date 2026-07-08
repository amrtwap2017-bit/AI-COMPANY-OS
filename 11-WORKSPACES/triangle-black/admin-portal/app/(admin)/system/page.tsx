"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { webhooksApi } from "@/lib/api";
import {
  Settings, Webhook, Plus, Trash2,
  CheckCircle, XCircle, Server, Database,
} from "lucide-react";

interface WebhookConfig {
  id: string; name: string; url: string;
  events: string[]; is_active: boolean; created_at: string;
}

export default function SystemPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", events: "lead.created,quote.sent" });
  const [creating, setCreating] = useState(false);

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["admin-webhooks"],
    queryFn: () => webhooksApi.list().then((r) => r.data as WebhookConfig[]),
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await webhooksApi.create({
        name: form.name,
        url: form.url,
        events: form.events.split(",").map((s) => s.trim()),
        is_active: true,
      });
      qc.invalidateQueries({ queryKey: ["admin-webhooks"] });
      setShowCreate(false);
      setForm({ name: "", url: "", events: "lead.created,quote.sent" });
    } catch { alert("Failed to create webhook."); }
    finally { setCreating(false); }
  }

  async function deleteWebhook(id: string) {
    if (!confirm("Delete this webhook?")) return;
    try {
      await webhooksApi.delete(id);
      qc.invalidateQueries({ queryKey: ["admin-webhooks"] });
    } catch { alert("Failed to delete webhook."); }
  }

  const services = [
    { name: "Triangle Black API", port: 8020, status: true, desc: "Core backend API" },
    { name: "Ops Portal", port: 3200, status: true, desc: "Operations team portal" },
    { name: "Client Portal", port: 3201, status: true, desc: "Hotel client portal" },
    { name: "Admin Portal", port: 3202, status: true, desc: "System administration" },
    { name: "PostgreSQL", port: 5432, status: true, desc: "Primary database" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-[#7C3AED]" />
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      </div>

      {/* Service Status */}
      <section aria-label="Service status">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-[#7C3AED]" /> Service Status
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm" aria-label="Services table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Service","Port","Status","Description"].map((h) => (
                  <th key={h} scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((s) => (
                <tr key={s.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">:{s.port}</td>
                  <td className="px-4 py-3">
                    {s.status
                      ? <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Running
                        </span>
                      : <span className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Down
                        </span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Webhooks */}
      <section aria-label="Webhook configuration">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Webhook className="w-5 h-5 text-[#7C3AED]" /> Webhook Configuration
          </h2>
          <button onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-lg
              text-sm font-medium hover:bg-[#6D28D9] transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
          >
            <Plus className="w-4 h-4" /> Add Webhook
          </button>
        </div>

        {showCreate && (
          <div className="bg-white rounded-xl border border-purple-200 p-6 shadow-sm mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">New Webhook</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="wname" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input id="wname" required value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="External CRM"
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label htmlFor="wurl" className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input id="wurl" type="url" required value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://crm.example.com/webhook"
                    className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="wevents" className="block text-sm font-medium text-gray-700 mb-1">
                  Events (comma-separated)
                </label>
                <input id="wevents" value={form.events}
                  onChange={(e) => setForm((f) => ({ ...f, events: e.target.value }))}
                  placeholder="lead.created,quote.sent,contract.activated"
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Available: lead.created, lead.qualified, lead.converted, quote.sent, quote.approved, contract.activated
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium
                    hover:bg-[#6D28D9] disabled:opacity-50">
                  {creating ? "Creating..." : "Create Webhook"}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div role="status" className="text-center py-8 text-gray-400">Loading webhooks...</div>
        ) : webhooks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <Webhook className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No webhooks configured</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm" aria-label="Webhooks table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Name","URL","Events","Status","Action"].map((h) => (
                    <th key={h} scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{wh.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-xs truncate">{wh.url}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(wh.events || []).map((ev) => (
                          <span key={ev} className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {wh.is_active
                        ? <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        : <span className="text-gray-400 text-xs flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteWebhook(wh.id)}
                        aria-label={`Delete webhook ${wh.name}`}
                        className="text-gray-400 hover:text-red-500 transition-colors
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Platform Info */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#7C3AED]" /> Platform Information
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            {[
              ["Platform", "Triangle Black v1.1.0"],
              ["Backend", "FastAPI + PostgreSQL"],
              ["Frontend", "Next.js 16 + TypeScript"],
              ["Auth", "JWT + bcrypt"],
              ["Database", "PostgreSQL 17 (Docker)"],
              ["AI Hub", "qwen2.5-coder:7b + deepseek-r1:8b"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-gray-500 mb-1">{label}</dt>
                <dd className="font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
