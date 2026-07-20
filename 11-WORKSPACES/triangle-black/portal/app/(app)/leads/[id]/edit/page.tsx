// @ts-nocheck
"use client";
import { use, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {leadsApi, extendedLeadsApi} from "@/lib/api";
import { Lead } from "@/lib/types";
import { Card, CardHeader } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { ArrowLeft } from "lucide-react";

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: lead } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => leadsApi.get(id).then((r) => r as Lead),
  });

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    source: "web", priority: "medium", status: "new", notes: "",
  });

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        source: lead.source || "web",
        priority: lead.priority || "medium",
        status: lead.status || "new",
        notes: lead.notes || "",
      });
    }
  }, [lead]);

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await extendedLeadsApi.update(id, {
        name: form.name, email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        source: form.source, priority: form.priority,
        status: form.status,
        notes: form.notes || undefined,
      });
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      router.push(`/leads/${id}`);
    } catch {
      setError("Failed to update lead.");
    } finally { setLoading(false); }
  }

  if (!lead) return (
    <div className="flex items-center justify-center h-64" role="status">
      <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Lead</h1>

      <Card>
        <CardHeader title={lead.name} subtitle="Update lead information" />

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hotel / Client Name" required
              value={form.name} onChange={(e) => set("name", e.target.value)} />
            <Input label="Company / Group"
              value={form.company} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" required
              value={form.email} onChange={(e) => set("email", e.target.value)} />
            <Input label="Phone" type="tel"
              value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select label="Source" value={form.source}
              onChange={(e) => set("source", e.target.value)}
              options={[
                { value: "web", label: "Website" },
                { value: "referral", label: "Referral" },
                { value: "direct", label: "Direct" },
              ]} />
            <Select label="Priority" value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]} />
            <Select label="Status" value={form.status}
              onChange={(e) => set("status", e.target.value)}
              options={[
                { value: "new", label: "New" },
                { value: "qualified", label: "Qualified" },
                { value: "assigned", label: "Assigned" },
                { value: "converted", label: "Converted" },
                { value: "lost", label: "Lost" },
              ]} />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="notes" rows={4} value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
