"use client";
// @ts-nocheck
// Triangle Black V7 — Universal Create Modal
// Supports: Work Order, Service Request, Lead, Purchase Request

import { useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface FieldDef {
  key:          string;
  label:        string;
  type:         "text" | "textarea" | "select" | "email" | "tel" | "date";
  required?:    boolean;
  placeholder?: string;
  options?:     { label: string; value: string }[];
  defaultValue?: string;
}

interface CreateModalProps {
  open:         boolean;
  onClose:      () => void;
  title:        string;
  icon?:        string;
  endpoint:     string;
  fields:       FieldDef[];
  invalidateKeys?: string[];
  onSuccess?:   (data: any) => void;
  successPath?: string;
  defaults?:    Record<string, string>;
}

export function CreateModal({
  open, onClose, title, icon = "➕",
  endpoint, fields, invalidateKeys = [],
  onSuccess, successPath, defaults = {},
}: CreateModalProps) {
  const qc     = useQueryClient();
  const router = useRouter();
  const [form,   setForm]   = useState<Record<string,string>>(defaults);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [done,   setDone]   = useState(false);
  const [created,setCreated]= useState<any>(null);

  if (!open) return null;

  const handleClose = () => {
    setForm(defaults);
    setError("");
    setDone(false);
    setCreated(null);
    onClose();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res  = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || "Failed to create");

      // Invalidate queries to refresh lists
      invalidateKeys.forEach(key => qc.invalidateQueries([key]));
      setCreated(data);
      setDone(true);
      if (onSuccess) onSuccess(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width:"100%", padding:"10px 14px", borderRadius:10,
    border:"1px solid var(--color-border)", background:"var(--color-bg-alt)",
    fontSize:"0.875rem", color:"var(--color-text-1)", outline:"none",
    transition:"border 150ms ease", boxSizing:"border-box" as const,
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24,
    }}>
      {/* Backdrop */}
      <div onClick={handleClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}/>

      {/* Modal */}
      <div style={{
        position:"relative", width:"100%", maxWidth:520,
        background:"var(--color-surface)", border:"1px solid var(--color-border)",
        borderRadius:24, overflow:"hidden",
        boxShadow:"0 24px 48px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)",
        animation:"tb-fade-in 150ms ease",
      }}>
        {/* Header */}
        <div style={{
          padding:"20px 24px 16px",
          borderBottom:"1px solid var(--color-divider)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(180,83,9,0.1)",border:"1px solid rgba(180,83,9,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.125rem"}}>
              {icon}
            </div>
            <div>
              <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)"}}>{title}</div>
              <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:1}}>Fill in the details below</div>
            </div>
          </div>
          <button onClick={handleClose} style={{width:28,height:28,borderRadius:8,background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"1rem",color:"var(--color-text-3)"}}>×</button>
        </div>

        {/* Success state */}
        {done && created ? (
          <div style={{padding:32,textAlign:"center"}}>
            <div style={{fontSize:"3rem",marginBottom:16}}>✅</div>
            <div style={{fontSize:"1.125rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:8}}>{title} Created!</div>
            <div style={{fontSize:"0.875rem",color:"var(--color-text-3)",marginBottom:24}}>
              {created.title || created.name || created.invoice_number || created.pr_number || "Record"} has been created successfully.
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              {successPath && created.id && (
                <button onClick={() => { handleClose(); router.push(successPath + created.id); }}
                  style={{padding:"10px 20px",borderRadius:10,background:"var(--color-brand)",color:"#fff",border:"none",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>
                  View Record →
                </button>
              )}
              <button onClick={handleClose} style={{padding:"10px 20px",borderRadius:10,background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-2)",cursor:"pointer"}}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:14,maxHeight:"60vh",overflowY:"auto"}}>
              {error && (
                <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"10px 14px",fontSize:"0.8125rem",color:"#F87171"}}>{error}</div>
              )}
              {fields.map((field) => (
                <div key={field.key}>
                  <label style={{display:"block",fontSize:"0.6875rem",fontWeight:600,color:"var(--color-text-2)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>
                    {field.label}{field.required && <span style={{color:"var(--color-danger)",marginLeft:3}}>*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={form[field.key] || field.defaultValue || ""}
                      onChange={e => setForm(prev => ({...prev,[field.key]:e.target.value}))}
                      required={field.required}
                      style={{...inputStyle,cursor:"pointer"}}
                      onFocus={e => e.target.style.borderColor="var(--color-brand)"}
                      onBlur={e  => e.target.style.borderColor="var(--color-border)"}>
                      <option value="">— Select {field.label} —</option>
                      {(field.options||[]).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={form[field.key] || ""}
                      onChange={e => setForm(prev => ({...prev,[field.key]:e.target.value}))}
                      required={field.required}
                      placeholder={field.placeholder}
                      rows={3}
                      style={{...inputStyle,resize:"vertical"}}
                      onFocus={e => e.target.style.borderColor="var(--color-brand)"}
                      onBlur={e  => e.target.style.borderColor="var(--color-border)"}/>
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.key] || field.defaultValue || ""}
                      onChange={e => setForm(prev => ({...prev,[field.key]:e.target.value}))}
                      required={field.required}
                      placeholder={field.placeholder}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor="var(--color-brand)"}
                      onBlur={e  => e.target.style.borderColor="var(--color-border)"}/>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{padding:"16px 24px",borderTop:"1px solid var(--color-divider)",display:"flex",justifyContent:"flex-end",gap:10}}>
              <button type="button" onClick={handleClose}
                style={{padding:"10px 20px",borderRadius:10,background:"transparent",border:"1px solid var(--color-border)",fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-2)",cursor:"pointer"}}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                style={{padding:"10px 24px",borderRadius:10,background:saving?"rgba(148,163,184,0.3)":"var(--color-brand)",color:saving?"var(--color-text-3)":"#fff",border:"none",fontSize:"0.875rem",fontWeight:700,cursor:saving?"not-allowed":"pointer",transition:"all 150ms ease"}}>
                {saving ? "Creating..." : `Create ${title.split(" ")[0]}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateModal;
