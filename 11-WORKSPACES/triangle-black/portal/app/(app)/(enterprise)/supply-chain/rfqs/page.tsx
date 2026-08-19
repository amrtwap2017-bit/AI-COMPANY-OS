"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];

export default function RFQsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: raw, isLoading } = useQuery({queryKey:["rfqs-list"],queryFn:()=>authFetch("/api/v1/rfqs/").then(r=>r.json())});
  const all = toArr(raw);
  const filtered = all.filter((r: any) =>{
    const ms = !search||(r.rfq_number||"").toLowerCase().includes(search.toLowerCase())||(r.title||"").toLowerCase().includes(search.toLowerCase())||(r.category||"").toLowerCase().includes(search.toLowerCase());
    return ms&&(filterStatus==="all"||r.status===filterStatus);
  });

  const open = all.filter((r: any) =>r.status==="open").length;
  const awarded = all.filter((r: any) =>r.status==="awarded").length;
  const draft = all.filter((r: any) =>r.status==="draft").length;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Request for Quotations</h1>
              <p className="tb-hero-description">Competitive bidding · Vendor selection · Procurement workflow</p>
            </div>
            <button onClick={()=>router.push("/supply-chain/rfq-management")} className="tb-btn tb-btn-primary">+ New RFQ</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{all.length}</div><div className="tb-hero-kpi-label">Total RFQs</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-info)"}}>{open}</div><div className="tb-hero-kpi-label">Open</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{awarded}</div><div className="tb-hero-kpi-label">Awarded</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-text-3)"}}>{draft}</div><div className="tb-hero-kpi-label">Draft</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <input value={search} onChange={(e: any) =>setSearch(e.target.value)} placeholder="Search RFQs..." className="tb-input" style={{minWidth:"240px",width:"auto"}} />
          <div className="tb-tabs border-0 mb-0">
            {["all","draft","open","closed","awarded","cancelled"].map((s: any) =>(
              <button key={s} onClick={()=>setFilterStatus(s)} className={`tb-tab ${filterStatus===s?"active":""}`}>
                {s==="all"?"All Statuses":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="tb-section">
          <div className="tb-section-title">RFQs <span className="ml-2 text-sm font-normal text-tertiary">{filtered.length} of {all.length}</span></div>
          {isLoading ? <TableSkeleton /> : filtered.length===0 ? (
            <EmptyState icon="📋" title="No RFQs found"
              description={search?"Try adjusting your search or filter":"Create your first RFQ to start the procurement process"}
              action={{label:"Create RFQ",onClick:()=>router.push("/supply-chain/rfq-management")}} />
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>RFQ</th><th>Category</th><th>Due Date</th><th>Created By</th><th>Status</th><th>Bids</th></tr></thead>
                <tbody>
                  {filtered.map((r: any) =>(
                    <tr key={r.id} onClick={()=>router.push(`/supply-chain/rfq-management/${r.id}`)} className="cursor-pointer">
                      <td>
                        <div className="font-semibold text-sm text-primary">{r.rfq_number||r.id?.slice(0,8)}</div>
                        <div className="text-xs text-tertiary mt-0.5">{(r.title||"Untitled RFQ").slice(0,50)}</div>
                      </td>
                      <td className="text-sm text-secondary">{r.category||"General"}</td>
                      <td className="text-sm text-secondary">{r.due_date?new Date(r.due_date).toLocaleDateString("en-GB"):r.required_date?new Date(r.required_date).toLocaleDateString("en-GB"):"—"}</td>
                      <td className="text-sm text-secondary">{r.created_by||"—"}</td>
                      <td><StatusBadge status={r.status||"draft"} /></td>
                      <td className="text-sm text-secondary">{Array.isArray(r.lines)?r.lines.length:"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
