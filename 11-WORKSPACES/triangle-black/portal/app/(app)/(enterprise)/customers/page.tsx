// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { RefreshCw, Users, TrendingUp, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { customerSuccessApi } from "@/lib/customer-success-api";
import { PageHeader, MetricStrip, DataTable, FilterBar, StatusPill, LoadingState, Button } from "@/components/ui";
import { fmtCurrency } from "@/lib/design-tokens";

const signalDot: Record<string,string> = { green:"bg-emerald-500", yellow:"bg-amber-500", red:"bg-red-500" };
const gradeStyle: Record<string,string> = { A:"text-emerald-600", B:"text-green-600", C:"text-amber-600", D:"text-orange-600", F:"text-red-600" };

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [signal, setSignal] = useState("");
  const { data, isLoading, refetch } = useQuery({ queryKey:["customer-health-summary"], queryFn:()=>customerSuccessApi.healthSummary(), refetchInterval:60000 });
  const customers = (data?.customers||[]).filter((c:any)=>{
    const ms = !search||[c.name,c.company,c.email].some(v=>v?.toLowerCase().includes(search.toLowerCase()));
    return ms && (!signal||c.signal===signal);
  });
  const metrics = [
    { label:"Total Clients", value:data?.total??"—", icon:<Users className="w-4 h-4"/>, color:"blue" },
    { label:"Healthy", value:data?.healthy??"—", icon:<CheckCircle className="w-4 h-4"/>, color:"emerald" },
    { label:"At Risk", value:data?.at_risk??"—", icon:<AlertTriangle className="w-4 h-4"/>, color:"amber" },
    { label:"Avg Score", value:data?.avg_score!=null?`${data.avg_score}/100`:"—", icon:<TrendingUp className="w-4 h-4"/>, color:"purple" },
  ];
  const columns = [
    { key:"name", label:"Client", render:(r:any)=>(
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          <span className="text-slate-600 font-semibold text-xs">{r.name?.charAt(0)}</span>
        </div>
        <div><div className="font-semibold text-slate-900 text-sm">{r.name}</div><div className="text-xs text-slate-400">{r.email}</div></div>
      </div>
    )},
    { key:"company", label:"Company", render:(r:any)=><span className="text-slate-600">{r.company||"—"}</span> },
    { key:"score", label:"Score", align:"center" as const, render:(r:any)=>(
      <div className="flex items-center justify-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${signalDot[r.signal]||"bg-gray-300"}`}/>
        <span className="font-bold text-slate-900">{r.score}</span>
        <span className="text-slate-400 text-xs">/100</span>
      </div>
    )},
    { key:"grade", label:"Grade", align:"center" as const, render:(r:any)=>(
      <span className={`text-lg font-bold ${gradeStyle[r.grade]||"text-slate-600"}`}>{r.grade}</span>
    )},
    { key:"renewal_risk", label:"Renewal Risk", align:"center" as const, render:(r:any)=><StatusPill status={r.renewal_risk||"low"} dot/> },
    { key:"open_issues", label:"Issues", align:"center" as const, render:(r:any)=>(
      <span className={`font-semibold ${r.open_issues>0?"text-red-600":"text-slate-400"}`}>{r.open_issues}</span>
    )},
    { key:"action", label:"", align:"right" as const, render:(r:any)=>(
      <Link href={`/customers/${r.lead_id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-700 text-white text-xs font-medium rounded-lg hover:bg-amber-800 transition-colors">
        360 View <ChevronRight className="w-3 h-3"/>
      </Link>
    )},
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Customer Success" subtitle="Health scores, renewals and relationship intelligence" actions={<Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5"/>} onClick={()=>refetch()}>Refresh</Button>}/>
      {isLoading?<LoadingState type="cards" rows={4} cols={4}/>:<MetricStrip metrics={metrics} cols={4}/>}
      <FilterBar search={{value:search,onChange:setSearch,placeholder:"Search clients..."}} filters={[{label:"Signal",value:signal,onChange:setSignal,options:[{label:"Healthy",value:"green"},{label:"At Risk",value:"yellow"},{label:"Critical",value:"red"}]}]} count={customers.length}/>
      {isLoading?<LoadingState type="table" rows={8} cols={7}/>:<DataTable columns={columns} data={customers} keyField="lead_id" empty="No clients found"/>}
    </div>
  );
}
