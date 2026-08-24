"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionCard } from "@/components/ui/SectionCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { DataTable } from "@/components/ui/DataTable";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();

export default function ScopeOfWorkPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [showNewSOW, setShowNewSOW] = useState(false);
  const [newSOW, setNewSOW] = useState({title:"",type:"service",client_name:"",currency:"EGP",estimated_days:7,labor_cost:0,materials_cost:0,overhead_pct:15,profit_margin_pct:10});

  const { data: raw, isLoading } = useQuery(["sow-list"],()=>authFetch("/api/v1/scope-of-work/").then(r => (r as any).data ?? r),{staleTime:60000});
  const sows = toArr(raw);
  const filtered = filter==="all"?sows:sows.filter((s: any) =>s.status===filter);

  const createSOW = useMutation(
    (payload)=>authFetch("/api/v1/scope-of-work/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r => (r as any).data ?? r),
    {onSuccess:(data)=>{if(data.id||data.sow_number){toast.success("Scope of Work created");setShowNewSOW(false);setNewSOW({title:"",type:"service",client_name:"",currency:"EGP",estimated_days:7,labor_cost:0,materials_cost:0,overhead_pct:15,profit_margin_pct:10});qc.invalidateQueries(["sow-list"]);}else{toast.error(data.detail||"Failed to create SOW");}},onError:()=>toast.error("Connection error")}
  );

  const handleExport = () => {
    import("@/lib/hooks/useAuthFetch").then(m => m.authFetch("/api/v1/export/scope-of-work")).then(r=>r.blob()).then(blob=>{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="scope-of-work.csv";a.click();});
  };

  const columns = [
    {key:"title",label:"SOW / Title",render:(row)=><div><div className="font-semibold text-primary text-sm">{row.title}</div><div className="text-xs text-tertiary">{row.sow_number||"—"}</div></div>},
    {key:"sow_type",label:"Type",render:(row)=><span className="tb-badge tb-badge-neutral capitalize">{row.sow_type||"service"}</span>},
    {key:"status",label:"Status",render:(row)=><StatusBadge status={row.status} />},
    {key:"client_name",label:"Client",render:(row)=><span className="text-sm text-secondary">{row.client_name||"—"}</span>},
    {key:"total_cost",label:"Total Cost",align:"right",render:(row)=><span className="font-bold text-success">{fmtEGP(row.total_cost||0)}</span>},
    {key:"created_at",label:"Date",align:"right",render:(row)=><span className="text-xs text-tertiary">{fmtDate(row.created_at)}</span>},
  ];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Scope of Work</h1>
              <p className="tb-hero-description">{sows.length} documents · BOQ &amp; cost estimates</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={handleExport} className="tb-btn tb-btn-secondary tb-btn-sm">⬇ Export CSV</button>
              <button onClick={()=>setShowNewSOW(true)} className="tb-btn tb-btn-primary">+ New SOW</button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            <KpiCard label="Total SOWs" value={sows.length} color="slate" icon="📋" />
            <KpiCard label="Draft" value={sows.filter((s: any) =>s.status==="draft").length} color="slate" icon="✏️" />
            <KpiCard label="Pending" value={sows.filter((s: any) =>s.status==="pending_approval").length} color="amber" icon="⏳" status={sows.filter((s: any) =>s.status==="pending_approval").length>0?"warn":"neutral"} />
            <KpiCard label="Approved" value={sows.filter((s: any) =>s.status==="approved").length} color="emerald" icon="✅" status="ok" />
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <SectionCard title="Scope of Work Documents" subtitle="All SOW documents for procurement">
          <div className="tb-tabs mb-4">
            {["all","draft","pending_approval","approved","sent_to_client"].map((f: any) =>(
              <button key={f} onClick={()=>setFilter(f)} className={`tb-tab ${filter===f?"active":""}`}>
                {f==="all"?"All":f.replace(/_/g," ")}
              </button>
            ))}
          </div>
          {isLoading ? <LoadingState type="table" rows={6} /> : filtered.length===0 ? (
            <EmptyState icon="📋" title="No SOW documents"
              description={filter==="all"?"Create your first Scope of Work document":`No documents with status: ${filter.replace(/_/g," ")}`}
              action={{label:"+ New SOW",onClick:()=>setShowNewSOW(true)}} />
          ) : <DataTable columns={columns} data={filtered} onRow={(row)=>router.push(`/supply-chain/scope-of-work/${row.id}`)} keyField="id" />}
        </SectionCard>
      </div>

      {showNewSOW && (
        <div onClick={()=>setShowNewSOW(false)} className="fixed inset-0 z-modal bg-overlay flex items-center justify-center p-5" style={{backdropFilter:"blur(4px)"}}>
          <div onClick={(e: any) =>e.stopPropagation()} className="tb-section w-full shadow-xl" style={{maxWidth:"500px"}}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-primary">New Scope of Work</h2>
              <button onClick={()=>setShowNewSOW(false)} className="tb-btn-ghost text-2xl px-2">×</button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="tb-form-group">
                <label className="tb-label">Title <span className="text-danger">*</span></label>
                <input value={newSOW.title} onChange={(e: any) =>setNewSOW({...newSOW,title:e.target.value})} placeholder="e.g. HVAC Maintenance SOW" className="tb-input" />
              </div>
              <div className="tb-form-grid">
                <div className="tb-form-group">
                  <label className="tb-label">Type</label>
                  <select value={newSOW.type} onChange={(e: any) =>setNewSOW({...newSOW,type:e.target.value})} className="tb-select">
                    {["service","maintenance","installation","repair","inspection"].map((t: any) =><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="tb-form-group">
                  <label className="tb-label">Client</label>
                  <input value={newSOW.client_name} onChange={(e: any) =>setNewSOW({...newSOW,client_name:e.target.value})} placeholder="Client name" className="tb-input" />
                </div>
              </div>
              <div className="tb-grid-3">
                {[{label:"Labor Cost",key:"labor_cost"},{label:"Materials",key:"materials_cost"},{label:"Days",key:"estimated_days"}].map((f: any) =>(
                  <div key={f.key} className="tb-form-group">
                    <label className="tb-label">{f.label}</label>
                    <input type="number" value={newSOW[f.key]} onChange={(e: any) =>setNewSOW({...newSOW,[f.key]:Number(e.target.value)})} className="tb-input" />
                  </div>
                ))}
              </div>
              <div className="tb-action-bar mt-1">
                <button onClick={()=>{if(!newSOW.title.trim()){toast.error("Title is required");return;}createSOW.mutate({...newSOW,hotel_id:"tb-default-hotel-000000000001",status:"draft",prepared_by:"amr@triangleblack.com",total_cost:newSOW.labor_cost+newSOW.materials_cost});}} disabled={createSOW.isLoading} className="tb-btn tb-btn-primary flex-1 justify-center">
                  {createSOW.isLoading?"Creating...":"Create SOW"}
                </button>
                <button onClick={()=>setShowNewSOW(false)} className="tb-btn tb-btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
