"use client";
import { useEffect, useState } from "react";
import { serviceOpsApi } from "@/lib/api";

export default function TechniciansPage() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", max_work_orders: 10 });
  const [specInput, setSpecInput] = useState("HVAC");

  const safe = (d: any) => Array.isArray(d) ? d : (d && d.items) ? d.items : [];
  const load = () => serviceOpsApi.getTechnicians().then(d => setTechs(safe(d))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await serviceOpsApi.createTechnician({ ...form, specializations: specInput.split(",").map(s => s.trim()).filter(Boolean) });
    setShowForm(false);
    setForm({ name: "", email: "", phone: "", max_work_orders: 10 });
    load();
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B4B]">Technicians</h1>
          <p className="text-sm text-gray-500 mt-1">{techs.length} registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[#1B2B4B] text-white rounded-lg text-sm font-medium hover:bg-[#152239]">
          + Add Technician
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#1B2B4B]">New Technician</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[{key:"name",label:"Full Name"},{key:"email",label:"Email"},{key:"phone",label:"Phone"}].map(({key,label}) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B2B4B]" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Specializations</label>
              <input value={specInput} onChange={e => setSpecInput(e.target.value)} placeholder="HVAC, Electrical" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B2B4B]" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Max Work Orders</label>
              <input type="number" value={form.max_work_orders} onChange={e => setForm(f => ({...f,max_work_orders:parseInt(e.target.value)||10}))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B2B4B]" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} className="px-5 py-2 bg-[#1B2B4B] text-white rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      ) : techs.length === 0 ? (
        <div className="p-8 text-center text-gray-400">No technicians yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techs.map(t => {
            const util = t.max_work_orders > 0 ? Math.round((t.current_work_orders / t.max_work_orders) * 100) : 0;
            return (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.email}</p>
                  </div>
                  <span className={"px-2 py-0.5 rounded text-xs font-medium " + (t.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {t.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(t.specializations || []).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Utilization</span>
                    <span className={util > 80 ? "text-red-500 font-semibold" : util > 50 ? "text-amber-500 font-semibold" : "text-green-600 font-semibold"}>
                      {util}% ({t.current_work_orders}/{t.max_work_orders})
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={"h-2 rounded-full " + (util > 80 ? "bg-red-400" : util > 50 ? "bg-amber-400" : "bg-green-400")} style={{width: Math.min(util,100) + "%"}} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}