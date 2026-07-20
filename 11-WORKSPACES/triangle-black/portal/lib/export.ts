"use client";
// @ts-nocheck
// Export utilities — CSV download + print

export function exportToCsv(filename: string, data: Record<string, any>[]) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? "";
        const str = String(val).replace(/"/g, '""');
        return /[,"
]/.test(str) ? `"${str}"` : str;
      }).join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("
")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename.endsWith(".csv") ? filename : filename + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function printTable(title: string, data: Record<string, any>[]) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    `<tr>${headers.map(h => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`
  ).join("");

  const html = `
    <html><head><title>${title}</title>
    <style>
      body { font-family: sans-serif; font-size: 12px; }
      h1 { font-size: 18px; margin-bottom: 12px; }
      table { border-collapse: collapse; width: 100%; }
      th { background: #f1f5f9; padding: 6px 10px; text-align: left; border: 1px solid #e2e8f0; font-size: 11px; }
      td { padding: 5px 10px; border: 1px solid #e2e8f0; }
      tr:nth-child(even) { background: #f8fafc; }
      @media print { button { display: none; } }
    </style></head>
    <body>
      <h1>${title}</h1>
      <p style='font-size:11px;color:#64748b'>Generated: ${new Date().toLocaleString()}</p>
      <table>
        <thead><tr>${headers.map(h => `<th>${h.replace(/_/g," ")}</th>`).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>
  `;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : filename + ".json";
  a.click();
  URL.revokeObjectURL(url);
}
