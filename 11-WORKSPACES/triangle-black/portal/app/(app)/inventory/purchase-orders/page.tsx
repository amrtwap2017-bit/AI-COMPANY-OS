// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import {serviceOpsApi,  inventoryApi } from "@/lib/api";

const STATUS = { draft:"bg-gray-100 text-gray-600", approved:"bg-green-100 text-green-700", sent:"bg-blue-100 text-blue-700", received:"bg-purple-100 text-purple-700", closed:"bg-slate-100 text-slate-500", cancelled:"bg-red-100 text-red-700" };
const EGP = (n) => new Intl.NumberFormat("en-EG",{style:"currency",currency:"EGP",maximumFractionDigits:0}).format(n||0);

export default function PurchaseOrdersPage() {
  const [pos, setPos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]   = useState("");

  const safe = (d) => Array.isArray(d) ? d : (d && d.items) ? d.items : [];
  const load = () => serviceOpsApi.purchaseOrders.getPurchaseOrders().then(d => setPos(safe(d))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    const res = await serviceOpsApi.purchaseOrders.approvePO(id);
    setMsg("PO approved: " + (res.po_number || id));
    load();
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B4B]">Purchase Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{pos.length} orders</p>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">✅ {msg}</div>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div>
          : pos.length === 0 ? <div className="p-8 text-center text-gray-400">No purchase orders yet. Approve a PR and convert it to create one.</div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-6 py-3">PO Number</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                    <th className="px-6 py-3 text-right">VAT</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pos.map(po => (
                    <tr key={po.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-mono text-xs text-gray-600">{po.po_number}</td>
                      <td className="px-6 py-3"><span className={"px-2 py-0.5 rounded text-xs font-medium " + (STATUS[po.status] || "bg-gray-100 text-gray-600")}>{po.status}</span></td>
                      <td className="px-6 py-3 text-right text-gray-700">{EGP(po.subtotal)}</td>
                      <td className="px-6 py-3 text-right text-gray-500">{EGP(po.vat_amount)}</td>
                      <td className="px-6 py-3 text-right font-semibold text-[#1B2B4B]">{EGP(po.total_amount)}</td>
                      <td className="px-6 py-3 text-xs text-gray-500">{new Date(po.created_at).toLocaleDateString("en-GB")}</td>
                      <td className="px-6 py-3">
                        {po.status === "draft" && (
                          <button onClick={() => handleApprove(po.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Approve</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}
