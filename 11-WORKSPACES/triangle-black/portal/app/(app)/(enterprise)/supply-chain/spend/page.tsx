"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtK = (n: any) => Number(n||0)>=1000?`${(Number(n)/1000).toFixed(0)}K`:String(Math.round(n||0));
const COLORS = ["#B9924C","#547C4D","#A84A3D","#B07A2A","#5B7C8C","#8D7443"];

const WarmTooltip = ({active,payload,label}: any) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="tb-section shadow-lg" style={{padding:"10px 14px"}}>
      {label&&<div className="text-xs text-tertiary mb-1">{label}</div>}
      {payload.map((p: any, i: number) =><div key={i} className="text-sm font-bold" style={{color:p.color||"var(--color-text-1)"}}>{p.name}: {fmtEGP(p.value)}</div>)}
    </div>
  );
};

export default function SpendAnalyticsPage() {
  const router = useRouter();
  const { data: proc, isLoading } = useQuery({queryKey:["spend-proc"],queryFn:()=>authFetch("/api/v1/procurement/dashboard").then(r => (r as any).data ?? r),staleTime:60000});
  const { data: finDash } = useQuery({queryKey:["spend-fin"],queryFn:()=>authFetch("/api/v1/financial/dashboard").then(r => (r as any).data ?? r),staleTime:60000});

  const sow = proc?.sow||{};
  const vendors = proc?.vendors||{};
  const rfqs = proc?.rfqs||{};
  const pos = proc?.pos||{};
  const grns = proc?.grns||{};
  const costs = finDash?.costs||{};

  const spendBreakdown = [{name:"PO Spend",value:Number(pos.total_value||0)},{name:"Labor",value:Number(costs.total_labor||0)},{name:"Materials",value:Number(costs.total_materials||0)},{name:"Overhead",value:Number(costs.total_overhead_profit||0)}].filter((d: any) =>d.value>0);
  const procPipeline = [{name:"SOWs",value:sow.total||0,fill:"#B9924C"},{name:"RFQs",value:rfqs.total||0,fill:"#5B7C8C"},{name:"POs",value:pos.total||0,fill:"#547C4D"},{name:"GRNs",value:grns.total||0,fill:"#8D7443"}];
  const AXIS = {fontSize:11,fill:"var(--color-text-3)"};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Spend Analytics</h1>
              <p className="tb-hero-description">Procurement spend · Vendor performance · Pipeline overview</p>
            </div>
            <button onClick={()=>router.push("/supply-chain")} className="tb-btn tb-btn-secondary">← Supply Chain</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand" style={{fontSize:"15px"}}>{fmtEGP(pos.total_value||0)}</div><div className="tb-hero-kpi-label">PO Spend</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{pos.total||0}</div><div className="tb-hero-kpi-label">Purchase Orders</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{vendors.approved||0}</div><div className="tb-hero-kpi-label">Active Vendors</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{rfqs.total||0}</div><div className="tb-hero-kpi-label">RFQs Issued</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-grid-2 mb-4">
          <div className="tb-section">
            <div className="tb-section-title">Procurement Pipeline</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={procPipeline} margin={{top:10,right:10,left:10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <Tooltip content={({active,payload,label})=>{if(!active||!payload?.length) return null;return<div className="tb-section shadow-lg" style={{padding:"8px 12px"}}><div className="text-xs text-tertiary">{label}</div><div className="text-sm font-bold text-primary">{payload[0].value} items</div></div>;}} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {procPipeline.map((e: any, i: number) =><Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="tb-section">
            <div className="tb-section-title">Spend Breakdown</div>
            {spendBreakdown.length>0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={spendBreakdown} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {spendBreakdown.map((_: any, i: any) =><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<WarmTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center text-tertiary text-sm" style={{height:240}}>No spend data available</div>}
            <div className="flex flex-col gap-1.5 mt-2">
              {spendBreakdown.map((d: any, i: number) =>(
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{background:COLORS[i%COLORS.length]}} />
                    <span className="text-xs text-secondary">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold" style={{color:COLORS[i%COLORS.length]}}>{fmtEGP(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tb-grid-3">
          {[{title:"SOW Summary",data:[["Total SOWs",sow.total||0],["Approved",sow.approved||0],["Pending",sow.pending||0],["Total Value",fmtEGP(sow.total_value||0)]]},{title:"Vendor Summary",data:[["Total Vendors",vendors.total||0],["Approved",vendors.approved||0],["Avg Rating",(vendors.avg_rating||0).toFixed(1)+" ★"]]},{title:"GRN Summary",data:[["Total GRNs",grns.total||0],["Received",grns.received||0],["Pending",grns.pending||0]]}].map(({title,data},i)=>(
            <div key={i} className="tb-section">
              <div className="tb-section-title">{title}</div>
              {data.map(([label,value],j)=>(
                <div key={j} className="tb-detail-row">
                  <span className="tb-detail-key">{label}</span>
                  <span className="tb-detail-value">{value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="tb-section mt-4">
          <div className="tb-section-title">Quick Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {[{label:"Purchase Orders",path:"/supply-chain/purchase-orders-v2",icon:"📋"},{label:"RFQ Management",path:"/supply-chain/rfq-management",icon:"📨"},{label:"Invoice Matching",path:"/supply-chain/invoice-matching",icon:"🧾"},{label:"Vendor Management",path:"/supply-chain/vendor-management",icon:"🏢"},{label:"Stock Balances",path:"/supply-chain/stock-balances",icon:"📦"},{label:"Goods Receipts",path:"/supply-chain/goods-receipts",icon:"✅"}].map((a: any, i: number) =>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item">
                <span>{a.icon}</span><span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
