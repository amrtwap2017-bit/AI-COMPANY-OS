"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtNum  = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const P = {critical:"bg-red-100 text-red-800 border-red-200",high:"bg-orange-100 text-orange-800 border-orange-200",medium:"bg-amber-100 text-amber-800 border-amber-200",low:"bg-slate-100 text-slate-600 border-slate-200"};
const S = {draft:"bg-slate-100 text-slate-600",submitted:"bg-blue-100 text-blue-800",approved:"bg-emerald-100 text-emerald-800",rejected:"bg-red-100 text-red-700",ordered:"bg-indigo-100 text-indigo-800",completed:"bg-emerald-100 text-emerald-800"};
const PRIORITIES = ["critical","high","medium","low"];

export default function PurchaseRequestDetailPage() {
  const { id }    = useParams();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(null);

  const { data: pr, isLoading, refetch } = useQuery(
    ["pr-detail", id],
    () => authFetch(`/api/v1/purchase-requests/${id}`).then(r=>r.json()),
    { enabled: !!id, onSuccess: (d) => { if (!form) setForm(d); } }
  );

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400";

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {...form};
      if (payload.estimated_cost) payload.estimated_cost = Number(payload.estimated_cost);
      const r = await authFetch(`/api/v1/purchase-requests/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if (r.ok) { setEditing(false); refetch(); }
      else { const err = await r.json().catch(()=>{}); alert(err?.detail||"Failed to update"); }
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  async function updateStatus(status) {
    setSaving(true);
    try {
      const r = await authFetch(`/api/v1/purchase-requests/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({status})
      });
      if (r.ok) refetch();
      else alert("Failed to update status");
    } catch { alert("Network error"); }
    finally { setSaving(false); }
  }

  if (isLoading) return <PageWrapper><LoadingState /></PageWrapper>;
  if (!pr || pr.detail) return (
    <PageWrapper>
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Purchase request not found</p>
        <Link href="/supply-chain/purchase-requests" className="text-blue-600 underline text-sm">Back to Purchase Requests</Link>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <PageHeader
        title={pr.title || "Purchase Request"}
        subtitle={pr.category ? `${pr.category} · ${pr.priority||""}` : pr.priority||""}
        breadcrumbs={[{label:"Supply Chain",href:"/supply-chain"},{label:"Purchase Requests",href:"/supply-chain/purchase-requests"},{label:pr.title?.slice(0,30)||id}]}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={()=>{setForm({...pr,estimated_cost:pr.estimated_cost||""});setEditing(true)}}>Edit</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={()=>setEditing(false)}>Cancel</Button>
                <Button variant="primary" size="sm" loading={saving} onClick={save}>Save Changes</Button>
              </>
            )}
          </div>
        }
      />

      {!editing && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-xs font-semibold text-slate-500 mr-2">STATUS:</span>
          <span className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold "+(S[pr.status]||"bg-slate-100 text-slate-600")}>{pr.status||"—"}</span>
          <div className="flex-1" />
          {pr.status==="draft" && (
            <button onClick={()=>updateStatus("submitted")} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              Submit for Approval
            </button>
          )}
          {pr.status==="submitted" && (
            <>
              <button onClick={()=>updateStatus("approved")} disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                Approve
              </button>
              <button onClick={()=>updateStatus("rejected")} disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors">
                Reject
              </button>
            </>
          )}
          {pr.status==="approved" && (
            <button onClick={()=>updateStatus("ordered")} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              Mark as Ordered
            </button>
          )}
          {pr.status==="ordered" && (
            <button onClick={()=>updateStatus("completed")} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">
              Mark Complete
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <SectionCard title="Request Details">
            {editing ? (
              <form onSubmit={save} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                  <input required value={form?.title||""} onChange={e=>setForm({...form,title:e.target.value})} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <textarea value={form?.description||""} onChange={e=>setForm({...form,description:e.target.value})}
                    rows={4} className={inp+" resize-none"} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                    <input value={form?.category||""} onChange={e=>setForm({...form,category:e.target.value})} placeholder="HVAC / Electrical…" className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                    <select value={form?.priority||"medium"} onChange={e=>setForm({...form,priority:e.target.value})} className={inp}>
                      {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Est. Cost (EGP)</label>
                    <input type="number" value={form?.estimated_cost||""} onChange={e=>setForm({...form,estimated_cost:e.target.value})} className={inp} />
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</p>
                  <p className="text-slate-800 font-medium">{pr.title}</p>
                </div>
                {pr.description && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{pr.description}</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Approval workflow visualization */}
          {!editing && (
            <SectionCard title="Approval Workflow">
              <div className="flex items-center gap-2">
                {["draft","submitted","approved","ordered","completed"].map((step, i, arr) => {
                  const idx = arr.indexOf(pr.status);
                  const stepIdx = arr.indexOf(step);
                  const isDone    = stepIdx < idx;
                  const isCurrent = step === pr.status;
                  const isPending = stepIdx > idx;
                  const isRejected = pr.status === "rejected";
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`flex flex-col items-center flex-1 ${i<arr.length-1?"":"flex-none"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${isCurrent&&!isRejected?"bg-blue-600 text-white":isDone?"bg-emerald-500 text-white":"bg-slate-100 text-slate-400"}`}>
                          {isDone?"✓":i+1}
                        </div>
                        <span className={`text-xs text-center ${isCurrent&&!isRejected?"text-blue-700 font-semibold":isDone?"text-emerald-600":"text-slate-400"}`}>{step}</span>
                      </div>
                      {i < arr.length-1 && <div className={`h-0.5 flex-1 mx-1 mb-5 ${isDone?"bg-emerald-400":"bg-slate-200"}`} />}
                    </div>
                  );
                })}
              </div>
              {pr.status === "rejected" && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-semibold">
                  This request was rejected. Edit and resubmit if needed.
                </div>
              )}
            </SectionCard>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title="Properties">
            <dl className="space-y-3">
              {[
                {label:"Status",    value:<span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[pr.status]||"bg-slate-100 text-slate-600")}>{pr.status||"—"}</span>},
                {label:"Priority",  value:<span className={"inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border "+(P[pr.priority]||P.low)}>{pr.priority||"—"}</span>},
                {label:"Category",  value:<span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{pr.category||"—"}</span>},
                {label:"Est. Cost", value:pr.estimated_cost?`EGP ${fmtNum(pr.estimated_cost)}`:"—"},
                {label:"Created",   value:fmtDate(pr.created_at)},
                {label:"Updated",   value:fmtDate(pr.updated_at)},
              ].map(({label,value})=>(
                <div key={label} className="flex justify-between items-center">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-xs">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <Link href="/supply-chain/purchase-requests" className="block w-full px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-center">
            Back to Purchase Requests
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
