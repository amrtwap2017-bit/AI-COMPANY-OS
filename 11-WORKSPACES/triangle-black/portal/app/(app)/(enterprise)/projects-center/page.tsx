"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

export default function ProjectsCenterPage() {
  const [q,   setQ]   = useState("");
  const [sf,  setSf]  = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [form, setForm] = useState({"name": "", "description": "", "status": "planning", "budget": "", "hotel_id": "tb-default-hotel-000000000001"});

  const { data: raw=[], isLoading, refetch } = useQuery(
    ["projects-page"],
    () => authFetch("/api/v1/projects/?limit=100").then(r=>r.json()),
    { refetchInterval: 60000 }
  );

  const items    = toArr(raw);
  const filtered = items.filter(x => {
    if (sf !== "all" && x.status !== sf) return false;
    if (q && !String(x.title||"").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([k,v])=>v!==""));
      const r = await authFetch("/api/v1/projects/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if (r.ok) {
        setShowCreate(false);
        setForm({"name": "", "description": "", "status": "planning", "budget": "", "hotel_id": "tb-default-hotel-000000000001"});
        refetch();
      } else {
        const err = await r.json().catch(()=>({}));
        alert(err?.detail || "Failed to create record");
      }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  return (
    <PageWrapper>
      <PageHeader
        title="Projects Center"
        subtitle={`${items.length} records`}
        breadcrumbs={[{label:"Projects Center"}]}
        actions={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>+ New Center</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total", value:items.length, color:"text-slate-800"},
          {label:"Active",value:items.filter(x=>["active","open","Operational","planning"].includes(x.status)).length,color:"text-emerald-700"},
          {label:"Completed",value:items.filter(x=>["completed","paid","resolved"].includes(x.status)).length,color:"text-blue-700"},
          {label:"Issues",value:items.filter(x=>["overdue","In Fault","cancelled"].includes(x.status)).length,color:"text-red-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Records (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:border-blue-400" />
          {q&&<button onClick={()=>setQ("")} className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>}
        </div>
        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No records found"
          action={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>Create First Record</Button>}
        />:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {"Title/Name,Status,Date".split(',').map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(x=>(
                  <tr key={x.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800 truncate max-w-sm">{x.title||"—"}</p>
                      {x.description&&<p className="text-xs text-slate-400 truncate">{x.description?.slice(0,60)}</p>}
                      {x.category&&<span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 mt-1">{x.category}</span>}
                    </td>
                    <td className="py-3 px-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${(x.status==="open"?"bg-blue-100 text-blue-800":x.status==="completed"?"bg-emerald-100 text-emerald-800":x.status==="active"?"bg-emerald-100 text-emerald-800":x.status==="planning"?"bg-amber-100 text-amber-800":x.status==="Operational"?"bg-emerald-100 text-emerald-800":x.status==="In Fault"?"bg-red-100 text-red-800":"bg-slate-100 text-slate-600")}`}>{x.status?.replace(/_/g," ")||"—"}</span></td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(x.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {showCreate&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="font-bold text-slate-900">New Projects Center</h2>
              <button onClick={()=>setShowCreate(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none font-bold">x</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Project Name * *</label><input required type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Chiller Upgrade 2026" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} placeholder="Project scope and objectives…" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" /></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"><option key="planning" value="planning">planning</option><option key="active" value="active">active</option><option key="on_hold" value="on_hold">on_hold</option><option key="completed" value="completed">completed</option></select></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">Budget (EGP)</label><input type="number" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="500000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={()=>setShowCreate(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">
                  {saving?"Saving…":"Create Projects Center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
