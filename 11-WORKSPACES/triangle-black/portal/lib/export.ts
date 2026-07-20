"use client";
// @ts-nocheck
// Export utilities — browser only, call from event handlers only

export function exportToCsv(filename: string, data: Record<string, any>[]) {
  if (typeof window === "undefined") return;
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = [
    headers.join(","),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? "";
        const s = String(val).replace(/"/g, '\\"');
        return /[,\"\n]/.test(s) ? `"${s}"` : s;
      }).join(",")
    ),
  ];
  const blob = new window.Blob([rows.join("\n")], { type: "text/csv" });
  const url  = window.URL.createObjectURL(blob);
  const a    = window.document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : filename + ".csv";
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function printTable(title: string, data: Record<string, any>[]) {
  if (typeof window === "undefined") return;
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    `<tr>${headers.map(h => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`
  ).join("");
  const html = `<html><head><title>${title}</title>
    <style>body{font-family:sans-serif;font-size:12px}
    table{border-collapse:collapse;width:100%}
    th,td{padding:6px 10px;border:1px solid #e2e8f0;text-align:left}
    th{background:#f1f5f9;font-size:11px}
    tr:nth-child(even){background:#f8fafc}</style></head>
    <body><h2>${title}</h2>
    <table><thead><tr>${headers.map(h=>`<th>${h.replace(/_/g," ")}</th>`).join("")}</tr></thead>
    <tbody>${rows}</tbody></table></body></html>`;
  const w = window.open("","_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export function downloadJson(filename: string, data: unknown) {
  if (typeof window === "undefined") return;
  const blob = new window.Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );
  const url = window.URL.createObjectURL(blob);
  const a   = window.document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : filename + ".json";
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
