// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { PageWrapper, SectionCard } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtNum = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

export default function ExecutivePage() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";

  const { data: woRaw=[] }        = useQuery(["ex-wo"],       () => authFetch("/api/v1/work-orders/?limit=200").then(r=>r.json()),      {refetchInterval:120000});
  const { data: invRaw=[] }       = useQuery(["ex-inv"],      () => authFetch("/api/v1/invoices/?limit=200").then(r=>r.json()),         {refetchInterval:120000});
  const { data: leadsRaw=[] }     = useQuery(["ex-leads"],    () => authFetch("/api/v1/leads/?limit=200").then(r=>r.json()),            {refetchInterval:120000});
  const { data: contractsRaw=[] } = useQuery(["ex-contracts"],() => authFetch("/api/v1/contracts/?limit=200").then(r=>r.json()),        {refetchInterval:120000});
  const { data: twin={} }         = useQuery(["ex-twin"],     () => authFetch("/api/v1/twin/state").then(r=>r.json()),                  {refetchInterval:60000});
  const { data: srRaw=[] }        = useQuery(["ex-sr"],       () => authFetch("/api/v1/service-requests/?limit=100").then(r=>r.json()), {refetchInterval:120000});

  const wos=toArr(woRaw); const invs=toArr(invRaw); const leads=toArr(leadsRaw);
  const contracts=toArr(contractsRaw); const srs=toArr(srRaw);

  const woOpen      = wos.filter(w=>w.status==="open").length;
  const woCritical  = wos.filter(w=>w.priority==="critical"&&!["completed","cancelled"].includes(w.status)).length;
  const woComplete  = wos.filter(w=>w.status==="completed").length;
  const woCompRate  = wos.length>0?Math.round((woComplete/wos.length)*100):0;
  const totalRev    = invs.reduce((s,i)=>s+(i.amount||0),0);
  const paidRev     = invs.filter(i=>i.status==="paid").reduce((s,i)=>s+(i.amount||0),0);
  const overdueRev  = invs.filter(i=>i.status==="overdue").reduce((s,i)=>s+(i.amount||0),0);
  const collRate    = totalRev>0?Math.round((paidRev/totalRev)*100):0;
  const invOverdue  = invs.filter(i=>i.status==="overdue").length;
  const leadsWon    = leads.filter(l=>["won","converted"].includes(l.status)).length;
  const activeC     = contracts.filter(c=>c.status==="active").length;
  const activeVal   = contracts.filter(c=>c.status==="active").reduce((s,c)=>s+(c.total_value||c.value||0),0);
  const expiring30  = contracts.filter(c=>{if(!c.end_date||c.status!=="active")return false;try{return(new Date(c.end_date)-now)/(1000*60*60*24)<=30;}catch{return false;}}).length;
  const srOpen      = srs.filter(s=>s.status==="open").length;
  const srCritical  = srs.filter(s=>s.urgency==="critical"&&s.status!=="resolved").length;
  const twinScore   = twin.health_score??0;
  const twinLabel   = twin.health_label??"—";
  const twinColor   = twinScore>=95?"text-emerald-600":twinScore>=80?"text-amber-600":"text-red-600";
  const twinBg      = twinScore>=95?"bg-emerald-50 border-emerald-300":twinScore>=80?"bg-amber-50 border-amber-300":"bg-red-50 border-red-300";
  const platScore   = Math.round((twinScore*0.3)+(Math.min(100,collRate)*0.25)+(Math.min(100,woCompRate)*0.25)+(woCritical===0?20:Math.max(0,20-woCritical*4)));
  const platColor   = platScore>=85?"text-emerald-600":platScore>=70?"text-amber-600":"text-red-600";
  const platBg      = platScore>=85?"bg-emerald-50 border-emerald-200":platScore>=70?"bg-amber-50 border-amber-200":"bg-red-50 border-red-200";

  const alerts = [];
  if (woCritical>0)  alerts.push({icon:"🚨",text:`${woCritical} critical work orders open`,urgency:"critical",link:"/operations/work-orders"});
  if (srCritical>0)  alerts.push({icon:"🎫",text:`${srCritical} critical service requests`,urgency:"critical",link:"/operations/service-requests"});
  if (invOverdue>0)  alerts.push({icon:"💸",text:`${invOverdue} overdue invoices — EGP ${fmtNum(overdueRev)}`,urgency:"warning",link:"/commercial/invoices"});
  if (expiring30>0)  alerts.push({icon:"📄",text:`${expiring30} contracts expiring in 30 days`,urgency:"warning",link:"/commercial/contracts"});
  if (alerts.length===0) alerts.push({icon:"✅",text:"All systems operating normally",urgency:"success"});

  const aC = {critical:"bg-red-50 border-red-200 text-red-800",warning:"bg-amber-50 border-amber-200 text-amber-800",success:"bg-emerald-50 border-emerald-200 text-emerald-800"};
  const LINKS=[
    {label:"Work Orders",href:"/operations/work-orders",icon:"🔧",c:"bg-blue-600"},
    {label:"Invoices",href:"/commercial/invoices",icon:"💰",c:"bg-emerald-600"},
    {label:"Analytics",href:"/analytics",icon:"📊",c:"bg-purple-600"},
    {label:"Contracts",href:"/commercial/contracts",icon:"📄",c:"bg-indigo-600"},
    {label:"Assets",href:"/maintenance/assets",icon:"⚙️",c:"bg-slate-700"},
    {label:"Leads",href:"/commercial/leads",icon:"🎯",c:"bg-amber-600"},
    {label:"Projects",href:"/projects-center",icon:"🏗️",c:"bg-teal-600"},
    {label:"Service Req",href:"/operations/service-requests",icon:"🎫",c:"bg-orange-600"},
  ];

  return (
    <PageWrapper>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting} 👔</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
          <p className="text-sm text-slate-600 mt-1">Triangle Black — Executive Summary</p>
        </div>
        <div className={`flex items-center gap-4 px-5 py-3 rounded-xl border ${platBg}`}>
          <div className="text-center">
            <div className={`text-4xl font-black ${platColor}`}>{platScore}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Platform Score</div>
          </div>
          <div className={`border-l border-slate-200 pl-4`}>
            <div className={`text-2xl font-bold ${twinColor}`}>{twinScore}/100</div>
            <div className="text-xs text-slate-500">Digital Twin</div>
          </div>
        </div>
      </div>

      <SectionCard title={`Action Items (${alerts.length})`}>
        <div className="space-y-2">
          {alerts.map((a,i)=>(
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${aC[a.urgency]||"bg-blue-50 border-blue-200 text-blue-800"}`}>
              <span className="text-lg shrink-0">{a.icon}</span>
              <p className="text-sm font-semibold flex-1">{a.text}</p>
              {a.link&&<Link href={a.link} className="text-xs font-bold underline shrink-0">Review →</Link>}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <SectionCard title="Financial Summary">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-emerald-800">EGP {fmtNum(paidRev)}</div>
              <div className="text-xs text-emerald-700 mt-0.5">Revenue Collected</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-blue-800">{collRate}%</div>
              <div className="text-xs text-blue-700 mt-0.5">Collection Rate</div>
            </div>
          </div>
          {[
            {l:"Total Invoiced",     v:`EGP ${fmtNum(totalRev)}`},
            {l:"Outstanding",        v:`EGP ${fmtNum(totalRev-paidRev)}`},
            {l:"Active Contract Value", v:`EGP ${fmtNum(activeVal)}`},
            {l:"Active Contracts",   v:activeC},
          ].map(r=>(
            <div key={r.l} className="flex justify-between py-2 border-b border-slate-50 text-sm last:border-0">
              <span className="text-slate-500">{r.l}</span>
              <span className="font-semibold text-slate-800">{r.v}</span>
            </div>
          ))}
          {invOverdue>0&&(
            <div className="flex justify-between py-2 text-sm text-red-600">
              <span className="font-medium">Overdue ({invOverdue} invoices)</span>
              <span className="font-bold">EGP {fmtNum(overdueRev)}</span>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Operations Summary">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {l:"Open WOs",    v:woOpen,     c:"text-blue-700"},
              {l:"Critical",    v:woCritical, c:woCritical>0?"text-red-700":"text-emerald-700"},
              {l:"Completion",  v:`${woCompRate}%`, c:woCompRate>=80?"text-emerald-700":"text-amber-700"},
            ].map(k=>(
              <div key={k.l} className="text-center bg-slate-50 rounded-xl p-3">
                <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
                <div className="text-xs text-slate-500 mt-0.5">{k.l}</div>
              </div>
            ))}
          </div>
          {[
            {l:"Open Service Requests", v:srOpen},
            {l:"Leads Won",             v:leadsWon},
            {l:"Total Leads",           v:leads.length},
            {l:"Contracts Expiring (30d)", v:expiring30},
          ].map(r=>(
            <div key={r.l} className="flex justify-between py-2 border-b border-slate-50 text-sm last:border-0">
              <span className="text-slate-500">{r.l}</span>
              <span className="font-semibold text-slate-800">{r.v}</span>
            </div>
          ))}
        </SectionCard>
      </div>

      <SectionCard title="Quick Access">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LINKS.map(a=>(
            <Link key={a.href} href={a.href}>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all">
                <span className={`${a.c} text-white text-xs px-2 py-1 rounded-lg`}>{a.icon}</span>
                <span className="text-xs font-semibold text-slate-700">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
