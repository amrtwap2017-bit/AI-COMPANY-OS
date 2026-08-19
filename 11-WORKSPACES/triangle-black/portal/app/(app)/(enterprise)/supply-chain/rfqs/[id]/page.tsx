"use client";
// @ts-nocheck
// Triangle Black — RFQ Detail
// Sprint-042: RFQ Portal
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR: Record<string,string> = {
  draft:    "bg-gray-100 text-gray-600",
  open:     "bg-blue-100 text-blue-800",
  pending:  "bg-yellow-100 text-yellow-800",
  awarded:  "bg-green-100 text-green-800",
  closed:   "bg-gray-100 text-gray-500",
  cancelled:"bg-red-100 text-red-800",
};

export default function RFQDetailPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [mounted, setMounted] = useState(false);
  const [rfq, setRfq]         = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    tbFetch(`/api/v1/rfqs/${id}`)
      .then(r => r.json())
      .then(d => setRfq(d))
      .catch(() => toast.error("Failed to load RFQ"))
      .finally(() => setLoading(false));
  }, [mounted, id]);

  const handleClose = async () => {
    if (!confirm("Close this RFQ?")) return;
    setClosing(true);
    try {
      const res = await tbFetch(`/api/v1/rfqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      const data = await res.json();
      if (data.id || res.ok) {
        toast.success("RFQ closed");
        setRfq((r: any) => ({ ...r, status: "closed" }));
      } else {
        toast.error(data.detail || "Failed to close RFQ");
      }
    } catch { toast.error("Network error"); }
    finally { setClosing(false); }
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  if (!rfq || rfq.detail) return (
    <div className="p-8 text-center text-gray-500">
      <p className="text-2xl mb-2">📋</p>
      <p>RFQ not found</p>
      <button onClick={() => router.push("/supply-chain/rfqs")}
        className="mt-4 text-sm text-gray-400 hover:text-gray-600">← RFQs</button>
    </div>
  );

  const lines = Array.isArray(rfq.lines) ? rfq.lines : [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push("/supply-chain/rfqs")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← RFQs
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">{rfq.title || rfq.rfq_number}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-sm text-gray-500">{rfq.rfq_number}</span>
            <span className="text-gray-300">·</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[rfq.status] || "bg-gray-100 text-gray-600"}`}>
              {rfq.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {rfq.status !== "closed" && rfq.status !== "cancelled" && (
            <button onClick={handleClose} disabled={closing}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50">
              {closing ? "Closing..." : "Close RFQ"}
            </button>
          )}
          <button onClick={() => router.push(`/supply-chain/rfq-management/${id}`)}
            className="px-4 py-2 bg-[var(--color-bg)] text-white rounded-lg text-sm font-medium hover:bg-gray-700">
            Manage Quotes
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Status",       value:rfq.status || "—",                  color:"bg-gray-50" },
          { label:"Required By",  value:fmtDate(rfq.required_date||rfq.due_date), color:"bg-blue-50" },
          { label:"Line Items",   value:lines.length,                        color:"bg-purple-50" },
          { label:"Created",      value:fmtDate(rfq.created_at),            color:"bg-gray-50" },
        ].map(k => (
          <div key={k.label} className={`${k.color} border border-gray-200 rounded-xl p-4`}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="text-lg font-bold text-[var(--color-text-1)] mt-1 capitalize">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-[var(--color-text-1)]">RFQ Details</h2>
          {[
            ["RFQ Number",    rfq.rfq_number],
            ["Title",         rfq.title],
            ["Category",      rfq.category],
            ["Created By",    rfq.created_by],
            ["PR Reference",  rfq.pr_id || rfq.linked_purchase_request_id],
            ["Description",   rfq.description],
          ].filter(([,v])=>v).map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm border-b border-gray-50 py-1.5">
              <span className="text-gray-400">{label}</span>
              <span className="text-[var(--color-text-1)] font-medium text-right max-w-48 truncate">{value}</span>
            </div>
          ))}
          {rfq.notes && (
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{rfq.notes}</p>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-[var(--color-text-1)] mb-3">Required Items ({lines.length})</h2>
          {lines.length === 0 ? (
            <p className="text-gray-400 text-sm">No line items defined</p>
          ) : (
            <div className="space-y-2">
              {lines.map((line: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-[var(--color-text-1)]">{line.description || line.item_name || `Item ${i+1}`}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    {line.quantity && <span>Qty: {line.quantity}</span>}
                    {line.unit && <span>Unit: {line.unit}</span>}
                    {line.estimated_price && <span>Est: {fmtEGP(line.estimated_price)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
