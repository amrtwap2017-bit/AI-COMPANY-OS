"use client";
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const STARS = (r: any) => { const s=Math.round(r||0); return "★".repeat(s)+"☆".repeat(5-s); };
const REQ_DOCS = ["trade_license","tax_card"];
const DOC_LABELS = {trade_license:"Trade License",tax_card:"Tax Card",commercial_reg:"Commercial Reg.",iso_cert:"ISO Certificate",insurance:"Insurance",bank_letter:"Bank Letter",nda:"Signed NDA",portfolio:"Portfolio",other:"Other"};

export default function SupplierProfilePage() {
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadCat, setUploadCat] = useState("trade_license");
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef(null);

  const loadProfile = (sup, t) => {
    fetch(`/api/v1/supplier/profile?vendor_id=${sup.vendor_id}`, {headers:{Authorization:`Bearer ${t}`}})
      .then(r=>r.json()).then((d: any) => { setProfile(d); setLoading(false); });
  };

  useEffect(() => {
    const t = localStorage.getItem("tb_supplier_token");
    const s = localStorage.getItem("tb_supplier");
    if (!t) { router.push("/supplier-portal"); return; }
    setToken(t);
    const sup = s ? JSON.parse(s) : null;
    setSupplier(sup);
    if (sup?.vendor_id) loadProfile(sup, t);
  }, []);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true); setUploadMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("entity_type", "vendor");
    fd.append("entity_id", supplier?.vendor_id);
    fd.append("doc_category", uploadCat);
    fd.append("doc_name", (DOC_LABELS as Record<string, any>)[uploadCat]||uploadCat);
    fd.append("uploaded_by", supplier?.name||"supplier");
    const r = await fetch("/api/v1/documents/v2/upload", {method:"POST",body:fd,headers:{Authorization:`Bearer ${token}`}});
    const data = await r.json();
    if (data.id) { setUploadMsg("Document uploaded successfully!"); loadProfile(supplier, token); fileRef.current.value=""; }
    else setUploadMsg("Upload failed: " + (data.error||"Unknown error"));
    setUploading(false);
  };

  const docs = profile?.documents || [];
  const docStatus = profile?.doc_status || {};
  const approvalReady = docStatus.approval_ready;

  return (
    <div className="min-h-screen" style={{background:"#0A0F1E"}}>
      <nav style={{background:"#0F172A",borderBottom:"1px solid rgba(255,255,255,0.08)"}} className="px-6 py-3 flex items-center gap-4">
        <button onClick={()=>router.push("/supplier-portal/dashboard")} className="text-sm text-slate-400">← Dashboard</button>
        <div className="text-sm font-bold text-white">My Profile & Documents</div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {loading ? <div className="h-40 rounded-2xl animate-pulse" style={{background:"#1E293B"}}/> : (
          <>
            {/* Approval Status */}
            <div className="p-5 rounded-2xl border" style={{background:approvalReady?"#0D2A1E":"#2A1A0D",borderColor:approvalReady?"#34D39940":"#FBBF2440"}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{approvalReady?"✅":"⚠️"}</span>
                <div className="flex-1">
                  <div className="font-bold" style={{color:approvalReady?"#34D399":"#FBBF24"}}>
                    {approvalReady ? "Approved — All required documents uploaded" : "Pending — Upload required documents to get approved"}
                  </div>
                  {!approvalReady && docStatus.missing_required?.length > 0 && (
                    <div className="text-xs text-slate-400 mt-1">
                      Missing: {docStatus.missing_required.map((d: any) =>(DOC_LABELS as Record<string, any>)[d]||d).join(", ")}
                    </div>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-300">{docStatus.total_documents||0} docs uploaded</div>
              </div>
            </div>

            {/* Company Info */}
            <div className="p-5 rounded-2xl border" style={{background:"#1E293B",borderColor:"rgba(255,255,255,0.08)"}}>
              <h2 className="font-bold text-white mb-4">Company Information</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:"Company",value:profile?.company_name},
                  {label:"Category",value:profile?.category},
                  {label:"Vendor Code",value:profile?.vendor_code},
                  {label:"Rating",value:STARS(profile?.rating||0)+" "+Number(profile?.rating||0).toFixed(1)},
                  {label:"City",value:profile?.city||"—"},
                  {label:"Payment Terms",value:`${profile?.payment_terms||30} days`},
                  {label:"Contact",value:profile?.contact_person||"—"},
                  {label:"Email",value:profile?.email||"—"},
                ].map((row: any, i: any) =>(
                  <div key={i} className="p-2">
                    <div className="text-xs text-slate-400">{row.label}</div>
                    <div className="text-sm font-medium text-white mt-0.5">{row.value||"—"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Upload */}
            <div className="p-5 rounded-2xl border" style={{background:"#1E293B",borderColor:"rgba(255,255,255,0.08)"}}>
              <h2 className="font-bold text-white mb-4">Upload Documents</h2>
              {uploadMsg && <div className="mb-3 p-3 rounded-xl text-sm" style={{background:"#0D2A1E",color:"#34D399"}}>{uploadMsg}</div>}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Document Type</label>
                  <select className="w-full px-3 py-2 rounded-lg text-sm text-white" style={{background:"#0A0F1E",border:"1px solid rgba(255,255,255,0.1)"}}
                    value={uploadCat} onChange={(e: any) =>setUploadCat(e.target.value)}>
                    {Object.entries(DOC_LABELS).map(([k,v])=>(
                      <option key={k} value={k}>{v}{REQ_DOCS.includes(k)?" ⭐":""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">File (PDF, PNG, JPG — max 10MB)</label>
                  <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
                    className="w-full px-3 py-2 rounded-lg text-sm text-slate-300" style={{background:"#0A0F1E",border:"1px solid rgba(255,255,255,0.1)"}}/>
                </div>
              </div>
              <button onClick={handleUpload} disabled={uploading} className="px-6 py-2 rounded-xl text-sm font-bold text-white" style={{background:uploading?"#4B5563":"#D97706"}}>
                {uploading?"Uploading…":"↑ Upload Document"}
              </button>

              {/* Documents List */}
              {docs.length > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="text-sm font-bold text-white mb-3">Uploaded Documents ({docs.length})</div>
                  {docs.map((doc: any, i: any) =>{
                    const isReq = REQ_DOCS.includes(doc.doc_category);
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{background:"rgba(255,255,255,0.03)"}}>
                        <span className="text-lg">{isReq?"⭐":"📎"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{doc.doc_name}</div>
                          <div className="text-xs text-slate-400">{(DOC_LABELS as Record<string, any>)[doc.doc_category]||doc.doc_category} · {(doc.file_size_bytes/1024).toFixed(1)}KB</div>
                        </div>
                        <a href={doc.url} target="_blank" className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg border border-amber-400/30" style={{textDecoration:"none"}}>View</a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
