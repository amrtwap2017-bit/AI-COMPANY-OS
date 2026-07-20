// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import { Card, CardHeader } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { ArrowLeft } from "lucide-react";

export default function NewLeadPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    source: "web", priority: "medium", notes: "",
  });

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email) { setError("Name and email are required"); return; }
    setLoading(true);
    try {
      const res = await leadsApi.create({
        name: form.name, email: form.email,
        phone: form.phone || undefined, company: form.company || undefined,
        source: form.source, priority: form.priority,
        notes: form.notes || undefined,
      });
      qc.invalidateQueries({ queryKey: ["leads"] });
      router.push(`/leads/${res.data.id}`);
    } catch {
      setError("Failed to create lead. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Lead</h1>

      <Card>
        <CardHeader title="Lead Information" subtitle="Capture a new hotel engineering lead" />

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hotel / Client Name" required
              value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Marriott Sharm El Sheikh"
            />
            <Input
              label="Company / Group"
              value={form.company} onChange={(e) => set("company", e.target.value)}
              placeholder="Marriott International"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email" type="email" required
              value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder="engineering@hotel.com"
            />
            <Input
              label="Phone" type="tel"
              value={form.phone} onChange={(e) => set("phone", e.target.value)}
              placeholder="+20 1XX XXX XXXX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Lead Source"
              value={form.source}
              onChange={(e) => set("source", e.target.value)}
              options={[
                { value: "web", label: "Website" },
                { value: "referral", label: "Referral" },
                { value: "direct", label: "Direct" },
              ]}
            />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Property details, service requirements, room count, special notes..."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Lead
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
