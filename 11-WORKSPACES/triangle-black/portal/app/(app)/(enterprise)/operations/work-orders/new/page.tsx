"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertBanner, Breadcrumb, PageHeader, PageWrapper } from "@/components/ui";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


export default function NewWorkOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form, setForm] = useState({
    title: "", description: "",
    priority: "medium", type: "maintenance",
    due_date: "",
  });

  const [dispatchRec, setDispatchRec] = useState(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setError("Title is required"); return; }
    setLoading(true); setError("");
    try {
      const r = await authFetchJSON("/api/v1/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      } as any);
      toast.success("Work order created");
      
        // Sprint 18: Auto-dispatch recommendation
        setDispatchLoading(true);
        try {
          const dispRes = await fetch(`${BACK}/api/v1/ai/dispatch/recommend`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              work_order_type: form.type || "general",
              priority: form.priority || "medium",
              hotel_id: "tb-default-hotel-000000000001"
            })
          });
          if (dispRes.ok) {
            const dispData = await dispRes.json();
            setDispatchRec(dispData);
          }
        } catch {}
        setDispatchLoading(false);
      router.push("/work-orders");
    } catch (e: any) { setError(e.message || "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="New Work Order" subtitle="Create engineering work order" badge="NEW"
        actions={<Link href="/work-orders" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      {error && <AlertBanner type="error" title={error}/>}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none" required/>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none resize-none"/>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Priority</label>
              <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none">
                {["low","medium","high","critical","emergency"].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none">
                {["maintenance","repair","inspection","installation","emergency"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Due Date</label>
              <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"/>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving...</> : <><Save className="w-4 h-4"/> Create Work Order</>}
          </button>
          <Link href="/work-orders" className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</Link>
        </div>
      </form>
    
      {/* Sprint 18: Dispatch Recommendation */}
      {dispatchLoading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 animate-pulse">Finding best technician...</p>
        </div>
      )}
      {dispatchRec && dispatchRec.recommended && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
            Recommended Technician
          </p>
          <p className="text-sm font-bold text-slate-800">
            {dispatchRec.recommended.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Match score: {Math.round((dispatchRec.recommended.score || 0) * 100)}%
            {dispatchRec.warning === "all_full" && " · All technicians at capacity"}
            {dispatchRec.warning === "no_specialist" && " · No specialist available"}
          </p>
        </div>
      )}
</PageWrapper>
  );
}
