"use client";
import { useEffect, useState } from "react";
import {serviceOpsApi,  inventoryApi } from "@/lib/api";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vendor_code:"", name:"", category:"HVAC",
    contact_person:"", phone:"", email:"",
    payment_terms:"net30", lead_time_days:7,
  });

  const load = () => serviceOpsApi.vendors.getVendors()
    .then(setVendors).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await serviceOpsApi.vendors.createVendor(form);
    setShowForm(false);
    setForm({ vendor_code:"", name:"", category:"HVAC",
              contact_person:"", phone:"", email:"", payment_terms:"net30", lead_time_days:7 });
    load();
  };

  const stars = (n: number) => "★".repeat(Math.min(n, 5)) + "☆".repeat(5 - Math.min(n, 5));

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B4B]">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">{vendors.length} vendors registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#1B2B4B] text-white rounded-lg text-sm font-medium hover:bg-[#152239]">
          + Add Vendor
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#1B2B4B]">New Vendor</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key:"vendor_code",    label:"Vendor Code" },
              { key:"name",           label:"Company Name" },
              { key:"category",       label:"Category" },
              { key:"contact_person", label:"Contact Person" },
              { key:"phone",          label:"Phone" },
              { key:"email",          label:"Email" },
              { key:"payment_terms",  label:"Payment Terms" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B2B4B]" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Lead Time (days)</label>
              <input type="number" value={form.lead_time_days}
                onChange={e => setForm(f => ({ ...f, lead_time_days: parseInt(e.target.value) || 7 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B2B4B]" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate}
              className="px-5 py-2 bg-[#1B2B4B] text-white rounded-lg text-sm font-medium hover:bg-[#152239]">
              Save Vendor
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : vendors.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-gray-400 text-sm">No vendors yet.</div>
        ) : (
          vendors.map((v: any) => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{v.name}</p>
                  <p className="text-xs font-mono text-gray-400">{v.vendor_code}</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                  {v.category || "General"}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                {v.contact_person && <p>👤 {v.contact_person}</p>}
                {v.phone          && <p>📞 {v.phone}</p>}
                {v.email          && <p>✉️ {v.email}</p>}
                <p>💳 {v.payment_terms} · ⏱ {v.lead_time_days}d lead time</p>
              </div>
              {v.rating && (
                <p className="mt-2 text-amber-500 text-sm">{stars(v.rating)}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
