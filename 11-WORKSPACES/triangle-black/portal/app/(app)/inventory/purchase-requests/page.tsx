// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import {serviceOpsApi,  inventoryApi } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  draft:      "bg-gray-100 text-gray-600",
  approved:   "bg-green-100 text-green-700",
  rejected:   "bg-red-100 text-red-700",
  po_created: "bg-blue-100 text-blue-700",
};

const URGENCY_STYLES: Record<string, string> = {
  low:       "bg-slate-100 text-slate-600",
  normal:    "bg-blue-100 text-blue-600",
  high:      "bg-amber-100 text-amber-700",
  emergency: "bg-red-100 text-red-700",
};

export default function PurchaseRequestsPage() {
  const [prs, setPrs]         = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    requester: "", department: "Engineering",
    urgency: "normal", justification: "",
  });
  const [msg, setMsg] = useState("");

  const load = () => serviceOpsApi.purchaseRequests.getPurchaseRequests()
    .then(setPrs).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await serviceOpsApi.purchaseRequests.createPurchaseRequest({ ...form, lines: [] });
    setShowForm(false); setMsg(""); load();
  };

  const handleApprove = async (id: string) => {
    await serviceOpsApi.purchaseRequests.approvePR(id);
    load();
  };

  const handleConvert = async (id: string) => {
    const res = await serviceOpsApi.purchaseRequests.convertPRtoPO(id);
    setMsg(`✅ PO created: ${res.po_number}`);
    load();
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B4B]">Purchase Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{prs.length} requests</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#1B2B4B] text-white rounded-lg text-sm font-medium hover:bg-[#152239]">
          + New Request
        </button>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">
          {msg}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#1B2B4B]">New Purchase Request</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key:"requester",   label:"Requester" },
              { key:"department",  label:"Department" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B2B4B]" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Urgency</label>
              <select value={form.urgency}
                onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B2B4B]">
                {["low","normal","high","emergency"].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Justification</label>
              <input value={form.justification}
                onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B2B4B]" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate}
              className="px-5 py-2 bg-[#1B2B4B] text-white rounded-lg text-sm font-medium hover:bg-[#152239]">
              Submit Request
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : prs.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No purchase requests yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">PR Number</th>
                <th className="px-6 py-3 font-medium">Requester</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Urgency</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prs.map((pr: any) => (
                <tr key={pr.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-xs text-gray-600">{pr.pr_number}</td>
                  <td className="px-6 py-3 font-medium text-gray-800">{pr.requester}</td>
                  <td className="px-6 py-3 text-gray-500">{pr.department || "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize
                      ${URGENCY_STYLES[pr.urgency] ?? "bg-gray-100 text-gray-600"}`}>
                      {pr.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize
                      ${STATUS_STYLES[pr.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {pr.status.replace(/_/g," ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {new Date(pr.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      {pr.status === "draft" && (
                        <button onClick={() => handleApprove(pr.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                          Approve
                        </button>
                      )}
                      {pr.status === "approved" && (
                        <button onClick={() => handleConvert(pr.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">
                          → PO
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
