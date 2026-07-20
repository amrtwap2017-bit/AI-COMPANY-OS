"use client";
// @ts-nocheck
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader, PageWrapper, SectionCard, AlertBanner } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Wrench } from "lucide-react";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { tokenManager } from "@/lib/auth/token-manager";

const WO_TYPES = [
  "corrective", "preventive", "inspection", "emergency",
  "hvac", "electrical", "plumbing", "mechanical", "civil", "it", "cleaning",
];

const PRIORITIES = ["low", "medium", "high", "critical", "emergency"];

export default function NewWorkOrderPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form,    setForm]    = useState({
    title:       "",
    description: "",
    type:        "corrective",
    priority:    "medium",
    location:    "",
    due_date:    "",
  });

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError("");
    try {
      const token = tokenManager.getToken();
      const res = await authFetch("/api/v1/work-orders/", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": "Bearer " + token } : {}),
        },
        body: JSON.stringify({
          title:       form.title,
          description: form.description || "",
          type:        form.type,
          priority:    form.priority,
          location:    form.location || "",
          due_date:    form.due_date || null,
          hotel_id:    "tb-default-hotel-000000000001",
          status:      "open",
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Failed to create work order");
      }
      const created = await res.json();
      qc.invalidateQueries({ queryKey: ["ops-work-orders"] });
      qc.invalidateQueries({ queryKey: ["work-orders"] });
      toast.success("Work order created successfully");
      router.push("/operations/work-orders");
    } catch (e: any) {
      setError(e.message || "Failed to create work order");
      toast.error(e.message || "Failed to create work order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="New Work Order"
        subtitle="Create a maintenance or service work order"
        badge="WO"
        back={
          <Link href="/operations/work-orders"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      />

      {error && (
        <AlertBanner type="error" title={error} />
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-2xl space-y-5">

          <SectionCard title="Work Order Details">
            <div className="space-y-4">
              <Input
                label="Title"
                required
                placeholder="e.g. HVAC Chiller Unit 4B - Cooling Fault"
                value={form.title}
                onChange={e => update("title", e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Describe the issue or work required..."
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors resize-y min-h-[80px]"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Classification">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={e => update("type", e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors"
                >
                  {WO_TYPES.map(t => (
                    <option key={t} value={t} className="capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => update("priority", e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p} className="capitalize">
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Location and Schedule">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Location"
                placeholder="e.g. Mechanical Room B1, Floor 3"
                value={form.location}
                onChange={e => update("location", e.target.value)}
              />
              <Input
                type="date"
                label="Due Date"
                value={form.due_date}
                onChange={e => update("due_date", e.target.value)}
              />
            </div>
          </SectionCard>

          <div className="flex items-center gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={<Save className="w-4 h-4" />}
            >
              Create Work Order
            </Button>
          </div>

        </div>
      </form>
    </PageWrapper>
  );
}
