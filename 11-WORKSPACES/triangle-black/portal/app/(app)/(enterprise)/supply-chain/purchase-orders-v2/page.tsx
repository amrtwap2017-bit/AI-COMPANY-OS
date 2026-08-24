"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => "EGP " + Number(n || 0).toLocaleString();

const EMPTY_FORM = { vendor_id:"", title:"", rfq_id:"", currency:"EGP", total_amount:"", payment_terms:30, delivery_address:"", internal_notes:"" };

export default function PurchaseOrdersV2Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [showNewPO, setShowNewPO] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  const { data: rawPOs, isLoading } = useQuery({ queryKey:["pos-v2-list"], queryFn:()=>authFetch("/api/v1/purchase-orders-v2/").then(r => (r as any).data ?? r), staleTime:60000 });
  const { data: rawVendors } = useQuery({ queryKey:["vendors-dropdown"], queryFn:()=>authFetch("/api/v1/vendors/").then(r => (r as any).data ?? r), staleTime:300000 });
  const { data: rawRFQs } = useQuery({ queryKey:["rfqs-dropdown"], queryFn:()=>authFetch("/api/v1/rfq/").then(r => (r as any).data ?? r), staleTime:300000 });

  const pos = toArr(rawPOs);
  const vendors = toArr(rawVendors).filter((v: any) => !v.deleted_at && v.is_approved !== false);
  const rfqs = toArr(rawRFQs).filter((r: any) => ["open","draft","awarded"].includes(r.status));
  const filtered = filter === "all" ? pos : pos.filter((p: any) => p.status === filter);
  const totalValue = pos.reduce((s: any, p: any) => s + Number(p.total_amount||0), 0);
  const approved = pos.filter((p: any) => p.status === "approved").length;
  const pending = pos.filter((p: any) => p.status === "pending_approval").length;

  const createPO = useMutation({
    mutationFn: (payload) => authFetch("/api/v1/purchase-orders-v2/", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) }).then(r => (r as any).data ?? r),
    onSuccess: (data) => {
      if (data?.id || data?.po_number) {
        toast.success(`Purchase Order ${data.po_number||""} created`);
        qc.invalidateQueries(["pos-v2-list"]);
        setShowNewPO(false); setForm({...EMPTY_FORM}); setErrors({});
        if (data.id) router.push(`/supply-chain/purchase-orders-v2/${data.id}`);
      } else { toast.error(data?.detail || data?.error || "Failed to create PO"); }
    },
    onError: () => toast.error("Network error — please try again"),
  });

  const handleSubmit = () => {
    const e: Record<string, any> = {};
    if (!form.vendor_id) e.vendor_id = "Vendor is required";
    if (!form.title.trim()) e.title = "Title is required";
    if (Object.keys(e).length) { setErrors(e); return; }
    createPO.mutate({ vendor_id:form.vendor_id, title:form.title.trim(), rfq_id:form.rfq_id||null, currency:form.currency||"EGP", total_amount:parseFloat(form.total_amount)||0, payment_terms:parseInt(form.payment_terms)||30, delivery_address:form.delivery_address||"", internal_notes:form.internal_notes||"" });
  };

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); if (errors[k]) setErrors(e=>{const n={...e};delete n[k];return n;}); };

  return (
    <div className="min-h-screen bg-base">

      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Purchase Orders</h1>
              <p className="tb-hero-description">Procurement lifecycle · Vendor commitments · Multi-currency</p>
            </div>
            <button onClick={() => setShowNewPO(true)} className="tb-btn tb-btn-primary tb-btn-lg">+ New PO</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{pos.length}</div><div className="tb-hero-kpi-label">Total POs</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-warning)"}}>{pending}</div><div className="tb-hero-kpi-label">Pending</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{approved}</div><div className="tb-hero-kpi-label">Approved</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand" style={{fontSize:"16px"}}>{fmtEGP(totalValue)}</div><div className="tb-hero-kpi-label">Total Value</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-tabs">
          {["all","draft","pending_approval","approved","sent","received","paid","cancelled"].map((f: any) => (
            <button key={f} onClick={() => setFilter(f)} className={`tb-tab ${filter === f ? "active" : ""}`}>
              {f === "all" ? "All" : f.replace(/_/g," ")}
              {f !== "all" && <span className="ml-1 opacity-60">{pos.filter((p: any) =>p.status===f).length}</span>}
            </button>
          ))}
        </div>

        <div className="tb-section">
          <div className="flex justify-between items-center mb-4">
            <div className="tb-section-title" style={{margin:0}}>
              Purchase Orders
              <span className="ml-2 text-sm font-normal text-tertiary">{filtered.length} of {pos.length}</span>
            </div>
            <span className="text-sm font-bold text-brand">{fmtEGP(filtered.reduce((s: any, p: any) =>s+Number(p.total_amount||0),0))}</span>
          </div>

          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState icon="📦" title="No purchase orders"
              description={filter !== "all" ? `No POs with status "${filter.replace(/_/g," ")}"` : "Create your first purchase order"}
              action={{ label:"Create PO", onClick:()=>setShowNewPO(true) }} />
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead>
                  <tr><th>PO / Vendor</th><th>Status</th><th style={{textAlign:"right"}}>Amount</th><th>Currency</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {filtered.map((po: any) => (
                    <tr key={po.id} onClick={() => router.push(`/supply-chain/purchase-orders-v2/${po.id}`)} className="cursor-pointer">
                      <td>
                        <div className="font-semibold text-sm text-primary">{po.po_number || po.id?.slice(0,12)}</div>
                        <div className="text-xs text-tertiary mt-0.5">{po.vendor_name || po.title || "—"}</div>
                      </td>
                      <td><StatusBadge status={po.status || "draft"} /></td>
                      <td className="text-right font-bold text-brand">{fmtEGP(po.total_amount||0)}</td>
                      <td className="text-sm text-secondary">{po.currency || "EGP"}</td>
                      <td className="text-sm text-tertiary">{fmtDate(po.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showNewPO && (
        <div onClick={() => setShowNewPO(false)}
          className="fixed inset-0 z-modal bg-overlay flex items-center justify-center p-6"
          style={{backdropFilter:"blur(4px)"}}>
          <div onClick={(e: any) => e.stopPropagation()}
            className="tb-section w-full shadow-xl"
            style={{maxWidth:"560px",maxHeight:"90vh",overflowY:"auto",borderRadius:"16px"}}>

            <div className="flex justify-between items-start pb-4 mb-4 border-b border-default">
              <div>
                <h2 className="text-lg font-bold text-primary">New Purchase Order</h2>
                <p className="text-xs text-tertiary mt-1">PO number will be auto-generated</p>
              </div>
              <button onClick={() => setShowNewPO(false)} className="tb-btn-ghost text-xl px-2">✕</button>
            </div>

            <div className="tb-form-group mb-4">
              <label className="tb-label">Vendor <span className="text-danger">*</span></label>
              <select value={form.vendor_id} onChange={(e: any) =>set("vendor_id",e.target.value)}
                className="tb-select" style={errors.vendor_id?{borderColor:"var(--color-danger)"}:{}}>
                <option value="">— Select vendor —</option>
                {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.company_name} · {v.category}</option>)}
              </select>
              {errors.vendor_id && <p className="text-xs text-danger mt-1">{errors.vendor_id}</p>}
            </div>

            <div className="tb-form-group mb-4">
              <label className="tb-label">Title <span className="text-danger">*</span></label>
              <input value={form.title} onChange={(e: any) =>set("title",e.target.value)}
                placeholder="e.g. HVAC Spare Parts Q3 2026" className="tb-input"
                style={errors.title?{borderColor:"var(--color-danger)"}:{}} />
              {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
            </div>

            <div className="tb-form-group mb-4">
              <label className="tb-label">Linked RFQ <span className="text-xs font-normal text-tertiary">(optional)</span></label>
              <select value={form.rfq_id} onChange={(e: any) =>set("rfq_id",e.target.value)} className="tb-select">
                <option value="">— No linked RFQ —</option>
                {rfqs.map((r: any) => <option key={r.id} value={r.id}>{r.rfq_number} · {(r.title||"").slice(0,40)}</option>)}
              </select>
            </div>

            <div className="tb-form-grid mb-4" style={{gridTemplateColumns:"1fr 2fr"}}>
              <div className="tb-form-group">
                <label className="tb-label">Currency</label>
                <select value={form.currency} onChange={(e: any) =>set("currency",e.target.value)} className="tb-select">
                  {["EGP","USD","EUR","AED","SAR"].map((c: any) =><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Total Amount</label>
                <input type="number" value={form.total_amount} onChange={(e: any) =>set("total_amount",e.target.value)} placeholder="0.00" min="0" className="tb-input" />
              </div>
            </div>

            <div className="tb-form-group mb-4">
              <label className="tb-label">Payment Terms (days)</label>
              <select value={form.payment_terms} onChange={(e: any) =>set("payment_terms",e.target.value)} className="tb-select">
                {[7,14,30,45,60,90].map((d: any) =><option key={d} value={d}>Net {d} days</option>)}
              </select>
            </div>

            <div className="tb-form-group mb-4">
              <label className="tb-label">Delivery Address</label>
              <input value={form.delivery_address} onChange={(e: any) =>set("delivery_address",e.target.value)} placeholder="e.g. Nile Plaza Hotel, Garden City, Cairo" className="tb-input" />
            </div>

            <div className="tb-form-group mb-6">
              <label className="tb-label">Internal Notes</label>
              <textarea value={form.internal_notes} onChange={(e: any) =>set("internal_notes",e.target.value)} placeholder="Any internal notes or special instructions..." rows={3} className="tb-input" style={{resize:"vertical",fontFamily:"inherit"}} />
            </div>

            <div className="tb-action-bar justify-end">
              <button onClick={()=>{setShowNewPO(false);setForm({...EMPTY_FORM});setErrors({});}} className="tb-btn tb-btn-secondary">Cancel</button>
              <button onClick={handleSubmit} disabled={createPO.isLoading} className="tb-btn tb-btn-primary">
                {createPO.isLoading ? "Creating..." : "Create Purchase Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
