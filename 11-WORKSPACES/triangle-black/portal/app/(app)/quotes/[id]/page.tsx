"use client";
// @ts-nocheck
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageHeader, PageWrapper, SectionCard, LoadingState,
  AlertBanner, StatusBadge,
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { tokenManager } from "@/lib/auth/token-manager";
import { fmtDate, fmtCurrency } from "@/lib/design-tokens";
import { toast } from "@/lib/toast";
import { ArrowLeft, Download, CheckCircle2, XCircle, Send, FileText } from "lucide-react";

async function apiAction(path: string, method = "POST") {
  const token = tokenManager.getToken();
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "HTTP " + res.status);
  }
  return res;
}

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }         = use(params);
  const [acting, setActing]     = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: quote, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["quote", id],
    queryFn: async () => {
      const token = tokenManager.getToken();
      const res = await fetch("/api/v1/quotes/" + id, {
        headers: token ? { Authorization: "Bearer " + token } : {},
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Quote not found");
      return res.json();
    },
    staleTime: 30_000,
  });

  async function doAction(label: string, path: string) {
    setActing(label);
    try {
      await apiAction(path);
      await refetch();
      toast.success(label + " successful");
    } catch (e: any) {
      toast.error(e.message || label + " failed");
    } finally {
      setActing(null);
    }
  }

  async function downloadPDF() {
    setDownloading(true);
    try {
      const res = await apiAction("/api/v1/actions/quotes/" + id + "/pdf", "GET");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "quote-" + id.slice(0, 8) + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error(e.message || "PDF download failed");
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) return <PageWrapper><LoadingState type="detail" /></PageWrapper>;
  if (isError || !quote) return (
    <PageWrapper>
      <AlertBanner type="error" title={error instanceof Error ? error.message : "Quote not found"} />
    </PageWrapper>
  );

  const q = quote;
  const lineItems = Array.isArray(q.items) ? q.items : [];

  return (
    <PageWrapper>
      <PageHeader
        title={q.title || "Quote"}
        subtitle={fmtCurrency(q.total || 0) + " total"}
        badge="QUOTE"
        back={
          <Link href="/quotes"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> All Quotes
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={downloadPDF}
              loading={downloading}
            >
              Download PDF
            </Button>
            <StatusBadge status={q.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          <SectionCard title="Quote Summary">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Value",   value: fmtCurrency(q.total || 0) },
                { label: "Status",        value: <StatusBadge status={q.status} /> },
                { label: "Valid Until",   value: q.validity_date ? fmtDate(q.validity_date) : "—" },
                { label: "Created",       value: fmtDate(q.created_at) },
              ].map(f => (
                <div key={f.label} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{f.label}</p>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">
                    {typeof f.value === "string" ? f.value : f.value}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {lineItems.length > 0 && (
            <SectionCard title="Line Items" subtitle={lineItems.length + " services"}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Service", "Qty", "Unit Price", "Total"].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-3 py-3 font-medium text-slate-900">{item.service}</td>
                        <td className="px-3 py-3 text-slate-600">{item.qty} months</td>
                        <td className="px-3 py-3 text-slate-600">{fmtCurrency(item.unit_price || 0)}</td>
                        <td className="px-3 py-3 font-semibold text-slate-900">{fmtCurrency(item.total || 0)}</td>
                      </tr>
                    ))}
                    <tr className="bg-amber-50 border-t-2 border-amber-200">
                      <td colSpan={3} className="px-3 py-3 font-bold text-slate-900 text-right">Total</td>
                      <td className="px-3 py-3 font-bold text-amber-700 text-lg">{fmtCurrency(q.total || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

        </div>

        <div>
          <SectionCard title="Actions">
            <div className="space-y-2">
              {q.status === "draft" && (
                <Button variant="primary" className="w-full justify-start"
                  icon={<Send className="w-4 h-4" />}
                  loading={acting === "Submitted"}
                  onClick={() => doAction("Submitted", "/api/v1/actions/quotes/" + id + "/submit")}>
                  Submit for Review
                </Button>
              )}
              {q.status === "review" && (
                <>
                  <Button variant="success" className="w-full justify-start"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    loading={acting === "Approved"}
                    onClick={() => doAction("Approved", "/api/v1/actions/quotes/" + id + "/approve")}>
                    Approve Quote
                  </Button>
                  <Button variant="danger" className="w-full justify-start"
                    icon={<XCircle className="w-4 h-4" />}
                    loading={acting === "Rejected"}
                    onClick={() => doAction("Rejected", "/api/v1/actions/quotes/" + id + "/reject")}>
                    Reject Quote
                  </Button>
                </>
              )}
              {q.status === "approved" && (
                <Button variant="primary" className="w-full justify-start"
                  icon={<Send className="w-4 h-4" />}
                  loading={acting === "Sent"}
                  onClick={() => doAction("Sent", "/api/v1/actions/quotes/" + id + "/send")}>
                  Send to Client
                </Button>
              )}
              <Button variant="ghost" className="w-full justify-start"
                icon={<Download className="w-4 h-4" />}
                loading={downloading}
                onClick={downloadPDF}>
                Download PDF
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
