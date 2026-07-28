"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

export default function NewWorkOrderPage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title:"", description:"", type:"corrective", priority:"medium",
    technician_id:"", site_id:"", asset_id:"",
    due_date: new Date(Date.now()+86400000).toISOString().split("T")[0]
  });

  const { data: techsRaw } = useQuery(["techs-new"], () => authFetch("/api/v1/technicians/").then(r=>r.json()), {staleTime:60000});
  const { data: sitesRaw } = useQuery(["sites-new"], () => authFetch("/api/v1/sites/").then(r=>r.json()), {staleTime:60000});
  const { data: assetsRaw } = useQuery(["assets-new"], () => authFetch("/api/v1/assets/").then(r=>r.json()), {staleTime:60000});
  const techs = toArr(techsRaw);
  const sites = toArr(sitesRaw);
  const assets = toArr(assetsRaw).filter(a => !form.site_id || a.site_id === form.site_id);

  const createMut = useMutation(
    (payload) => authFetch("/api/v1/work-orders/", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    }).then(r=>r.json()),
    { onSuccess: (data) => { if (data.id) router.push("/operations/work-orders/"+data.id); } }
  );

  const PRIORITY_COLORS = {critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#34D399"};
  const pc = PRIORITY_COLORS[form.priority] || "#94A3B8";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <button onClick={()=>router.push("/operations/work-orders")} className="tb-btn-secondary">← Work Orders</button>
          </div>
          <div className="text-label-upper text-emerald-400 mb-1">Create New</div>
          <h1 className="tb-hero-title">Work Order</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="tb-badge" style={{background:pc+"18",color:pc,border:`1px solid ${pc}30`}}>{form.priority}</span>
            <span className="tb-badge">{form.type}</span>
          </div>
        </div>
      </div>
      <div className="tb-canvas space-y-4">
        <div className="tb-section space-y-4">
          <div className="tb-section-title">Work Order Details</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-tertiary block mb-1">Title *</label>
              <input className="tb-input w-full" placeholder="e.g. Emergency HVAC Repair - Tower A" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Type</label>
              <select className="tb-input w-full" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                {["corrective","preventive","inspection","installation","emergency"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Priority</label>
              <select className="tb-input w-full" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                {["critical","high","medium","low"].map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Site</label>
              <select className="tb-input w-full" value={form.site_id} onChange={e=>setForm({...form,site_id:e.target.value,asset_id:""})}>
                <option value="">Select site…</option>
                {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Assign Technician</label>
              <select className="tb-input w-full" value={form.technician_id} onChange={e=>setForm({...form,technician_id:e.target.value})}>
                <option value="">Select technician…</option>
                {techs.map(t=><option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Asset (optional)</label>
              <select className="tb-input w-full" value={form.asset_id} onChange={e=>setForm({...form,asset_id:e.target.value})}>
                <option value="">Select asset…</option>
                {assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Due Date *</label>
              <input type="date" className="tb-input w-full" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-tertiary block mb-1">Description</label>
              <textarea className="tb-input w-full h-24 resize-none" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the work required…"/>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end pb-8">
          <button onClick={()=>router.back()} className="tb-btn-secondary">Cancel</button>
          <button onClick={()=>createMut.mutate(form)} disabled={!form.title||!form.due_date||createMut.isLoading} className="tb-btn-primary">
            {createMut.isLoading?"Creating…":"Create Work Order →"}
          </button>
        </div>
      </div>
    </div>
  );
}
