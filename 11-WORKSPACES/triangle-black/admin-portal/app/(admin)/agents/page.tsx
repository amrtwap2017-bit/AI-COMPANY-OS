"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { agentsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { UserPlus, Mail, Phone, CheckCircle, XCircle } from "lucide-react";

interface Agent {
  id: string; name: string; email: string; phone?: string;
  max_leads: number; current_leads: number; is_active: boolean; created_at: string;
}

export default function AgentsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", max_leads: 10 });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: () => agentsApi.list().then((r) => r.data as Agent[]),
    refetchInterval: 15000,
  });

  const totalCapacity = agents.reduce((s, a) => s + a.max_leads, 0);
  const totalUsed = agents.reduce((s, a) => s + a.current_leads, 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) { setError("Name and email required"); return; }
    setCreating(true); setError("");
    try {
      await agentsApi.create({
        name: form.name, email: form.email,
        phone: form.phone || undefined,
        max_leads: form.max_leads,
      });
      qc.invalidateQueries({ queryKey: ["admin-agents"] });
      setShowCreate(false);
      setForm({ name: "", email: "", phone: "", max_leads: 10 });
    } catch { setError("Failed to create agent."); }
    finally { setCreating(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500">{agents.length} agents · {totalUsed}/{totalCapacity} capacity used</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-lg
            text-sm font-medium hover:bg-[#6D28D9] transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
        >
          <UserPlus className="w-4 h-4" /> New Agent
        </button>
      </div>

      {/* Team capacity bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Team Capacity</span>
          <span className="text-gray-500">{totalUsed}/{totalCapacity} leads assigned</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3"
          role="progressbar" aria-valuenow={totalUsed} aria-valuemax={totalCapacity}
          aria-label={`Team capacity: ${totalUsed} of ${totalCapacity}`}>
          <div className="h-3 rounded-full bg-[#7C3AED] transition-all"
            style={{ width: `${totalCapacity ? Math.round((totalUsed / totalCapacity) * 100) : 0}%` }} />
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-purple-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Add New Agent</h2>
          {error && <div role="alert" className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">⚠ {error}</div>}
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            {[
              { id: "aname", label: "Full Name", field: "name", type: "text", required: true },
              { id: "aemail", label: "Email", field: "email", type: "email", required: true },
              { id: "aphone", label: "Phone", field: "phone", type: "tel", required: false },
            ].map(({ id, label, field, type, required }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input id={id} type={type} required={required}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
            ))}
            <div>
              <label htmlFor="amax" className="block text-sm font-medium text-gray-700 mb-1">Max Leads</label>
              <input id="amax" type="number" min={1} max={50}
                value={form.max_leads}
                onChange={(e) => setForm((f) => ({ ...f, max_leads: Number(e.target.value) }))}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={creating}
                className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium
                  hover:bg-[#6D28D9] disabled:opacity-50">
                {creating ? "Creating..." : "Add Agent"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div role="status" className="text-center py-12 text-gray-400">Loading agents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const pct = agent.max_leads ? Math.round((agent.current_leads / agent.max_leads) * 100) : 0;
            const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-green-500";
            return (
              <div key={agent.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center
                      justify-center text-[#7C3AED] font-bold text-lg">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${agent.is_active ? "text-green-700 bg-green-100" : "text-gray-500 bg-gray-100"}`}>
                        {agent.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#7C3AED]">{agent.current_leads}</p>
                    <p className="text-xs text-gray-400">/ {agent.max_leads}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-100 rounded-full h-2"
                    role="progressbar" aria-valuenow={agent.current_leads}
                    aria-valuemax={agent.max_leads}
                    aria-label={`${agent.name}: ${pct}% capacity`}>
                    <div className={`h-2 rounded-full ${barColor}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {pct}% · {agent.max_leads - agent.current_leads} available
                  </p>
                </div>

                <div className="space-y-1.5 text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {agent.email}
                  </p>
                  {agent.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {agent.phone}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
