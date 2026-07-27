"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
export default function CustomerRenewals() {
  const router = useRouter();
  const { data: contractRaw } = useQuery(["crn-cont"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const contracts = toArr(contractRaw);
  const now = new Date();
  const expiring30 = contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=new Date(now.getTime()+30*86400000));
  const expiring90 = contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=new Date(now.getTime()+90*86400000));
  const expired = contracts.filter(c=>c.status==="expired");
  const renewalValue = expiring90.reduce((s,c)=>s+Number(c.total_value||0),0);
  return (
    <div className="tb-page">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Customer Renewals</div>
      <h1 className="text-page-title text-primary">Contract Renewals</h1>
      <p className="text-secondary mt-1">Contracts requiring renewal action</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Expiring in 30 Days",value:expiring30.length,color:"red"},
          {label:"Expiring in 90 Days",value:expiring90.length,color:"amber"},
          {label:"Already Expired",value:expired.length,color:"slate"},
          {label:"At-Risk Revenue",value:fmtEGP(renewalValue),color:"purple"},
        ].map((k,i)=>(
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-secondary mb-2">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-bold text-primary mb-4">Contracts Requiring Renewal Action</h2>
        {expiring90.length===0?(<div className="text-center py-8 text-tertiary">✅ No contracts expiring in 90 days</div>):(
          <div className="space-y-2">
            {expiring90.map((c,i)=>{
              const days=Math.ceil((new Date(c.end_date).getTime()-Date.now())/86400000);
              return (
                <button key={i} onClick={()=>router.push(`/commercial/contracts/${c.id}`)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all hover:shadow-md ${days<=30?"bg-red-50 border border-red-200":"bg-amber-50 border border-amber-200"}`}>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{c.title||`Contract ${c.id?.slice(0,8)}`}</div>
                    <div className="text-xs text-secondary mt-0.5">Expires {fmtDate(c.end_date)} · {fmtEGP(c.total_value)}</div>
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-lg ${days<=30?"bg-red-500 text-white":"bg-amber-500 text-white"}`}>{days}d left</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}