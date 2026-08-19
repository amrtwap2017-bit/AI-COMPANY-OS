"use client";
// @ts-nocheck
import DocumentsPanel from "@/components/documents/DocumentsPanel";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const STARS = (r: any) => { const s=Math.round(r||0); return "★".repeat(s)+"☆".repeat(5-s); };
export default function VendorDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: vendor, isLoading } = useQuery(
    ["vendor-detail", id],
    () => authFetch(`/api/v1/vendors/${id}`).then(r=>r.json()),
    { staleTime: 30000 }
  );
  const { data: docStatus } = useQuery(
    ["vendor-doc-status", id],
    () => authFetch(`/api/v1/vendors/${id}/doc-status`).then(r=>r.json()),
    { staleTime: 30000, enabled: !!id }
  );
  const approveMut = useMutation(
    () => authFetch(`/api/v1/vendors/${id}`, {
      method: "PATCH", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ is_approved: true, approved_by: "amr@triangleblack.com" })
    }).then(r=>r.json()),
    { onSuccess: () => qc.invalidateQueries(["vendor-detail", id]) }
  );
  const deleteMut = useMutation(
    () => authFetch(`/api/v1/vendors/v2/${id}`, { method: "DELETE" }),
    { onSuccess: () => router.push("/supply-chain/vendor-management") }
  );

    if (isLoading) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-secondary text-sm animate-pulse">Loading vendor…</div></div>;
  if (!vendor || vendor.error) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="text-tertiary">Vendor not found</div></div>;
  const pos = vendor.purchase_orders || [];
  const totalPOValue = pos.reduce((s: any, p: any) =>s+Number(p.total_amount||0),0);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <button onClick={()=>router.push("/supply-chain/vendor-management")} className="tb-btn-secondary">← Vendors</button>
            <button
              onClick={()=>{ if(window.confirm("Delete this vendor? This cannot be undone.")) deleteMut.mutate(); }}
              disabled={deleteMut.isLoading}
              className="tb-btn-secondary"
              style={{borderColor:"#A84A3D",color:"#A84A3D",fontSize:"0.75rem"}}>
              {deleteMut.isLoading?"Deleting…":"🗑 Delete"}
            </button>
            {!vendor.is_approved && (
              <button onClick={()=>approveMut.mutate()} className="tb-btn-primary" style={{background:"#16A34A"}}>✓ Approve Vendor</button>
            )}
          </div>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-base-alt flex items-center justify-center text-xl font-black text-secondary flex-shrink-0">
              {(vendor.company_name||"?").charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-label-upper text-emerald-400 mb-1">Vendor</div>
              <h1 className="tb-hero-title mb-1">{vendor.company_name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="tb-badge">{vendor.category}</span>
                <span className="text-xs text-tertiary">{vendor.vendor_code}</span>
                <span className="text-xs" style={{color:"#B07A2A"}}>{STARS(vendor.rating)} {Number(vendor.rating||0).toFixed(1)}</span>
                <span className="tb-badge" style={{background:vendor.is_approved?"#547C4D18":"#A84A3D18",color:vendor.is_approved?"#547C4D":"#A84A3D"}}>{vendor.is_approved?"Approved":"Pending"}</span>
                {docStatus && !docStatus.approval_ready && (
                  <span className="tb-badge" style={{background:"#A84A3D18",color:"#A84A3D",fontSize:"0.45rem"}}>
                    ⚠ Missing: {(docStatus.missing_required||[]).join(", ")}
                  </span>
                )}
                {docStatus?.approval_ready && (
                  <span className="tb-badge" style={{background:"#547C4D18",color:"#547C4D",fontSize:"0.45rem"}}>📋 Docs Complete</span>
                )}
              </div>
            </div>
          </div>
          <div className="tb-grid-4">
            {[
              {label:"Total POs",value:pos.length,color:"#5B7C8C"},
              {label:"Total Value",value:fmtEGP(totalPOValue),color:"#547C4D"},
              {label:"Rating",value:`${Number(vendor.rating||0).toFixed(1)}/5`,color:"#B07A2A"},
              {label:"Payment Terms",value:`${vendor.payment_terms||30} days`,color:"#8D7443"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="flex gap-2 mb-4">
          {["overview","pos","banking","documents"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={"tb-pill "+(activeTab===tab?"tb-pill--active":"")}>
              {tab==="overview"?"Overview":tab==="pos"?"Purchase Orders":tab==="banking"?"Banking":"Documents"}
            </button>
          ))}
        </div>
        {activeTab === "overview" && (
          <div className="tb-section space-y-2">
            <div className="tb-section-title">Vendor Information</div>
            {[
              {label:"Contact Person",value:vendor.contact_person},
              {label:"Email",value:vendor.email},
              {label:"Phone",value:vendor.phone},
              {label:"City",value:`${vendor.city||"—"}, ${vendor.country||"Egypt"}`},
              {label:"Address",value:vendor.address},
              {label:"Tax ID",value:vendor.tax_id},
              {label:"Commercial Reg.",value:vendor.commercial_reg},
              {label:"Currency",value:vendor.currency||"EGP"},
              {label:"Approved By",value:vendor.approved_by},
              {label:"Approved At",value:fmtDate(vendor.approved_at)},
              {label:"Notes",value:vendor.notes},
            ].map((row,i)=>row.value&&(
              <div key={i} className="flex gap-4 py-2 border-b border-border">
                <span className="text-xs text-tertiary w-36 flex-shrink-0">{row.label}</span>
                <span className="text-sm text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "pos" && (
          <div className="tb-section">
            <div className="tb-section-title">Purchase Order History</div>
            {pos.length === 0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">📦</div><div className="tb-empty-title">No POs yet</div></div>
            ) : (
              <div className="space-y-2 mt-2">
                {pos.map((po,i)=>(
                  <button key={i} onClick={()=>router.push("/supply-chain/purchase-orders-v2/"+po.id)} className="w-full flex items-center gap-4 p-3 rounded-xl bg-base-alt hover:bg-surface border border-transparent hover:border-border transition-colors text-left">
                    <div className="flex-1"><div className="text-sm font-semibold text-primary">{po.po_number||po.id?.slice(0,12)}</div><div className="text-xs text-tertiary">{po.title}</div></div>
                    <div className="text-sm font-bold text-emerald-400">{fmtEGP(po.total_amount||0)}</div>
                    <span className="tb-badge text-xs">{po.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "banking" && (
          <div className="tb-section space-y-2">
            <div className="tb-section-title">Banking Details</div>
            {[
              {label:"Bank Name",value:vendor.bank_name},
              {label:"Account No.",value:vendor.bank_account},
              {label:"IBAN",value:vendor.bank_iban},
            ].map((row,i)=>(
              <div key={i} className="flex gap-4 py-2 border-b border-border">
                <span className="text-xs text-tertiary w-36 flex-shrink-0">{row.label}</span>
                <span className="text-sm text-primary">{row.value||"Not provided"}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "documents" && (
          <DocumentsPanel
            entityType="vendor"
            entityId={id as string}
            title="Vendor Documents"
            categories={["trade_license","commercial_reg","tax_card","bank_letter","iso_cert","insurance","portfolio","nda","other"]}
          />
        )}
      </div>
    </div>
  );
}
