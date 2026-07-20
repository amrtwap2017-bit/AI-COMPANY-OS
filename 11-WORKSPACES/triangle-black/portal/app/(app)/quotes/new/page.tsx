// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { quotesApi, api } from "@/lib/api";
import { Card, CardHeader } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface LineItem {
  service: string;
  qty: number;
  unit_price: number;
  total: number;
}

const SERVICE_OPTIONS = [
  { label: "HVAC Maintenance", price: 3500 },
  { label: "Electrical Systems", price: 2800 },
  { label: "Plumbing Systems", price: 2200 },
  { label: "Fire Fighting Systems", price: 1800 },
  { label: "General Engineering", price: 4500 },
  { label: "Procurement Services", price: 1500 },
  { label: "Kitchen Equipment", price: 3000 },
  { label: "Laundry Systems", price: 2500 },
  { label: "Pool Systems", price: 2000 },
];

function formatEGP(n: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency", currency: "EGP",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function NewQuotePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { service: "General Engineering", qty: 12, unit_price: 4500, total: 54000 },
  ]);

  const total = items.reduce((s, i) => s + i.total, 0);

  function addItem() {
    setItems((prev) => [...prev, { service: "HVAC Maintenance", qty: 12, unit_price: 3500, total: 42000 }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "qty" || field === "unit_price") {
        next[idx].total = Math.round(Number(next[idx].qty) * Number(next[idx].unit_price));
      }
      if (field === "service") {
        const opt = SERVICE_OPTIONS.find((o) => o.label === value);
        if (opt) {
          next[idx].unit_price = opt.price;
          next[idx].total = opt.price * next[idx].qty;
        }
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (items.length === 0) { setError("Add at least one service"); return; }
    setError(""); setLoading(true);
    try {
      const res = await api.post("/quotes/", {
        title, description: description || undefined,
        items, total,
        status: "draft",
      });
      qc.invalidateQueries({ queryKey: ["quotes"] });
      router.push(`/quotes/${res.data.id}`);
    } catch {
      setError("Failed to create quote.");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Quote</h1>

      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card>
          <CardHeader title="Quote Information" />
          <div className="space-y-4">
            <Input label="Quote Title" required value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Engineering Services Contract — Hotel Name" />
            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea id="desc" rows={2} value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of services..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>
        </Card>

        <Card padding={false}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Service Line Items</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Quote line items">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-right w-24">Months</th>
                  <th className="px-4 py-3 text-right w-36">Monthly Rate (EGP)</th>
                  <th className="px-4 py-3 text-right w-32">Total</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-50">
                    <td className="px-4 py-3">
                      <select
                        value={item.service}
                        onChange={(e) => updateItem(idx, "service", e.target.value)}
                        aria-label={`Service ${idx + 1}`}
                        className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5
                          focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        {SERVICE_OPTIONS.map((o) => (
                          <option key={o.label} value={o.label}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min={1} max={60}
                        value={item.qty}
                        onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                        aria-label={`Duration months for ${item.service}`}
                        className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5
                          text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min={0}
                        value={item.unit_price}
                        onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                        aria-label={`Unit price for ${item.service}`}
                        className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5
                          text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatEGP(item.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => removeItem(idx)}
                        aria-label={`Remove ${item.service}`}
                        className="text-gray-400 hover:text-red-500 transition-colors
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-amber-600">
                  <td colSpan={3} className="px-4 py-4 text-white font-bold text-right">
                    Annual Contract Total
                  </td>
                  <td className="px-4 py-4 text-[#F59E0B] font-bold text-right text-lg">
                    {formatEGP(total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading} size="lg">
            Create Quote (Draft)
          </Button>
        </div>
      </form>
    </div>
  );
}
