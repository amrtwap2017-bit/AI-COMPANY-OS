// @ts-nocheck
"use client";
import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { quotesApi, pdfApi } from "@/lib/api";
import { Quote, QuoteStatus } from "@/lib/types";
import { Card, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { QUOTE_STATUS_CONFIG, formatEGP, formatDate } from "@/lib/utils";
import { ArrowLeft, Send, CheckCircle, XCircle, Eye, Download } from "lucide-react";

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote", id],
    queryFn: () => quotesApi.get(id).then((r) => r.data as Quote),
  });

  async function doAction(action: string, fn: () => Promise<unknown>) {
    setLoading(action);
    try {
      await fn();
      qc.invalidateQueries({ queryKey: ["quote", id] });
      qc.invalidateQueries({ queryKey: ["quotes"] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  async function downloadPdf() {
    if (!quote) return;
    setLoading("pdf");
    setPdfError(null);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("tb_token") || ""
          : "";
      await pdfApi.downloadQuote(id, token);
    } catch {
      setPdfError("PDF generation failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64" role="status">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading quote...</span>
      </div>
    );

  if (!quote) return <div role="alert">Quote not found</div>;

  const cfg = QUOTE_STATUS_CONFIG[quote.status as QuoteStatus];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
              <Badge color={cfg.color} bg={cfg.bg}>{cfg.label}</Badge>
            </div>
            {quote.description && (
              <p className="text-gray-500 mt-1">{quote.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="text-3xl font-bold text-amber-700">
              {formatEGP(quote.total)}
            </p>
            {/* ── PDF DOWNLOAD BUTTON ── */}
            <button
              onClick={downloadPdf}
              disabled={loading === "pdf"}
              aria-busy={loading === "pdf"}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-[#243552] transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              {loading === "pdf" ? "Generating PDF..." : "Download PDF Proposal"}
            </button>
            {pdfError && (
              <p role="alert" className="text-xs text-red-500">{pdfError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <Card padding={false}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Line Items</h2>
            </div>
            <table className="w-full text-sm" aria-label="Quote line items">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th scope="col" className="px-6 py-3 text-left">Service</th>
                  <th scope="col" className="px-6 py-3 text-right">Qty</th>
                  <th scope="col" className="px-6 py-3 text-right">Unit Price</th>
                  <th scope="col" className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.service}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">{item.qty}</td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {formatEGP(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatEGP(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td
                    colSpan={3}
                    className="px-6 py-4 font-bold text-gray-900 text-right"
                  >
                    Total
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-700 text-right text-lg">
                    {formatEGP(quote.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader title="Quote Details" />
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium">{formatDate(quote.created_at)}</dd>
              </div>
              {quote.validity_date && (
                <div>
                  <dt className="text-gray-500">Valid Until</dt>
                  <dd className="font-medium">{formatDate(quote.validity_date)}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <Badge color={cfg.color} bg={cfg.bg}>{cfg.label}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Items</dt>
                <dd className="font-medium">{quote.items.length} services</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Actions" />
            <div className="space-y-3">
              <Button
                className="w-full"
                variant="secondary"
                disabled={quote.status !== "draft"}
                loading={loading === "submit"}
                onClick={() =>
                  doAction("submit", () => quotesApi.submit(id))
                }
              >
                <Eye className="w-4 h-4" /> Submit for Review
              </Button>
              <Button
                className="w-full"
                disabled={quote.status !== "review"}
                loading={loading === "send"}
                onClick={() => doAction("send", () => quotesApi.send(id))}
              >
                <Send className="w-4 h-4" /> Send to Client
              </Button>
              <Button
                className="w-full"
                variant="success"
                disabled={quote.status !== "sent"}
                loading={loading === "approve"}
                onClick={() =>
                  doAction("approve", () => quotesApi.approve(id))
                }
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </Button>
              <Button
                className="w-full"
                variant="danger"
                disabled={!["sent", "review"].includes(quote.status)}
                loading={loading === "reject"}
                onClick={() =>
                  doAction("reject", () => quotesApi.reject(id))
                }
              >
                <XCircle className="w-4 h-4" /> Reject
              </Button>

              {/* PDF in actions panel too */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={downloadPdf}
                  disabled={loading === "pdf"}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-amber-600 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  {loading === "pdf" ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>

            {/* Status flow */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3 font-medium">Quote Flow</p>
              {(["draft", "review", "sent", "approved"] as QuoteStatus[]).map((s) => {
                const c = QUOTE_STATUS_CONFIG[s];
                const active = quote.status === s;
                const done =
                  ["review", "sent", "approved"].includes(quote.status) &&
                  (s === "draft" ||
                    (s === "review" &&
                      ["sent", "approved"].includes(quote.status)) ||
                    (s === "sent" && quote.status === "approved"));
                return (
                  <div key={s} className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        active
                          ? "bg-amber-600"
                          : done
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`text-xs ${
                        active
                          ? "font-semibold text-amber-700"
                          : done
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {c.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
