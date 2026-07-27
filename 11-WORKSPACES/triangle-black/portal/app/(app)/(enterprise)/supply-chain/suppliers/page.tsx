"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const CATEGORIES = ["HVAC","Electrical","Plumbing","Elevator","Fire Safety","General","IT","Tools","Mechanical"];
const TERMS      = ["Net 7","Net 14","Net 30","Net 45","Net 60","Cash on Delivery","Prepaid"];

export default function SuppliersPage() {
  const [q,         setQ]         = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showCreate,setShowCreate] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({
    name:"", category:"HVAC", contact_email:"", contact_phone:"",
    city:"", payment_terms:"Net 30", hotel_id:"tb-default-hotel-000000000001"
  });

  const { data: raw=[], isLoading, refetch } = useQuery(
    ["suppliers-list"],
    () => authFetch("/api/v1/suppliers/?limit=200").then(r=>r.json()),
    { refetchInterval: 120000 }
  );

  const suppliers  = toArr(raw);
  const catCounts  = suppliers.reduce((a,s) => { if(s.category) a[s.category]=(a[s.category]||0)+1; return a; }, {});
  const filtered   = suppliers.filter(s => {
    if (catFilter!=="all" && s.category!==catFilter) return false;
    if (q && !(s.name?.toLowerCase().includes(q.toLowerCase()) || s.city?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total  = suppliers.length;
  const active = suppliers.filter(s=>s.is_active!==false).length;

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authFetch("/api/v1/suppliers/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      if (r.ok) {
        setShowCreate(false);
        setForm({name:"",category:"HVAC",contact_email:"",contact_phone:"",city:"",payment_terms:"Net 30",hotel_id:"tb-default-hotel-000000000001"});
        refetch();
      } else {
        const err = await r.json().catch(()=>({}));
        alert(err?.detail || "Failed to create supplier");
      }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Suppliers"
        subtitle={`${total} suppliers · ${active} active`}
        breadcrumbs={[{label:"Supply Chain",href:"/supply-chain"},{label:"Suppliers"}]}
        actions={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>+ New Supplier</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",      value:total,                          color:"text-slate-800"},
          {label:"Active",     value:active,                         color:"text-emerald-700"},
          {label:"Inactive",   value:total-active,                   color:"text-secondary"},
          {label:"Categories", value:Object.keys(catCounts).length,  color:"text-blue-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-secondary mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {!isLoading && Object.keys(catCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {["all",...Object.keys(catCounts)].map(cat=>(
            <button key={cat} onClick={()=>setCatFilter(catFilter===cat?"all":cat)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${catFilter===cat?"bg-blue-600 text-white border-blue-600":"bg-white text-secondary border-slate-200 hover:border-blue-300"}`}>
              {cat==="all"?"All":cat}
              {cat!=="all" && <span className={catFilter===cat?"text-blue-200":"text-tertiary"}>({catCounts[cat]})</span>}
            </button>
          ))}
        </div>
      )}

      <SectionCard title={`Suppliers (${filtered.length})`}>
        <div className="mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search name or city…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-400" />
        </div>
        {isLoading ? <LoadingState /> : filtered.length===0 ? (
          <EmptyState title="No suppliers found"
            action={<Button variant="primary" size="sm" onClick={()=>setShowCreate(true)}>Add Supplier</Button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(s => {
              const isActive = s.is_active !== false;
              return (
                <div key={s.id} className={`rounded-xl border p-4 transition-all hover:shadow-sm ${isActive?"bg-white border-slate-200":"bg-slate-50 border-slate-200 opacity-70"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-semibold text-slate-800 truncate">{s.name}</p>
                      {s.category && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 mt-1">{s.category}</span>}
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${isActive?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-secondary"}`}>
                      {isActive?"Active":"Inactive"}
                    </span>
                  </div>
                  <div className="space-y-1 mt-2 text-xs text-secondary">
                    {s.contact_email && <p className="truncate">{s.contact_email}</p>}
                    {s.contact_phone && <p>{s.contact_phone}</p>}
                    {s.city          && <p className="text-tertiary">{s.city}</p>}
                    {s.payment_terms && <p className="text-tertiary">Terms: {s.payment_terms}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">New Supplier</h2>
              <button onClick={()=>setShowCreate(false)} className="text-tertiary hover:text-secondary text-xl font-bold leading-none">x</button>
            </div>
            <form onSubmit={save} className="tb-page">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Company Name *</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
                  placeholder="e.g. Al-Masry HVAC Supplies" className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className={inp}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Payment Terms</label>
                  <select value={form.payment_terms} onChange={e=>setForm({...form,payment_terms:e.target.value})} className={inp}>
                    {TERMS.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Contact Email</label>
                  <input type="email" value={form.contact_email} onChange={e=>setForm({...form,contact_email:e.target.value})}
                    placeholder="info@supplier.com" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Contact Phone</label>
                  <input value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})}
                    placeholder="+20 2 0000 0000" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">City</label>
                <input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}
                  placeholder="Cairo / Alexandria…" className={inp} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={()=>setShowCreate(false)}
                  className="px-4 py-2 text-sm text-secondary border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">
                  {saving?"Saving…":"Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
