"use client";
// @ts-nocheck
// Triangle Black — Asset QR Code Generator
// Sprint-028: Asset QR Scanner Portal

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const QR_API = (url: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

const STATUS_COLOR: Record<string, string> = {
  operational: "bg-green-100 text-green-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  offline:     "bg-red-100 text-red-800",
  decommissioned: "bg-gray-100 text-gray-600",
};

export default function AssetQRGeneratorPage() {
  const router   = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [assets, setAssets]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [portalUrl, setPortalUrl] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPortalUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/assets/?limit=200")
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : d?.results || d?.items || [];
        setAssets(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const filtered = assets.filter(a =>
    !search || (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.serial_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.location_description || "").toLowerCase().includes(search.toLowerCase())
  );

  const assetUrl = (id: string) => `${portalUrl}/asset/${id}`;

  const handlePrint = (asset: any) => {
    const url = assetUrl(asset.id);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR - ${asset.name}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:20px;}
      h2{margin:8px 0;}p{color:#666;margin:4px 0;font-size:13px;}</style></head>
      <body onload="window.print()">
        <h2>${asset.name}</h2>
        <p>${asset.serial_number || "No serial"} · ${asset.location_description || "No location"}</p>
        <img src="${QR_API(url)}" width="200" height="200" />
        <p style="font-size:11px;margin-top:8px;">${url}</p>
        <p style="font-size:11px;">Scan to view asset details and work orders</p>
      </body></html>
    `);
    win.document.close();
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Asset QR Codes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate and print QR codes for field technicians · {assets.length} assets
          </p>
        </div>
        {selected && (
          <button onClick={() => setSelected(null)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            ← Back to list
          </button>
        )}
      </div>

      {/* QR Detail View */}
      {selected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center space-y-4">
            <h2 className="text-lg font-bold text-[var(--color-text-1)]">{selected.name}</h2>
            <img
              src={QR_API(assetUrl(selected.id))}
              alt={`QR for ${selected.name}`}
              className="mx-auto border border-gray-100 rounded-xl p-2"
              width={200} height={200}
            />
            <p className="text-xs text-gray-400 break-all">{assetUrl(selected.id)}</p>
            <button onClick={() => handlePrint(selected)}
              className="w-full py-2.5 bg-[var(--color-bg)] text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              🖨️ Print QR Label
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-[var(--color-text-1)]">Asset Details</h3>
            {[
              ["Name",        selected.name],
              ["Serial No.",  selected.serial_number || "—"],
              ["Category",    selected.category || "—"],
              ["Location",    selected.location_description || "—"],
              ["Status",      selected.status || "—"],
              ["Criticality", selected.criticality || "—"],
              ["Model",       selected.model || "—"],
              ["Manufacturer",selected.manufacturer || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-[var(--color-text-1)] text-right max-w-48 truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Asset List */}
      {!selected && (
        <>
          <input
            type="search" placeholder="Search assets by name, serial, location..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No assets found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(asset => (
                <div key={asset.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--color-text-1)] truncate">{asset.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{asset.serial_number || "No serial"}</p>
                      <p className="text-xs text-gray-400 truncate">{asset.location_description || "No location"}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLOR[asset.status] || "bg-gray-100 text-gray-600"}`}>
                      {asset.status || "unknown"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelected(asset)}
                      className="flex-1 py-2 bg-[var(--color-bg)] text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors">
                      View QR
                    </button>
                    <button onClick={() => handlePrint(asset)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                      🖨️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
