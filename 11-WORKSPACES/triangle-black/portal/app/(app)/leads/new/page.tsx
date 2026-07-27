// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertBanner, Breadcrumb, PageHeader, PageWrapper } from "@/components/ui";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form, setForm] = useState({
    company_name: "", contact_name: "", email: "",
    phone: "", status: "new", source: "direct",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name || !form.email) { setError("Company name and email are required"); return; }
    setLoading(true); setError("");
    try {
      await authFetchJSON("/api/v1/actions/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      } as any);
      toast.success("Lead created successfully");
      router.push("/leads");
    } catch (e: any) { setError(e.message || "Failed to create lead"); }
    finally { setLoading(false); }
  }

  const field = (label: string, key: string, type = "text", required = false) => (
    <div>
      <label className="text-xs font-medium text-secondary block mb-1.5">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input type={type} value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
        required={required}/>
    </div>
  );

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="New Lead" subtitle="Add a new lead to the pipeline" badge="NEW"
        actions={<Link href="/leads" className="flex items-center gap-1.5 px-3 py-2 text-sm text-secondary hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      {error && <AlertBanner type="error" title={error}/>}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 mb-4">Company Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {field("Company Name", "company_name", "text", true)}
            {field("Contact Name", "contact_name")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("Email", "email", "email", true)}
            {field("Phone", "phone", "tel")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1.5">Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none">
                {["new","qualified","negotiation","won","lost"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-secondary block mb-1.5">Source</label>
              <select value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none">
                {["direct","referral","website","cold_call","exhibition"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving...</> : <><Save className="w-4 h-4"/> Create Lead</>}
          </button>
          <Link href="/leads" className="px-5 py-2.5 border border-slate-200 text-secondary text-sm font-medium rounded-xl hover:bg-slate-50">Cancel</Link>
        </div>
      </form>
    </PageWrapper>
  );
}
