// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { QrCode, Printer, Download } from "lucide-react";
import { useEffect, useRef } from "react";

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};


function QRCodeBox({ assetId, assetName }: { assetId: string; assetName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const value = `${window?.location?.origin ?? ""}/maintenance/assets/${assetId}`;

  useEffect(() => {
    // Simple QR pattern using canvas — visual placeholder until qrcode lib added
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 120, 120);
    ctx.fillStyle = "#0f172a";
    // Draw corner markers
    [[0,0],[88,0],[0,88]].forEach(([x,y]) => {
      ctx.fillRect(x+4, y+4, 28, 28);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x+8, y+8, 20, 20);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(x+12, y+12, 12, 12);
    });
    // Draw ID hash as dots
    const hash = assetId.replace(/-/g,"");
    for (let i = 0; i < Math.min(hash.length, 36); i++) {
      const val = parseInt(hash[i], 16);
      if (val > 7) {
        const row = Math.floor(i / 6);
        const col = i % 6;
        ctx.fillRect(38 + col * 8, 38 + row * 8, 6, 6);
      }
    }
    ctx.fillStyle = "#0f172a";
  }, [assetId]);

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><body style="text-align:center;font-family:Arial">
      <h3>${assetName}</h3>
      <img src="${canvas.toDataURL()}" width="200" />
      <p style="font-size:10px">${assetId}</p>
      <script>window.print();window.close();</script>
    </body></html>`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={120} height={120} className="border border-slate-100 rounded" />
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800 truncate max-w-32">{assetName}</p>
        <p className="text-xs text-slate-400 font-mono">{(assetId || []).slice(0,8)}</p>
      </div>
      <button
        onClick={handlePrint}
        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 text-white rounded-lg hover:bg-slate-700"
      >
        <Printer className="w-3 h-3" /> Print
      </button>
    </div>
  );
}

export default function QRCodesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["assets-qr"],
    queryFn: () => authFetch("/api/v1/assets/?limit=50").then(r => r.json()),
  });

  const assets = Array.isArray(data) ? data : data?.data ?? data?.items ?? [];

  if (isLoading) return <PageWrapper><LoadingState title="Loading assets..." /></PageWrapper>;

  return (
    <PageWrapper>
      <PageHeader
        title="Asset QR Codes"
        subtitle="Print QR codes for field technicians to scan"
        badge="Field Operations"
      />

      <SectionCard title={`${(assets || []).length} Assets`}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {toArr(assets).map((asset: any) => (
            <QRCodeBox
              key={asset.id}
              assetId={asset.id}
              assetName={asset.name || asset.category || "Asset"}
            />
          ))}
          {(assets || []).length === 0 && (
            <div className="col-span-4 py-12 text-center text-slate-400">
              <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No assets found</p>
            </div>
          )}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
