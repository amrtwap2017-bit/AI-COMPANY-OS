"use client";
// @ts-nocheck
// Triangle Black — Supplier Create
// Sprint-041: Supplier Create Form
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { toast } from "sonner";

const PAYMENT_TERMS = ["net_15","net_30","net_45","net_60","net_90","cash","advance"];
const RISK_LEVELS   = ["low","medium","high","critical"];
const SUPPLIER_TYPES = ["electrical","mechanical","civil","hvac","plumbing","it","general","cleaning","security"];
const CATEGORIES     = ["electrical","mechanical","civil","hvac","plumbing","it","general","cleaning","security","catering"];

export default function SupplierNewPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    company_name:   "",
    arabic_name:    "",
    supplier_code:  "",
    supplier_type:  "general",
    category:       "general",
    email:          "",
    phone:          "",
    contact_person: "",
    city:           "Cairo",
    country:        "Egypt",
    payment_terms:  "net_30",
    lead_time_days: "14",
    risk_level:     "low",
    credit_limit:   "0",
    tax_number:     "",
    commercial_register: "",
    notes:          "",
    preferred_flag: false,
    is_approved:    false,
  });

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.company_name.trim()) { toast.error("Company name is required"); return; }
    setSaving(true);
    try {
      const res = await tbFetch("/api/v1/suppliers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lead_time_days: Number(form.lead_time_days), credit_limit: Number(form.credit_limit) }),
      });
      const data = await res.json();
      if (data.id || data.ok) {
        toast.success(`Supplier "${form.company_name}" created`);
        router.push(`/supply-chain/suppliers/${data.id}`);
      } else {
        toast.error(data.detail || "Creation failed");
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  if (!mounted) return null;

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.push("/supply-chain/suppliers")}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          ← Suppliers
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-1)]">New Supplier</h1>
        <p className="text-gray-500 text-sm mt-1">Register a new supplier in the system</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[var(--color-text-1)]">Company Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Name (English) *</label>
              <input value={form.company_name} onChange={set("company_name")} required
                placeholder="ABB Egypt Limited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Arabic Name</label>
              <input value={form.arabic_name} onChange={set("arabic_name")} dir="rtl"
                placeholder="اسم الشركة بالعربية"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Code</label>
              <input value={form.supplier_code} onChange={set("supplier_code")}
                placeholder="SUP-001 (auto-generated if empty)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Type</label>
              <select value={form.supplier_type} onChange={set("supplier_type")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {SUPPLIER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={set("category")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tax Number</label>
              <input value={form.tax_number} onChange={set("tax_number")} placeholder="123-456-789"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Commercial Register</label>
              <input value={form.commercial_register} onChange={set("commercial_register")}
                placeholder="CR-2024-001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[var(--color-text-1)]">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
              <input value={form.contact_person} onChange={set("contact_person")} placeholder="Ahmed Hassan"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="contact@supplier.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={set("phone")} placeholder="+20 100 000 0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={set("city")} placeholder="Cairo"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
        </div>

        {/* Commercial Terms */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[var(--color-text-1)]">Commercial Terms</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label>
              <select value={form.payment_terms} onChange={set("payment_terms")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t.replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lead Time (days)</label>
              <input type="number" min="0" value={form.lead_time_days} onChange={set("lead_time_days")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Risk Level</label>
              <select value={form.risk_level} onChange={set("risk_level")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                {RISK_LEVELS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Credit Limit (EGP)</label>
              <input type="number" min="0" value={form.credit_limit} onChange={set("credit_limit")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" id="preferred" checked={form.preferred_flag}
                onChange={set("preferred_flag")} className="rounded" />
              <label htmlFor="preferred" className="text-sm text-gray-700">Preferred Supplier</label>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" id="approved" checked={form.is_approved}
                onChange={set("is_approved")} className="rounded" />
              <label htmlFor="approved" className="text-sm text-gray-700">Pre-approved</label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={set("notes")} rows={3}
              placeholder="Specializations, certifications, any relevant notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 py-3 bg-[var(--color-bg)] text-white rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {saving ? "Creating..." : "✅ Create Supplier"}
          </button>
          <button type="button" onClick={() => router.push("/supply-chain/suppliers")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
