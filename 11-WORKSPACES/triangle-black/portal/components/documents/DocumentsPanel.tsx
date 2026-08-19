"use client";
// @ts-nocheck
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const fmtSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + " KB";
  return (bytes/(1024*1024)).toFixed(1) + " MB";
};

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const CAT_LABELS = {
  trade_license: "Trade License",
  commercial_reg: "Commercial Registration",
  tax_card: "Tax Card",
  bank_letter: "Bank Letter / IBAN",
  iso_cert: "ISO Certificate",
  insurance: "Insurance Certificate",
  portfolio: "Portfolio",
  nda: "Signed NDA",
  technical_spec: "Technical Specifications",
  quote: "Vendor Quote",
  approval_email: "Approval Email",
  delivery_note: "Delivery Note",
  inspection_report: "Inspection Report",
  invoice: "Invoice",
  po_document: "PO Document",
  scope_document: "Scope Document",
  client_approval: "Client Approval",
  technical_drawing: "Technical Drawing",
  packing_list: "Packing List",
  other: "Other Document",
};

const CAT_ICONS = {
  trade_license: "📋", commercial_reg: "🏢", tax_card: "🧾",
  bank_letter: "🏦", iso_cert: "🏆", insurance: "🛡️",
  portfolio: "📁", nda: "✍️", technical_spec: "⚙️",
  quote: "💰", approval_email: "✉️", delivery_note: "🚚",
  inspection_report: "🔍", invoice: "📄", po_document: "📦",
  scope_document: "📝", client_approval: "✅", technical_drawing: "📐",
  packing_list: "📋", other: "📎",
};

const REQUIRED_BADGE = ({ is_required, is_verified }: any) => {
  if (!is_required) return null;
  if (is_verified) return <span className="tb-badge" style={{background:"#34D39918",color:"#34D399",fontSize:"0.45rem"}}>VERIFIED</span>;
  return <span className="tb-badge" style={{background:"#F8717118",color:"#F87171",fontSize:"0.45rem"}}>REQUIRED</span>;
};

export default function DocumentsPanel({ entityType, entityId, title = "Documents", categories = [] }: any) {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ doc_category: categories[0] || "other", doc_name: "", notes: "" });
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState("");

  const { data: docs = [], isLoading } = useQuery(
    ["documents", entityType, entityId],
    () => authFetch(`/api/v1/documents/?entity_type=${entityType}&entity_id=${entityId}`).then(r => r.data ?? r),
    { staleTime: 30000, enabled: !!entityId }
  );

  const deleteMut = useMutation(
    (docId) => authFetch(`/api/v1/documents/v2/${docId}`, { method: "DELETE" }).then(r => r.data ?? r),
    { onSuccess: () => qc.invalidateQueries(["documents", entityType, entityId]) }
  );

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Please select a file"); return; }
    if (file.size > 10*1024*1024) { setError("File must be under 10MB"); return; }
    setError(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("entity_type", entityType);
      fd.append("entity_id", entityId);
      fd.append("doc_category", form.doc_category);
      fd.append("doc_name", form.doc_name || file.name);
      fd.append("notes", form.notes);
      fd.append("uploaded_by", "amr@triangleblack.com");
      const token = localStorage.getItem("tb_token") || document.cookie.split("tb_token=")[1]?.split(";")[0] || "";
      const r = await fetch("/api/v1/documents/v2/upload", {
        method: "POST", body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await r.json();
      if (data.error) { setError(data.error); }
      else {
        qc.invalidateQueries(["documents", entityType, entityId]);
        setShowUpload(false);
        setForm({ doc_category: categories[0] || "other", doc_name: "", notes: "" });
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch(e) { setError(String(e)); }
    finally { setUploading(false); }
  };

  const totalRequired = docs.filter((d: any) =>d.is_required).length;
  const totalDocs = docs.length;

  return (
    <div className="tb-section">
      <div className="tb-flex-between mb-3">
        <div>
          <div className="text-sm font-bold text-primary">{title}</div>
          <div className="text-xs text-tertiary">{totalDocs} files{totalRequired > 0 ? ` · ${totalRequired} required` : ""}</div>
        </div>
        <button onClick={()=>setShowUpload(!showUpload)} className="tb-btn-primary" style={{fontSize:"0.75rem",padding:"6px 12px"}}>
          + Upload
        </button>
      </div>

      {showUpload && (
        <div className="p-4 rounded-xl bg-base-alt border border-brand/30 mb-4 space-y-3">
          <div className="text-xs font-bold text-brand">Upload Document</div>
          {error && <div className="text-xs text-red-400 bg-red-400/10 p-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-tertiary block mb-1">Category *</label>
              <select className="tb-input w-full" value={form.doc_category} onChange={(e: any) =>setForm({...form,doc_category:e.target.value})}>
                {(categories.length > 0 ? categories : Object.keys(CAT_LABELS)).map((cat: any) =>(
                  <option key={cat} value={cat}>{(CAT_LABELS as Record<string, any>)[cat]||cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Document Name</label>
              <input className="tb-input w-full" placeholder="e.g. Trade License 2025" value={form.doc_name} onChange={(e: any) =>setForm({...form,doc_name:e.target.value})}/>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-tertiary block mb-1">File * (PDF, PNG, JPG, DOCX, XLSX — max 10MB)</label>
              <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx" className="tb-input w-full text-sm" style={{padding:"8px"}}/>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-tertiary block mb-1">Notes</label>
              <input className="tb-input w-full" placeholder="Optional notes…" value={form.notes} onChange={(e: any) =>setForm({...form,notes:e.target.value})}/>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleUpload} disabled={uploading} className="tb-btn-primary" style={{fontSize:"0.75rem",padding:"6px 14px"}}>
              {uploading ? "Uploading…" : "Upload ↑"}
            </button>
            <button onClick={()=>{setShowUpload(false);setError("");}} className="tb-btn-secondary" style={{fontSize:"0.75rem",padding:"6px 12px"}}>Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1,2].map((i: any) =><div key={i} className="h-12 bg-base-alt rounded-xl animate-pulse"/>)}</div>
      ) : docs.length === 0 ? (
        <div className="tb-empty" style={{padding:"24px"}}>
          <div className="tb-empty-icon" style={{fontSize:"1.5rem"}}>📎</div>
          <div className="tb-empty-title">No documents uploaded</div>
          <div className="tb-empty-desc">Click Upload to attach files</div>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc: any, i: any) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-alt border border-border hover:border-border/80 transition-colors">
              <span style={{fontSize:"1.25rem"}}>{(CAT_ICONS as Record<string, any>)[doc.doc_category]||"📎"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-primary truncate">{doc.doc_name}</span>
                  <REQUIRED_BADGE is_required={doc.is_required} is_verified={doc.is_verified}/>
                </div>
                <div className="text-xs text-tertiary">
                  {(CAT_LABELS as Record<string, any>)[doc.doc_category]||doc.doc_category} · {fmtSize(doc.file_size_bytes)} · {fmtDate(doc.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                   className="tb-btn-secondary" style={{fontSize:"0.625rem",padding:"4px 10px"}}>
                  View ↗
                </a>
                <button onClick={()=>{ if(confirm("Delete this document?")) deleteMut.mutate(doc.id); }}
                        className="text-xs text-red-400 hover:text-red-300 px-2">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
