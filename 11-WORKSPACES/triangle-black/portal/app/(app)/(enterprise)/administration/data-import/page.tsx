"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  FileSpreadsheet, ShieldAlert, Sparkles,
  CheckCircle2, ArrowRight, Upload, AlertCircle
} from "lucide-react";

export default function DataImportPage() {
  const [csvContent, setCsvContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/v1/data-import/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_content: csvContent })
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert("Error executing bulk portfolio import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <FileSpreadsheet className="w-7 h-7 text-brand" />
              SaaS Data Import Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              Enterprise Portfolio Migration
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Bulk migrate legacy hotel asset registries, spare parts inventory, and supplier listings directly into Triangle Black.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-semibold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Upload className="w-4 h-4 text-brand" />
            CSV Data Workbench
          </h2>

          <form onSubmit={handleImport} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
                Raw CSV Content Input
              </label>
              <textarea
                rows={10}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="name,category,criticality&#10;APC UPS Server Room,Electrical,high&#10;Chiller Unit A - Floor B1,HVAC,critical"
                className="w-full font-mono text-xs rounded-md border border-border bg-surface px-3 py-2 text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all"
                required
              />
            </div>

            <Button type="submit" loading={loading} disabled={loading || !csvContent.trim()} className="w-full">
              Parse & Validate Portfolio
            </Button>
          </form>
        </div>

        {/* Right Preview/Result */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-surface p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-primary flex items-center gap-2 border-b border-divider pb-3">
              <ShieldAlert className="w-4 h-4 text-brand" />
              Migration Validation Status
            </h2>

            {result && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${result.success ? "border-success-border bg-success-bg text-success-text" : "border-danger-border bg-danger-bg text-danger-text"} flex items-center gap-3`}>
                  {result.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <div>
                    <div className="text-sm font-bold">
                      {result.success ? "Migration Succeeded!" : "Validation Failures Encountered"}
                    </div>
                    <p className="text-xs mt-0.5">
                      {result.imported_count} records safely written with full tenant boundary isolation.
                    </p>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-secondary uppercase">Error Log:</span>
                    <div className="p-3 rounded-lg border border-border bg-surface-alt font-mono text-[10px] text-danger-text space-y-1 max-h-48 overflow-y-auto">
                      {result.errors.map((err: string, i: number) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!result && (
              <div className="text-center py-20 text-secondary space-y-2">
                <FileSpreadsheet className="w-12 h-12 text-tertiary mx-auto opacity-40" />
                <p className="text-sm font-medium">Input your property data in the workbench on the left.</p>
                <p className="text-xs text-tertiary">Schema requires: name, category, criticality.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-divider text-xs text-tertiary flex items-center justify-between">
            <span>Isolation: hotel_id Scoped</span>
            <span className="text-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
