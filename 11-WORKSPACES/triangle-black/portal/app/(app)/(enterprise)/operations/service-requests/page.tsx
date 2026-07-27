"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const U = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};
const S = {open:"bg-blue-100 text-blue-800",in_progress:"bg-indigo-100 text-indigo-800",resolved:"bg-emerald-100 text-emerald-800",closed:"bg-slate-100 text-slate-500"};
const STATUSES   = ["all","open","in_progress","resolved","closed"];
const URGENCIES  = ["all","critical","high","medium","low"];
const CATEGORIES = ["all","HVAC","Electrical","Plumbing","Elevator","Fire Safety","BMS","Power","Mechanical","IT"];

export default function ServiceRequestsPage() {
  const [q,  setQ]  = useState("");
  const [sf, setSf] = useState("all");
  const [uf, setUf] = useState("all");
  const [cf, setCf] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm] = useState({
    title:"", description:"", category:"HVAC", urgency:"medium",
    submitted_by:"", contact_phone:"",
    hotel_id:"tb-default-hotel-000000000001"
  });

  const { data: raw=[], isLoading, refetch } = useQuery(
    ["service-requests-list"],
    () => authFetch("/api/v1/service-requests/?limit=200").then(r=>r.json()),
    { refetchInterval: 60000 }
  );

  const srs = toArr(raw);
  const filtered = srs.filter(s => {
    if (sf!=="all"&&s.status!==sf) return false;
    if (uf!=="all"&&s.urgency!==uf) return false;
    if (cf!=="all"&&s.category!==cf) return false;
    if (q&&!s.title?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const total    = srs.length;
  const open     = srs.filter(s=>s.status==="open").length;
  const inProg   = srs.filter(s=>s.status==="in_progress").length;
  const critical = srs.filter(s=>s.urgency==="critical").length;

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authFetch("/api/v1/service-requests/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form)
      });
      if (r.ok) {
        setShowCreate(false);
        setForm({title:"",description:"",category:"HVAC",urgency:"medium",submitted_by:"",contact_phone:"",hotel_id:"tb-default-hotel-000000000001"});
        refetch();
      } else {
        const err = await r.json().catch(()=>({}));
        alert(err?.detail||"Failed to create request");
      }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Service Requests"
        subtitle={`${total} total · ${open} open · ${critical} critical`}
        breadcrumbs={[{label:"Operations",href:"/operations"},{label:"Service Requests"}]}
        actions={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>+ New Request</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",      value:total,   color:"text-slate-800"},
          {label:"Open",       value:open,    color:"text-blue-700"},
          {label:"In Progress",value:inProg,  color:"text-indigo-700"},
          {label:"Critical",   value:critical,color:critical>0?"text-red-700":"text-slate-500"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Service Requests (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search requests…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e=>setSf(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s.replace("_"," ")}</option>)}
          </select>
          <select value={uf} onChange={e=>setUf(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {URGENCIES.map(u=><option key={u} value={u}>{u==="all"?"All Urgency":u}</option>)}
          </select>
          <select value={cf} onChange={e=>setCf(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {CATEGORIES.map(c=><option key={c} value={c}>{c==="all"?"All Categories":c}</option>)}
          </select>
          {(sf!=="all"||uf!=="all"||cf!=="all"||q)&&(
            <button onClick={()=>{setSf("all");setUf("all");setCf("all");setQ("");}}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No service requests found"
          action={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>New Request</Button>}
        />:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {["Title","Category","Urgency","Status","Submitted By","Date"].map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(sr=>(
                  <tr key={sr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <Link href={`/operations/service-requests/${sr.id}`}><p className="font-medium text-blue-700 hover:underline truncate max-w-xs">{sr.title}</p></Link>
                      <p className="text-xs text-slate-400 truncate">{sr.description?.slice(0,50)||""}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">{sr.category||"—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(U[sr.urgency?.toLowerCase()]||U.low)}>{sr.urgency||"—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[sr.status]||"bg-slate-100 text-slate-600")}>{sr.status?.replace(/_/g," ")||"—"}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">{sr.submitted_by||"—"}</td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(sr.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {showCreate&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">New Service Request</h2>
              <button onClick={()=>setShowCreate(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">x</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                  placeholder="e.g. AC Breakdown Room 205" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                  rows={3} placeholder="Describe the issue in detail…" className={inp+" resize-none"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className={inp}>
                    {CATEGORIES.filter(c=>c!=="all").map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Urgency</label>
                  <select value={form.urgency} onChange={e=>setForm({...form,urgency:e.target.value})} className={inp}>
                    {URGENCIES.filter(u=>u!=="all").map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Submitted By</label>
                  <input value={form.submitted_by} onChange={e=>setForm({...form,submitted_by:e.target.value})}
                    placeholder="Your name" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone</label>
                  <input value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})}
                    placeholder="+20 10 0000 0000" className={inp} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowCreate(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">
                  {saving?"Saving…":"Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
