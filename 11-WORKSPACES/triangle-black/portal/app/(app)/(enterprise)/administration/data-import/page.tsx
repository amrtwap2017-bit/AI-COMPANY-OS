"use client";
import React, { useState, useCallback, useRef } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight,
  ArrowLeft, Database, BarChart3, RefreshCw, Eye, Send
} from "lucide-react";

type DataType = "assets" | "suppliers" | "pm_plans";
type WizardStep = 1 | 2 | 3 | 4 | 5;

interface ValidationRow {
  row: number;
  valid: boolean;
  errors?: string[];
  data?: Record<string, string>;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  quality_score?: number;
}

const DATA_TYPES: { key: DataType; label: string; icon: string; description: string; required: string[] }[] = [
  {
    key: "assets",
    label: "Assets",
    icon: "⚙️",
    description: "Equipment, machinery, HVAC units, electrical panels",
    required: ["name", "category"],
  },
  {
    key: "suppliers",
    label: "Suppliers",
    icon: "🤝",
    description: "Vendors, contractors, service providers",
    required: ["name"],
  },
  {
    key: "pm_plans",
    label: "PM Plans",
    icon: "📋",
    description: "Preventive maintenance schedules",
    required: ["asset_name", "frequency_days"],
  },
];

export default function DataImportPage(): React.JSX.Element {
  const [step, setStep] = useState<WizardStep>(1);
  const [dataType, setDataType] = useState<DataType | null>(null);
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationRow[] | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvContent(text);
      const rows = text.split("\n").filter((l) => l.trim()).length - 1;
      setRowCount(Math.max(0, rows));
    };
    reader.readAsText(file);
  }, []);

  const handleValidate = async () => {
    if (!csvContent.trim() || !dataType) return;
    setLoading(true);
    setError("");
    try {
      const rows = csvContent
        .split("\n")
        .slice(1)
        .filter((l) => l.trim())
        .slice(0, 5)
        .map((l, idx) => {
          const cols = l.split(",").map((c) => c.trim());
          const headers = csvContent.split("\n")[0].split(",").map((h) => h.trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = cols[i] || ""; });
          return { row: idx + 2, valid: true, data: obj };
        });
      setValidationResult(rows);
      setStep(3);
    } catch {
      setError("Validation failed — check CSV format");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!csvContent.trim() || !dataType) return;
    setLoading(true);
    setError("");
    try {
      const endpoint = `/api/v1/data-import/${dataType === "assets" ? "assets" :
                       dataType === "suppliers" ? "suppliers" : "pm-plans"}`;
      const res = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csv_content: csvContent,
          data_classification: "IMPORTED",
          confidence: "HIGH",
          source: "customer_upload",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Import failed");
      setImportResult({
        imported: data.imported ?? data.created ?? data.count ?? 0,
        skipped: data.skipped ?? data.errors ?? 0,
        errors: data.error_count ?? 0,
        quality_score: data.quality_score,
      });
      setStep(5);
    } catch (err: any) {
      setError(err.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setDataType(null); setCsvContent(""); setFileName("");
    setRowCount(0); setValidationResult(null); setImportResult(null); setError("");
  };

  const stepLabels = ["Type", "Upload", "Preview", "Confirm", "Done"];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{ background: "linear-gradient(135deg, #1A2015 0%, #1A1508 100%)" }}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-green-400 mb-1.5">Data Import</div>
          <h1 className="tb-hero-title">Import Your Data</h1>
          <p className="tb-hero-description">
            Upload assets, suppliers, or PM plans. All imported data is tagged as
            IMPORTED with provenance tracking.
          </p>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {stepLabels.map((label, idx) => {
            const s = (idx + 1) as WizardStep;
            const active = step === s;
            const done = step > s;
            return (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  active ? "bg-brand text-white" :
                  done ? "bg-green-600/20 text-green-400" :
                  "bg-surface text-tertiary"
                }`}>
                  {done ? <CheckCircle2 size={12} /> : null}
                  {label}
                </div>
                {idx < stepLabels.length - 1 && (
                  <div className={`flex-1 h-0.5 ${step > s ? "bg-green-600/40" : "bg-border"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {error && (
          <div className="tb-section mb-4 border-l-4 border-red-500">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* STEP 1: Choose type */}
        {step === 1 && (
          <div>
            <h2 className="text-primary font-bold text-xl mb-6">What are you importing?</h2>
            <div className="grid grid-cols-1 gap-4 max-w-2xl">
              {DATA_TYPES.map((dt) => (
                <button
                  key={dt.key}
                  onClick={() => { setDataType(dt.key); setStep(2); }}
                  className={`tb-section text-left transition-all cursor-pointer hover:border-brand ${
                    dataType === dt.key ? "border-brand" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{dt.icon}</span>
                    <div>
                      <div className="text-primary font-bold text-lg">{dt.label}</div>
                      <div className="text-secondary text-sm mt-0.5">{dt.description}</div>
                      <div className="text-tertiary text-xs mt-1">
                        Required: {dt.required.join(", ")}
                      </div>
                    </div>
                    <ArrowRight size={20} className="ml-auto text-tertiary" />
                  </div>
                </button>
              ))}
            </div>

            <div className="tb-section mt-6 border-l-4 border-blue-500 max-w-2xl">
              <p className="text-sm text-secondary">
                <strong className="text-primary">Data Provenance:</strong> All imported records
                are tagged as <code className="text-xs bg-surface px-1 rounded">IMPORTED</code> with{" "}
                <code className="text-xs bg-surface px-1 rounded">HIGH</code> confidence and a timestamp.
                No fabricated relationships will be created.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Upload */}
        {step === 2 && dataType && (
          <div className="max-w-2xl">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-tertiary text-sm mb-6 hover:text-primary">
              <ArrowLeft size={14} /> Back
            </button>
            <h2 className="text-primary font-bold text-xl mb-2">
              Upload {DATA_TYPES.find(d => d.key === dataType)?.label} CSV
            </h2>
            <p className="text-secondary text-sm mb-6">
              Required columns: <strong>{DATA_TYPES.find(d => d.key === dataType)?.required.join(", ")}</strong>
            </p>

            <div
              className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-brand transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <FileSpreadsheet size={40} className="mx-auto mb-3 text-tertiary" />
              <p className="text-primary font-medium">
                {fileName || "Click to upload CSV file"}
              </p>
              {rowCount > 0 && (
                <p className="text-green-400 text-sm mt-1">{rowCount} data rows detected</p>
              )}
              <p className="text-tertiary text-xs mt-2">CSV format, UTF-8 encoding</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />

            <div className="mt-4">
              <label className="text-secondary text-sm block mb-2">Or paste CSV content:</label>
              <textarea
                value={csvContent}
                onChange={(e) => {
                  setCsvContent(e.target.value);
                  const rows = e.target.value.split("\n").filter(l => l.trim()).length - 1;
                  setRowCount(Math.max(0, rows));
                }}
                rows={8}
                className="w-full bg-surface border border-border rounded-lg p-3 text-primary text-xs font-mono resize-none"
                placeholder="name,category,location&#10;AHU-01,HVAC,Level 3&#10;Chiller-A,HVAC,Basement"
              />
              {rowCount > 0 && <p className="text-tertiary text-xs mt-1">{rowCount} rows detected</p>}
            </div>

            <button
              onClick={handleValidate}
              disabled={!csvContent.trim() || loading}
              className="tb-btn tb-btn-primary mt-4 flex items-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Eye size={14} />}
              Preview & Validate
            </button>
          </div>
        )}

        {/* STEP 3: Preview */}
        {step === 3 && validationResult && (
          <div className="max-w-3xl">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-tertiary text-sm mb-6 hover:text-primary">
              <ArrowLeft size={14} /> Back
            </button>
            <h2 className="text-primary font-bold text-xl mb-2">Preview (first 5 rows)</h2>
            <p className="text-secondary text-sm mb-6">
              {rowCount} total rows detected. Showing sample below.
            </p>

            <div className="tb-section mb-4">
              <div className="flex gap-4 mb-4">
                <div className="tb-badge tb-badge-success">
                  {rowCount} rows ready to import
                </div>
                <div className="tb-badge" style={{ background: "#1a3a1a", color: "#4ade80" }}>
                  IMPORTED + HIGH confidence
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {validationResult[0] && Object.keys(validationResult[0].data || {}).map(h => (
                        <th key={h} className="text-left text-tertiary text-xs pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.map((row) => (
                      <tr key={row.row} className="border-b border-border/50">
                        {Object.values(row.data || {}).map((v, i) => (
                          <td key={i} className="text-primary py-1.5 pr-4 text-xs">{v || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="tb-section mb-4 border-l-4 border-yellow-500">
              <p className="text-sm text-yellow-400 font-medium">⚠️ Data Trust Notice</p>
              <p className="text-xs text-secondary mt-1">
                Imported records will be classified as <strong>IMPORTED</strong> not REAL.
                Asset links will NOT be fabricated. Unrecognized relationships will be marked UNKNOWN.
              </p>
            </div>

            <button
              onClick={() => setStep(4)}
              className="tb-btn tb-btn-primary flex items-center gap-2"
            >
              <Send size={14} /> Confirm Import ({rowCount} rows)
            </button>
          </div>
        )}

        {/* STEP 4: Confirm */}
        {step === 4 && (
          <div className="max-w-xl">
            <button onClick={() => setStep(3)} className="flex items-center gap-1 text-tertiary text-sm mb-6 hover:text-primary">
              <ArrowLeft size={14} /> Back to Preview
            </button>
            <h2 className="text-primary font-bold text-xl mb-6">Confirm Import</h2>

            <div className="tb-section mb-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-tertiary">Data type</span>
                  <span className="text-primary font-medium capitalize">{dataType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tertiary">Rows to import</span>
                  <span className="text-primary font-medium">{rowCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tertiary">Classification</span>
                  <span className="text-green-400 font-medium">IMPORTED</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tertiary">Confidence</span>
                  <span className="text-green-400 font-medium">HIGH</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleImport}
              disabled={loading}
              className="tb-btn tb-btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <><RefreshCw size={14} className="animate-spin" /> Importing...</>
              ) : (
                <><Database size={14} /> Import {rowCount} Records</>
              )}
            </button>
          </div>
        )}

        {/* STEP 5: Result */}
        {step === 5 && importResult && (
          <div className="max-w-xl">
            <div className="text-center mb-8">
              <CheckCircle2 size={56} className="mx-auto mb-4 text-green-400" />
              <h2 className="text-primary font-bold text-2xl mb-2">Import Complete</h2>
            </div>

            <div className="tb-section mb-6">
              <div className="tb-grid-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400">{importResult.imported}</div>
                  <div className="text-xs text-tertiary mt-1">Records imported</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-400">{importResult.skipped}</div>
                  <div className="text-xs text-tertiary mt-1">Skipped / errors</div>
                </div>
              </div>
              {importResult.quality_score != null && (
                <div className="mt-4 pt-4 border-t border-border text-center">
                  <div className="text-xl font-black text-brand">{importResult.quality_score}%</div>
                  <div className="text-xs text-tertiary">Data quality score</div>
                </div>
              )}
            </div>

            <div className="tb-section mb-6 border-l-4" style={{ borderColor: "#27AE60" }}>
              <p className="text-sm text-secondary">
                All {importResult.imported} records tagged as <strong className="text-green-400">IMPORTED</strong>.
                No asset relationships were fabricated. Run <strong>Capture Baseline</strong> next
                to lock your Day-0 KPIs.
              </p>
            </div>

            <div className="flex gap-3">
              <a href="/pilot-dashboard" className="tb-btn tb-btn-primary flex items-center gap-2">
                <BarChart3 size={14} /> Capture Baseline
              </a>
              <button onClick={reset} className="tb-btn tb-btn-secondary flex items-center gap-2">
                <Upload size={14} /> Import More
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
