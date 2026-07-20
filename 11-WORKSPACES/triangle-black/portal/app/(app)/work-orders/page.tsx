// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { serviceOpsApi } from "@/lib/api";

const STATUS: Record<string,string> = {draft:"bg-gray-100 text-gray-600",scheduled:"bg-blue-100 text-blue-700",assigned:"bg-amber-100 text-amber-700",in_progress:"bg-indigo-100 text-indigo-700",completed:"bg-green-100 text-green-700",overdue:"bg-red-100 text-red-700",cancelled:"bg-slate-100 text-slate-500"};
const PRI:    Record<string,string> = {low:"bg-slate-100 text-slate-600",medium:"bg-blue-100 text-blue-600",high:"bg-amber-100 text-amber-700",critical:"bg-red-100 text-red-700"};

export default function WorkOrdersPage() {
  const [wos,    setWos]    = useState<any[]>([]);
  const [techs,  setTechs]  = useState<any[]>([]);
  const [loading,setLoading]= useState(true);
  const [showForm,setShowForm]= useState(false);
  const [form,   setForm]   = useState({ title:"", type:"preventive_maintenance", priority:"medium" });

  const safe = (d: any) => Array.isArray(d) ? d : d?.items ?? [];

  const load = () =>
    Promise.all([
      serviceOpsApi.workOrders.list(),
      serviceOpsApi.technicians.list(),
    ])
    .then(([w, t]) => { setWos(safe(w)); setTechs(safe(t)); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate   = async () => {
    await serviceOpsApi.workOrders.list();
    setShowForm(false);
    setForm({ title:"", type:"preventive_maintenance", priority:"medium" });
    load();
  };

  const handleAssign   = async (woId: string, techId: string) => {
    if (!techId) return;
    await serviceOpsApi.workOrders.assign(woId, techId);
    load();
  };

  const handleComplete = async (woId: string) => {
    await serviceOpsApi.workOrders.complete(woId);
    load();
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Orders</h1>
          <p className="text-sm text-slate-500 mt-1">{wos.length} work orders</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
          + New Work Order
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-900" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f,type:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {["preventive_maintenance","corrective_maintenance","emergency","inspection"].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g," ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({...f,priority:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {["low","medium","high","critical"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">Create</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading
          ? <div className="p-8 text-center text-slate-400">Loading...</div>
          : wos.length === 0
          ? <div className="p-8 text-center text-slate-400">No work orders yet.</div>
          : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-3">WO #</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {wos.map((wo: any) => (
                  <tr key={wo.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-xs text-slate-500">{wo.work_order_number}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{wo.title}</td>
                    <td className="px-6 py-3 text-xs text-slate-500">{wo.type?.replace(/_/g," ")}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRI[wo.priority] ?? "bg-slate-100 text-slate-600"}`}>{wo.priority}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS[wo.status] ?? "bg-slate-100 text-slate-600"}`}>{wo.status?.replace(/_/g," ")}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2 items-center">
                        {wo.status === "draft" && techs.length > 0 && (
                          <select onChange={e => handleAssign(wo.id, e.target.value)} defaultValue="" className="border border-slate-200 rounded text-xs px-2 py-1">
                            <option value="">Assign...</option>
                            {techs.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        )}
                        {(wo.status === "assigned" || wo.status === "in_progress") && (
                          <button onClick={() => handleComplete(wo.id)} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}
