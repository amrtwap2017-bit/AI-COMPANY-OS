"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";

const toArr  = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate= (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_COLOR = {
  paid:"#34D399",pending:"#FBBF24",overdue:"#F87171",
  draft:"#94A3B8",cancelled:"#64748B",sent:"#60A5FA"
};

function printInvoice(inv: any) {
  const sc     = (STATUS_COLOR as Record<string, any>)[inv.status] || "#94A3B8";
  const amount = Number(inv.total_amount || inv.amount || 0);
  const tax    = Number(inv.tax_amount || amount * 0.14);
  const subtot = amount - tax;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invoice ${inv.invoice_number || inv.id?.slice(0,8)}</title>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:13px;color:#1E293B;background:#fff;padding:40px;}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:20px;border-bottom:2px solid #E2E8F0;}.company-name{font-size:24px;font-weight:900;color:#0F172A;}.company-sub{font-size:11px;color:#64748B;margin-top:4px;}.invoice-title{text-align:right;}.invoice-title h1{font-size:28px;font-weight:900;color:#0F172A;}.invoice-number{font-size:13px;color:#64748B;margin-top:4px;}.status-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;background:${sc}20;color:${sc};border:1px solid ${sc}40;margin-top:8px;}.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:32px;}.meta-label{font-size:10px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;}.meta-value{font-size:13px;font-weight:600;color:#1E293B;}.items-table{width:100%;border-collapse:collapse;margin-bottom:24px;}.items-table th{background:#F8FAFC;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748B;letter-spacing:0.05em;border-bottom:2px solid #E2E8F0;}.items-table th:last-child,.items-table td:last-child{text-align:right;}.items-table td{padding:10px 12px;border-bottom:1px solid #F1F5F9;font-size:13px;}.totals{margin-left:auto;width:280px;}.totals-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;}.totals-row.total{border-top:2px solid #E2E8F0;margin-top:4px;padding-top:10px;font-size:16px;font-weight:900;color:#0F172A;}.footer{margin-top:48px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8;text-align:center;}@media print{body{padding:20px;}}</style></head><body>
<div class="header"><div><div class="company-name">Triangle Black</div><div class="company-sub">Engineering Operations Platform</div><div class="company-sub">Cairo, Egypt | info@triangleblack.com</div></div><div class="invoice-title"><h1>INVOICE</h1><div class="invoice-number">${inv.invoice_number||`INV-${(inv.id||"").slice(0,8).toUpperCase()}`}</div><div class="status-badge">${(inv.status||"draft").toUpperCase()}</div></div></div>
<div class="meta-grid"><div><div class="meta-label">Bill To</div><div class="meta-value">${inv.contract?.title||inv.client_name||"—"}</div>${inv.contract?`<div style="color:#64748B;font-size:12px;margin-top:2px">Contract: ${inv.contract.title||"—"}</div>`:""}</div><div><div class="meta-label">Invoice Date</div><div class="meta-value">${fmtDate(inv.issue_date||inv.created_at)}</div><div style="margin-top:12px"><div class="meta-label">Due Date</div><div class="meta-value">${fmtDate(inv.due_date)}</div></div></div><div><div class="meta-label">Work Order</div><div class="meta-value">${inv.work_order?.title||inv.work_order_id?.slice(0,16)||"—"}</div></div><div><div class="meta-label">Payment Status</div><div class="meta-value" style="color:${sc}">${(inv.status||"—").toUpperCase()}</div></div></div>
<table class="items-table"><thead><tr><th>Description</th><th style="text-align:center">Type</th><th style="text-align:right">Amount</th></tr></thead><tbody><tr><td>${inv.description||inv.notes||"Engineering Services"}</td><td style="text-align:center">${inv.type||"Service"}</td><td style="text-align:right">${fmtEGP(subtot)}</td></tr>${inv.work_order?`<tr><td style="color:#64748B">Work Order: ${inv.work_order.title||""}</td><td></td><td></td></tr>`:""}</tbody></table>
<div class="totals"><div class="totals-row"><span style="color:#64748B">Subtotal</span><span>${fmtEGP(subtot)}</span></div><div class="totals-row"><span style="color:#64748B">VAT (14%)</span><span>${fmtEGP(tax)}</span></div><div class="totals-row total"><span>Total</span><span style="color:#0F172A">${fmtEGP(amount)}</span></div></div>
<div class="footer"><p>Triangle Black Engineering Operations Platform · Generated ${new Date().toLocaleDateString("en-GB")} · Thank you for your business</p></div></body></html>`;

  const win = window.open("","_blank","width=900,height=1100");
  if (!win) return;
  win.document.write(html); win.document.close(); win.focus();
  setTimeout(()=>{win.print();},500);
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const { data: inv, isLoading } = useQuery(
    ["invoice-detail", id],
    ()=>authFetch(`/api/v1/invoices/${id}`).then(r => r.json()),
    {enabled:!!id}
  );

  if (isLoading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-secondary text-sm animate-pulse">Loading invoice...</div>
    </div>
  );

  if (!inv||inv.detail) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty">
        <div className="tb-empty-icon">📄</div>
        <div className="tb-empty-title">Invoice not found</div>
        <button onClick={()=>router.push("/invoices")} className="tb-btn tb-btn-primary mt-4">Back to Invoices</button>
      </div>
    </div>
  );

  const sc     = (STATUS_COLOR as Record<string, any>)[inv.status]||"#94A3B8";
  const amount = Number(inv.total_amount||inv.amount||0);
  const tax    = Number(inv.tax_amount||amount*0.14);
  const subtot = amount-tax;

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Finance</div>
              <h1 className="tb-hero-title">{inv.invoice_number||`INV-${id?.slice(0,8)?.toUpperCase()}`}</h1>
              <p className="tb-hero-description">
                <span className="tb-badge mr-2" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`}}>{inv.status||"—"}</span>
                Issued {fmtDate(inv.issue_date||inv.created_at)} · Due {fmtDate(inv.due_date)}
              </p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>printInvoice(inv)} className="tb-btn tb-btn-primary">🖨️ Print / PDF</button>
              <button onClick={()=>router.push("/invoices")} className="tb-btn tb-btn-secondary">← Back</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:"Total Amount",value:fmtEGP(amount), color:"var(--color-success)"},
              {label:"Subtotal",    value:fmtEGP(subtot), color:"var(--color-text-inv)"},
              {label:"VAT (14%)",   value:fmtEGP(tax),    color:"var(--color-warning)"},
              {label:"Status",      value:(inv.status||"—").toUpperCase(),color:sc},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.95rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 flex flex-col gap-5">

            <div className="tb-section">
              <div className="tb-section-title">Invoice Details</div>
              {[
                ["Invoice Number", inv.invoice_number||`INV-${id?.slice(0,8)?.toUpperCase()}`],
                ["Issue Date",     fmtDate(inv.issue_date||inv.created_at)],
                ["Due Date",       fmtDate(inv.due_date)],
                ["Status",         inv.status||"—"],
                ["Type",           inv.type||"Service Invoice"],
                ["Contract",       inv.contract?.title||inv.contract_id?.slice(0,16)||"—"],
                ["Work Order",     inv.work_order?.title||inv.work_order_id?.slice(0,16)||"—"],
              ].map(([l,v],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{l}</span>
                  <span className="tb-detail-value">{v}</span>
                </div>
              ))}
            </div>

            {inv.description&&(
              <div className="tb-section">
                <div className="tb-section-title">Description</div>
                <p className="text-sm text-secondary leading-relaxed">{inv.description}</p>
              </div>
            )}

            <div className="tb-section">
              <div className="tb-section-title">Line Items</div>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{textAlign:"center"}}>Type</th>
                      <th style={{textAlign:"right"}}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-sm text-primary">{inv.description||"Engineering Services"}</td>
                      <td className="text-center text-xs text-secondary">{inv.type||"Service"}</td>
                      <td className="text-right text-sm font-bold text-success">{fmtEGP(subtot)}</td>
                    </tr>
                    <tr className="opacity-70">
                      <td className="text-sm text-tertiary">Value Added Tax</td>
                      <td className="text-center text-xs text-secondary">VAT 14%</td>
                      <td className="text-right text-sm font-bold text-warning">{fmtEGP(tax)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <div className="flex flex-col gap-1" style={{minWidth:"192px"}}>
                  {[
                    {label:"Subtotal",value:fmtEGP(subtot),bold:false},
                    {label:"VAT 14%", value:fmtEGP(tax),   bold:false},
                    {label:"TOTAL",   value:fmtEGP(amount), bold:true},
                  ].map((row: any, i: any) =>(
                    <div key={i} className={`flex justify-between py-1 ${row.bold?"border-t border-default pt-3 mt-2":""}`}>
                      <span className={`text-sm ${row.bold?"font-black text-primary":"text-secondary"}`}>{row.label}</span>
                      <span className={`text-sm ${row.bold?"font-black text-success":"text-primary"}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">Actions</div>
              <div className="flex flex-col gap-2">
                <button onClick={()=>printInvoice(inv)} className="tb-action-item w-full justify-start text-success">
                  <span>🖨️</span>
                  <span className="text-sm">Print / Download PDF</span>
                </button>
                <button onClick={()=>router.push("/invoices")} className="tb-action-item w-full justify-start">
                  <span>📋</span>
                  <span className="text-sm">All Invoices</span>
                </button>
                {inv.contract_id&&(
                  <button onClick={()=>router.push(`/commercial/contracts/${inv.contract_id}`)} className="tb-action-item w-full justify-start">
                    <span>📄</span>
                    <span className="text-sm">View Contract</span>
                  </button>
                )}
                {inv.work_order_id&&(
                  <button onClick={()=>router.push(`/operations/work-orders/${inv.work_order_id}`)} className="tb-action-item w-full justify-start">
                    <span>🔧</span>
                    <span className="text-sm">View Work Order</span>
                  </button>
                )}
              </div>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Payment Status</div>
              <div className="text-center py-4">
                <div className="text-5xl font-black mb-2" style={{color:sc}}>
                  {inv.status==="paid"?"✓":inv.status==="overdue"?"!":"○"}
                </div>
                <div className="text-sm font-bold" style={{color:sc}}>{(inv.status||"—").toUpperCase()}</div>
                <div className="text-xs text-tertiary mt-1">
                  {inv.status==="paid"?"Payment received":inv.status==="overdue"?`Overdue since ${fmtDate(inv.due_date)}`:`Due ${fmtDate(inv.due_date)}`}
                </div>
              </div>
            </div>

            {inv.notes&&(
              <div className="tb-section">
                <div className="tb-section-title">Notes</div>
                <p className="text-sm text-secondary">{inv.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
