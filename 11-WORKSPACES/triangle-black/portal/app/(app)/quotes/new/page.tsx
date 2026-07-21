"use client";
// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper, PageHeader, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewQuotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form, setForm] = useState({
    title: "", total_value: "", currency: "EGP",
    valid_until: "", notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setError("Title is required"); return; }
    setLoading(true); setError("");
    try {
      await authFetchJSON("/api/v1/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, total_value: parseFloat(form.total_value) || 0 }),
      } as any);
      toast.success("Quote created");
      router.push("/quotes");
    } catch (e: any) { setError(e.message || "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="New Quote" subtitle="Create a new quotation" badge="NEW"
        actions={<Link href="/quotes" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      {error && <AlertBanner type="error" title={error}/>}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none" required/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Total Value</label>
              <input type="number" value={form.total_value} onChange={e=>setForm(f=>({...f,total_value:e.target.value}))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Currency</label>
              <select value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none">
                {["EGP","USD","EUR"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Valid Until</label>
            <input type="date" value={form.valid_until} onChange={e=>setForm(f=>({...f,valid_until:e.target.value}))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"/>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none resize-none"/>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving...</> : <><Save className="w-4 h-4"/> Create Quote</>}
          </button>
          <Link href="/quotes" className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</Link>
        </div>
      </form>
    </PageWrapper>
  );
}
