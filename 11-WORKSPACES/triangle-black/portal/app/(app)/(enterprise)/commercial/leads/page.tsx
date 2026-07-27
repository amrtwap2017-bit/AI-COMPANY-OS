// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, Modal } from "@/components/ui";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };

const P = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};
const ST = {new:"bg-blue-100 text-blue-800",qualified:"bg-indigo-100 text-indigo-800",assigned:"bg-amber-100 text-amber-800",negotiation:"bg-orange-100 text-orange-800",converted:"bg-emerald-100 text-emerald-800",won:"bg-emerald-100 text-emerald-800",lost:"bg-red-100 text-red-700"};

const STATUSES  = ["all","new","qualified","assigned","negotiation","converted","won","lost"];
const PRIORITIES = ["all","critical","high","medium","low"];
const SOURCES   = ["all","web","direct","referral","linkedin","cold_call","event"];

export default function LeadsPage() {
  const [sf, setSf] = useState("all");
  const [pf, setPf] = useState("all");
  const [src, setSrc] = useState("all");
  const [q,  setQ]   = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:"", email:"", phone:"", company:"",
    source:"web", status:"new", priority:"medium", notes:"",
    hotel_id:"tb-default-hotel-000000000001"
  });

  const { data: raw = [], isLoading, refetch } = useQuery(
    ["leads-page"],
    () => authFetch("/api/v1/leads/?limit=300").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const leads    = toArr(raw);
  const filtered = leads.filter(l => {
    if (sf  !== "all" && l.status   !== sf)  return false;
    if (pf  !== "all" && l.priority !== pf)  return false;
    if (src !== "all" && l.source   !== src) return false;
    if (q && !(l.name?.toLowerCase().includes(q.toLowerCase()) ||
               l.company?.toLowerCase().includes(q.toLowerCase()) ||
               l.email?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total     = leads.length;
  const newL      = leads.filter(l => l.status === "new").length;
  const pipeline  = leads.filter(l => ["qualified","assigned","negotiation"].includes(l.status)).length;
  const converted = leads.filter(l => ["converted","won"].includes(l.status)).length;
  const avgScore  = leads.length ? Math.round(leads.reduce((s,l)=>s+(l.score||0),0)/leads.length) : 0;

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authFetch("/api/v1/leads/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      if (r.ok) {
        setShowCreate(false);
        setForm({name:"",email:"",phone:"",company:"",source:"web",status:"new",priority:"medium",notes:"",hotel_id:"tb-default-hotel-000000000001"});
        refetch();
      } else {
        const err = await r.json().catch(()=>({}));
        alert(err?.detail || "Failed to create lead");
      }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

  return (
    <PageWrapper>
      <PageHeader
        title="Leads & CRM"
        subtitle={`${total} leads · ${newL} new · ${pipeline} in pipeline · ${converted} converted · avg score ${avgScore}`}
        breadcrumbs={[{label:"Commercial",href:"/commercial"},{label:"Leads"}]}
        actions={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>＋ New Lead</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total Leads",   value:total,     color:"text-slate-800"},
          {label:"New",           value:newL,      color:"text-blue-700"},
          {label:"In Pipeline",   value:pipeline,  color:"text-amber-700"},
          {label:"Converted/Won", value:converted, color:"text-emerald-700"},
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Leads (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search name, company, email…" value={q}
            onChange={e => setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-60 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e => setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s}</option>)}
          </select>
          <select value={pf} onChange={e => setPf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {PRIORITIES.map(p=><option key={p} value={p}>{p==="all"?"All Priority":p}</option>)}
          </select>
          <select value={src} onChange={e => setSrc(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {SOURCES.map(s=><option key={s} value={s}>{s==="all"?"All Sources":s}</option>)}
          </select>
          {(sf!=="all"||pf!=="all"||src!=="all"||q) && (
            <button onClick={()=>{setSf("all");setPf("all");setSrc("all");setQ("");}}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length === 0 ? (
          <EmptyState title="No leads found" subtitle="Adjust filters or add a new lead"
            action={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>Add Lead</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Lead / Company","Contact","Source","Priority","Status","Score","Date"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <Link href={`/commercial/leads/${l.id}`}><p className="font-medium text-blue-700 hover:underline">{l.name}</p></Link>
                      <p className="text-xs text-slate-400">{l.company || "—"}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-xs text-slate-600">{l.email || "—"}</p>
                      <p className="text-xs text-slate-400">{l.phone || ""}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{l.source || "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border " + (P[l.priority] || P.low)}>{l.priority || "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold " + (ST[l.status] || "bg-slate-100 text-slate-600")}>{l.status || "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-sm font-bold ${(l.score||0)>=80?"text-emerald-600":(l.score||0)>=50?"text-amber-600":"text-slate-500"}`}>{l.score || 0}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="New Lead" size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={()=>setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={save}>Create Lead</Button>
          </div>
        }>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
              <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
                placeholder="Contact person name" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
              <input value={form.company} onChange={e=>setForm({...form,company:e.target.value})}
                placeholder="Hotel or company name" className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                placeholder="email@hotel.com" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}
                placeholder="+20 10 0000 0000" className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Source</label>
              <select value={form.source} onChange={e=>setForm({...form,source:e.target.value})} className={inp}>
                {SOURCES.filter(s=>s!=="all").map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
              <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className={inp}>
                {PRIORITIES.filter(p=>p!=="all").map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className={inp}>
                {STATUSES.filter(s=>s!=="all").map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3}
              placeholder="Requirements, budget, property details, services needed…"
              className={inp + " resize-none"} />
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
