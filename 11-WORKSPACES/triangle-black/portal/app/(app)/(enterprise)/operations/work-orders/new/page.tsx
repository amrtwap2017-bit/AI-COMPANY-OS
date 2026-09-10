"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "@/components/states/PageStates";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { tbFetch } from "@/lib/api/tb-client";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.assets || d?.data || [];

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "",
    priority: "medium", type: "corrective",
    asset_id: "", technician_id: "",
  });

  // Load assets for dropdown
  const { data: assetRaw, isLoading } = useQuery(
    ["nwo-assets"],
    () => authFetch("/api/v1/assets/?limit=200"),
    { staleTime: 60000 }
  );
  const assets = toArr(assetRaw);

  // Load technicians for dropdown
  const { data: techRaw } = useQuery(
    ["nwo-techs"],
    () => authFetch("/api/v1/technicians/?limit=100"),
    { staleTime: 60000 }
  );
  const techs = toArr(techRaw);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // V9-015: Warn if no asset selected for corrective WOs
    if (form.type === "corrective" && !form.asset_id) {
      const confirmed = window.confirm(
        "⚠️ No asset selected.\n\n" +
        "Linking work orders to assets improves maintenance intelligence.\n\n" +
        "Continue without asset?"
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        type: form.type,
      };
      if (form.asset_id) payload.asset_id = form.asset_id;
      if (form.technician_id) payload.technician_id = form.technician_id;

      await tbFetch("/api/v1/work-orders/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/operations/work-orders");
    } catch (err: any) {
      setError(err?.message || "Failed to create work order");
    } finally {
      setSaving(false);
    }
  }

  const isCorrectiveWithoutAsset = form.type === "corrective" && !form.asset_id;

  if (isLoading) return <LoadingSkeleton rows={5} message="Loading..." />;

    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">New Work Order</h1>
        <p className="text-sm text-tertiary mt-1">
          Create a new work order. Link to an asset for better maintenance intelligence.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            required
            value={form.title}
            onChange={(e: any) => set("title", e.target.value)}
            placeholder="e.g. HVAC Filter Replacement - Room 301"
            className="tb-input w-full"
          />
        </div>

        {/* Type + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e: any) => set("type", e.target.value)}
              className="tb-select w-full"
            >
              <option value="corrective">Corrective</option>
              <option value="preventive">Preventive</option>
              <option value="inspection">Inspection</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={(e: any) => set("priority", e.target.value)}
              className="tb-select w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Asset selector - V9-015 */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-1.5">
            Asset
            {form.type === "corrective" && (
              <span className="ml-2 text-xs font-normal text-amber-400">
                (Recommended for corrective WOs)
              </span>
            )}
          </label>
          <select
            value={form.asset_id}
            onChange={(e: any) => set("asset_id", e.target.value)}
            className="tb-select w-full"
          >
            <option value="">- Select asset (optional) -</option>
            {assets.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.name}{a.category ? ` (${a.category})` : ""}
              </option>
            ))}
          </select>
          {isCorrectiveWithoutAsset && (
            <p className="mt-1 text-xs text-amber-400">
              ⚠️ Linking to an asset improves MTTR tracking and repeat failure detection.
            </p>
          )}
        </div>

        {/* Technician selector */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-1.5">
            Assign Technician
          </label>
          <select
            value={form.technician_id}
            onChange={(e: any) => set("technician_id", e.target.value)}
            className="tb-select w-full"
          >
            <option value="">- Unassigned -</option>
            {techs.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name || t.full_name || t.email || t.id}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e: any) => set("description", e.target.value)}
            placeholder="Describe the issue or task..."
            rows={3}
            className="tb-input w-full resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="tb-btn tb-btn-primary flex-1"
          >
            {saving ? "Creating..." : "Create Work Order"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/operations/work-orders")}
            className="tb-btn tb-btn-ghost"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
