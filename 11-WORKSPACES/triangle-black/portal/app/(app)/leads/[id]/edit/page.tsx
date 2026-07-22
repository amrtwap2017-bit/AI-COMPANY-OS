"use client"; // @ts-nocheck
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { tokenManager } from "@/lib/auth/token-manager";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditLeadPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form, setForm] = useState<any>(null);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead-edit", id],
    queryFn:  () => authFetchJSON("/api/v1/actions/leads/" + id),
    enabled:  !!id,
  });

  useEffect(() => { if (lead) setForm(lead); }, [lead]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setLoading(true); setError("");
    try {
      const token = tokenManager.getToken();
      const res = await fetch("/api/v1/leads/" + id, {
        method: "PUT",
        headers: { "Content-Type":"application/json", "Authorization":"Bearer "+(token||"") },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d=await res.json().catch(()=>({})); throw new Error(d.detail||"Failed"); }
      toast.success("Lead updated");
      router.push("/leads/"+id);
    } catch(e:any) { setError(e.message||"Update failed"); }
    finally { setLoading(false); }
  }

  if (isLoading || !form) return <PageWrapper><LoadingState type="table" rows={5}/></PageWrapper>;

  const field = (label: string, key: string, type="text") => (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1.5">{label}</label>
      <input type={type} value={form[key]||""} onChange={e=>setForm((f:any)=>({...f,[key]:e.target.value}))}
        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"/>
    </div>
  );

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title={"Edit: "+(form.company_name||"Lead")} subtitle="Update lead information" badge="EDIT"
        actions={<Link href={"/leads/"+id} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-4 h-4"/> Back</Link>}/>
      {error&&<AlertBanner type="error" title={error}/>}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field("Company Name","company_name")}
            {field("Contact Name","contact_name")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("Email","email","email")}
            {field("Phone","phone","tel")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Status</label>
              <select value={form.status||"new"} onChange={e=>setForm((f:any)=>({...f,status:e.target.value}))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none">
                {["new","qualified","negotiation","won","lost"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1.5">Source</label>
              <select value={form.source||"direct"} onChange={e=>setForm((f:any)=>({...f,source:e.target.value}))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none">
                {["direct","referral","website","cold_call","exhibition"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Notes</label>
            <textarea rows={3} value={form.notes||""} onChange={e=>setForm((f:any)=>({...f,notes:e.target.value}))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none resize-none"/>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl">
            {loading?<><Loader2 className="w-4 h-4 animate-spin"/>Saving...</>:<><Save className="w-4 h-4"/>Save Changes</>}
          </button>
          <Link href={"/leads/"+id} className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-slate-50">Cancel</Link>
        </div>
      </form>
    </PageWrapper>
  );
}
