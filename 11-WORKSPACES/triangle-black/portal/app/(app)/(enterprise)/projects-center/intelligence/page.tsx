"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const COLORS = ["#B9924C","#547C4D","#A84A3D","#B07A2A","#5B7C8C","#8D7443"];

const WarmTooltip = ({active,payload,label}: any) => {
  if (!active||!payload?.length) return null;
  return <div className="tb-section shadow-lg" className="px-3 py-2">{label&&<div className="text-xs text-tertiary mb-1">{label}</div>}{payload.map((p: any, i: number) =><div key={i} className="text-sm font-bold text-primary">{p.value}</div>)}</div>;
};

export default function ProjectsIntelligencePage() {
  const router = useRouter();
  const { data: raw, isLoading } = useQuery({queryKey:["proj-intel"],queryFn:()=>authFetch("/api/v1/projects-portal").then(r => (r as any).data ?? r),staleTime:60000});
  const projects = toArr(raw);

  const byStatus = Object.entries(projects.reduce((acc: any, p: any) =>{acc[p.status||"unknown"]=(acc[p.status||"unknown"]||0)+1;return acc;},{})).map(([name,value])=>({name,value}));
  const avgCompletion = projects.length>0?Math.round(projects.reduce((s: any, p: any) =>s+(p.completion_pct||0),0)/projects.length):0;
  const totalBudget = projects.reduce((s: any, p: any) =>s+Number(p.budget||0),0);
  const overdue = projects.filter((p: any) =>p.end_date&&new Date(p.end_date)<new Date()&&p.status!=="completed").length;
  const AXIS = {fontSize:11,fill:"var(--color-text-3)"};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Projects Center</div>
              <h1 className="tb-hero-title">Projects Intelligence</h1>
              <p className="tb-hero-description">Portfolio analytics · Status distribution · Budget insights</p>
            </div>
            <button onClick={()=>router.push("/projects-center")} className="tb-btn tb-btn-secondary">← Projects</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{projects.length}</div><div className="tb-hero-kpi-label">Total Projects</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:avgCompletion>=70?"var(--color-success)":"var(--color-warning)"}}>{avgCompletion}%</div><div className="tb-hero-kpi-label">Avg Completion</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:overdue>0?"var(--color-danger)":"var(--color-success)"}}>{overdue}</div><div className="tb-hero-kpi-label">Overdue</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand" style={{fontSize:"14px"}}>{fmtEGP(totalBudget)}</div><div className="tb-hero-kpi-label">Portfolio Budget</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-grid-2 mb-4">
          <div className="tb-section">
            <div className="tb-section-title">Projects by Status</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byStatus} margin={{top:10,right:10,left:10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false}/>
                <YAxis tick={AXIS} axisLine={false} tickLine={false}/>
                <Tooltip content={<WarmTooltip/>}/>
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {byStatus.map((_: any, i: any) =><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="tb-section">
            <div className="tb-section-title">Portfolio Health</div>
            {[["Total Projects",projects.length,"var(--color-text-1)"],["Active",projects.filter((p: any) =>["active","in_progress"].includes(p.status)).length,"var(--color-info)"],["Completed",projects.filter((p: any) =>p.status==="completed").length,"var(--color-success)"],["On Hold",projects.filter((p: any) =>p.status==="on_hold").length,"var(--color-warning)"],["Overdue",overdue,overdue>0?"var(--color-danger)":"var(--color-success)"],["Avg Completion",`${avgCompletion}%`,avgCompletion>=70?"var(--color-success)":"var(--color-warning)"],["Total Budget",fmtEGP(totalBudget),"var(--color-brand)"]].map(([label,value,color],i)=>(
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key">{label}</span>
                <span className="tb-detail-value font-bold" style={{color}}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tb-section">
          <div className="flex justify-between items-center mb-4">
            <div className="tb-section-title" className="m-0">Top Projects by Completion</div>
            <button onClick={()=>router.push("/projects-center/list")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">View All →</button>
          </div>
          {projects.sort((a: any, b: any) =>(b.completion_pct||0)-(a.completion_pct||0)).slice(0,8).map((p: any, i: number) =>(
            <button key={i} onClick={()=>router.push(`/projects-center/${p.id}`)}
              className="flex items-center gap-3 py-2 border-b border-divider w-full text-left bg-transparent cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-primary truncate">{p.title}</div>
              </div>
              <div className="flex items-center gap-2" style={{minWidth:"140px"}}>
                <div className="tb-progress flex-1">
                  <div className="tb-progress-bar" style={{width:`${p.completion_pct||0}%`,background:(p.completion_pct||0)>=80?"var(--color-success)":"var(--color-brand)"}} />
                </div>
                <span className="text-xs font-bold text-secondary" style={{minWidth:"30px"}}>{p.completion_pct||0}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
