"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtK = (n) => Number(n||0) >= 1000 ? `EGP ${(Number(n)/1000).toFixed(0)}K` : fmtEGP(n);
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

const WarmTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:10,padding:"10px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}>
      {label && <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginBottom:4,fontWeight:600}}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{fontSize:"0.875rem",fontWeight:700,color:p.color||"var(--color-text-1)"}}>
          {p.name}: {typeof p.value === "number" ? fmtEGP(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

const WARM_COLORS = ["#B9924C","#547C4D","#A84A3D","#B07A2A","#5B7C8C","#8D7443"];

export default function AnalyticsCostsPage() {
  const router = useRouter();

  const { data: finDash } = useQuery(["costs-fin"], () => authFetch("/api/v1/financial/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: timeDash } = useQuery(["costs-time"], () => authFetch("/api/v1/time-entries/summary").then(r=>r.json()), {staleTime:60000});
  const { data: procDash } = useQuery(["costs-proc"], () => authFetch("/api/v1/procurement/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: invRaw } = useQuery(["costs-inv"], () => authFetch("/api/v1/supplier-invoices/").then(r=>r.json()), {staleTime:60000});

  const rev = finDash?.revenue || {};
  const costs = finDash?.costs || {};
  const time = timeDash?.totals || {};
  const invoices = toArr(invRaw);

  // Cost breakdown pie
  const costBreakdown = [
    { name: "Labor", value: Number(costs.total_labor||0) },
    { name: "Materials", value: Number(costs.total_materials||0) },
    { name: "Overhead", value: Number(costs.total_overhead_profit||0) },
    { name: "PO Spend", value: Number(procDash?.pos?.total_value||0) },
  ].filter(d => d.value > 0);

  // Revenue vs spend bar chart
  const revenueData = [
    { name: "Invoiced", value: Number(rev.total_invoiced||0), fill: "#B9924C" },
    { name: "Collected", value: Number(rev.total_collected||0), fill: "#547C4D" },
    { name: "Outstanding", value: Number(rev.total_outstanding||0), fill: "#A84A3D" },
    { name: "Labor Cost", value: Number(time.total_labor_cost||0), fill: "#B07A2A" },
    { name: "PO Spend", value: Number(procDash?.pos?.total_value||0), fill: "#5B7C8C" },
  ];

  // Invoice status breakdown
  const invoiceByStatus = Object.entries(
    invoices.reduce((acc, inv) => {
      const s = inv.status || "unknown";
      acc[s] = (acc[s]||0) + Number(inv.total_amount||0);
      return acc;
    }, {} as Record<string,number>)
  ).map(([name, value]) => ({ name, value }));

  const kpis = [
    { label:"Total Invoiced", value:fmtEGP(rev.total_invoiced||0), color:"#B9924C" },
    { label:"Collected", value:fmtEGP(rev.total_collected||0), color:"#547C4D" },
    { label:"Outstanding", value:fmtEGP(rev.total_outstanding||0), color:"#A84A3D" },
    { label:"Labor Cost", value:fmtEGP(time.total_labor_cost||0), color:"#B07A2A" },
    { label:"Hours Logged", value:`${Math.round(time.total_hours||0)}h`, color:"#5B7C8C" },
    { label:"PO Spend", value:fmtEGP(procDash?.pos?.total_value||0), color:"#8D7443" },
  ];

  const AXIS_STYLE = {fontSize:11, fill:"var(--color-text-3)"};

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      {/* Hero */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Analytics</div>
          <h1 className="tb-hero-title">Cost Analysis</h1>
          <p className="tb-hero-description">Revenue, expenditure and financial position</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:20}}>
            {kpis.slice(0,3).map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1.1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>

        {/* Revenue vs Spend Bar Chart */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:4}}>Revenue & Spend Overview</div>
          <div style={{fontSize:"0.8125rem",color:"var(--color-text-3)",marginBottom:20}}>Financial position at a glance</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData} margin={{top:0,right:0,bottom:0,left:20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip content={<WarmTooltip />} />
              <Bar dataKey="value" name="Amount" radius={[6,6,0,0]}>
                {revenueData.map((entry,i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown Pie */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:4}}>Cost Breakdown</div>
          <div style={{fontSize:"0.8125rem",color:"var(--color-text-3)",marginBottom:20}}>Where money is being spent</div>
          {costBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={costBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                  {costBreakdown.map((entry,i) => <Cell key={i} fill={WARM_COLORS[i % WARM_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<WarmTooltip />} />
                <Legend formatter={(v) => <span style={{color:"var(--color-text-2)",fontSize:"0.8125rem"}}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:280,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--color-text-3)"}}>No cost data available</div>
          )}
        </div>

        {/* KPI Summary */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Financial Summary</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {kpis.map((k,i)=>(
              <div key={i} style={{padding:"12px 16px",background:"var(--color-bg-alt)",borderRadius:10,border:"1px solid var(--color-border)"}}>
                <div style={{fontSize:"1.25rem",fontWeight:800,color:k.color}}>{k.value}</div>
                <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:2}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Status */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:4}}>Invoice Status</div>
          <div style={{fontSize:"0.8125rem",color:"var(--color-text-3)",marginBottom:20}}>Amount by invoice status</div>
          {invoiceByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={invoiceByStatus} layout="vertical" margin={{left:40}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tickFormatter={fmtK} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <Tooltip content={<WarmTooltip />} />
                <Bar dataKey="value" name="Amount" fill="#B9924C" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--color-text-3)"}}>No invoice data</div>
          )}
        </div>
      </div>
    </div>
  );
}
