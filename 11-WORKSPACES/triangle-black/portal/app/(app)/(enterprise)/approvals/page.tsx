// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { tokenManager } from "@/lib/auth/token-manager";
import { CheckCircle2, XCircle, Clock, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const TYPE_COLORS: any = {
  quote:"bg-blue-100 text-blue-700",
  purchase_request:"bg-purple-100 text-purple-700",
  purchase_order:"bg-amber-100 text-amber-700",
};

export default function ApprovalsPage() {
  const qc = useQueryClient();
  const [processing, setProcessing] = useState<string|null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["approvals"],
    queryFn:  () => authFetchJSON("/api/v1/approvals"),
    staleTime: 15_000,
  });

  const items = Array.isArray(data) ? data : data?.queue || data?.items || [];

  async function doAction(id: string, type: string, action: "approve"|"reject") {
    setProcessing(id+action);
    try {
      const token = tokenManager.getToken();
      const res = await fetch(
        "/api/v1/approvals/"+id+"/"+action+"?approval_type="+type,
        { method:"POST", headers:{ "Authorization":"Bearer "+(token||""), "Content-Type":"application/json" } }
      );
      if (!res.ok) { const d=await res.json().catch(()=>({})); throw new Error(d.detail||"Failed"); }
      toast.success(action==="approve"?"Approved ✅":"Rejected ❌");
      qc.invalidateQueries({queryKey:["approvals"]});
    } catch(e:any) { toast.error(e.message||"Action failed"); }
    finally { setProcessing(null); }
  }

  const counts = { total:items.length, quotes:items.filter((i:any)=>i.type==="quote").length, prs:items.filter((i:any)=>i.type==="purchase_request").length, pos:items.filter((i:any)=>i.type==="purchase_order").length };

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Approvals Center" subtitle={`${counts.total} pending`} badge="APV"
        actions={<button onClick={()=>refetch()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className="h-4 w-4"/></button>}/>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:"Total Pending",  val:counts.total,  color:"text-slate-900"},
          {label:"Quotes",         val:counts.quotes, color:"text-blue-700"},
          {label:"Purchase Req",   val:counts.prs,    color:"text-purple-700"},
          {label:"Purchase Orders",val:counts.pos,    color:"text-amber-700"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed"}/>}

      {isLoading ? <LoadingState type="cards" rows={3} cols={1}/> :
       items.length===0 ? (
         <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
           <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4"/>
           <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
           <p className="text-slate-500 mt-2">No pending approvals.</p>
         </div>
       ) : (
         <div className="space-y-3">
           {items.map((item:any)=>(
             <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                 <FileText className="w-5 h-5 text-amber-600"/>
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                   <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full capitalize "+(TYPE_COLORS[item.type]||"bg-slate-100 text-slate-600")}>{(item.type||"").replace(/_/g," ")}</span>
                   <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/>{item.created_at?new Date(item.created_at).toLocaleDateString():"—"}</span>
                 </div>
                 <h4 className="font-semibold text-slate-900">{item.reference||item.title||item.id}</h4>
                 <p className="text-xs text-slate-500 mt-0.5">{item.description||item.notes||"Pending approval"}</p>
               </div>
               <div className="flex items-center gap-2 flex-shrink-0">
                 <button onClick={()=>doAction(item.id,item.type||"quote","reject")}
                   disabled={processing!==null}
                   className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors">
                   <XCircle className="w-4 h-4"/>
                   {processing===item.id+"reject"?"...":"Reject"}
                 </button>
                 <button onClick={()=>doAction(item.id,item.type||"quote","approve")}
                   disabled={processing!==null}
                   className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                   <CheckCircle2 className="w-4 h-4"/>
                   {processing===item.id+"approve"?"...":"Approve"}
                 </button>
               </div>
             </div>
           ))}
         </div>
       )}
    </PageWrapper>
  );
}
