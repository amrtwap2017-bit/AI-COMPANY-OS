# X3 — Export CSV + Print + Action Bar
import os, json, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/x3.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'created':[], 'fixed':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def write(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,'w') as f: f.write(content)
    log('  CREATED: '+label)
    results['created'].append(label)

log('X3 START — Export CSV + Print + Action Bar')

# Export utilities
export_utils = '''// @ts-nocheck
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
        return /[,"\n]/.test(str) ? `"${str}"` : str;
      }).join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
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
      <p style=\'font-size:11px;color:#64748b\'>Generated: ${new Date().toLocaleString()}</p>
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
'''
write(PORTAL+'/lib/export.ts', export_utils, 'lib/export.ts')

# ExportButton component
export_btn = '''// @ts-nocheck
"use client";
import { useState } from "react";
import { Download, Printer, ChevronDown } from "lucide-react";
import { exportToCsv, printTable } from "@/lib/export";

interface ExportButtonProps {
  data:     Record<string, any>[];
  filename: string;
  title:    string;
}

export function ExportButton({ data, filename, title }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600
          hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl
            border border-slate-200 shadow-lg z-20 overflow-hidden">
            <button
              onClick={() => { exportToCsv(filename, data); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm
                text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Download CSV
            </button>
            <button
              onClick={() => { printTable(title, data); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm
                text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Print
            </button>
          </div>
        </>
      )}
    </div>
  );
}
'''
write(PORTAL+'/components/ui/ExportButton.tsx', export_btn, 'ExportButton.tsx')

# ActionBar — top actions for list pages
action_bar = '''// @ts-nocheck
"use client";
import { ReactNode } from "react";
import { SearchInput } from "@/components/ui";
import { ExportButton } from "@/components/ui/ExportButton";

interface ActionBarProps {
  search?:       { value: string; onChange: (v: string) => void; placeholder?: string };
  export?:       { data: any[]; filename: string; title: string };
  filters?:      ReactNode;
  actions?:      ReactNode;
  resultCount?:  number;
  totalCount?:   number;
}

export function ActionBar({
  search, export: exp, filters, actions, resultCount, totalCount,
}: ActionBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-3 flex-wrap">
        {search && (
          <SearchInput
            value={search.value}
            onChange={e => search.onChange(e.target.value)}
            placeholder={search.placeholder || "Search..."}
            className="w-full sm:w-72"
          />
        )}
        {filters && <div className="flex items-center gap-2">{filters}</div>}
        <div className="ml-auto flex items-center gap-2">
          {resultCount !== undefined && (
            <span className="text-xs text-slate-500">
              {resultCount}{totalCount ? ` of ${totalCount}` : ""} results
            </span>
          )}
          {exp && <ExportButton data={exp.data} filename={exp.filename} title={exp.title} />}
          {actions}
        </div>
      </div>
    </div>
  );
}
'''
write(PORTAL+'/components/ui/ActionBar.tsx', action_bar, 'ActionBar.tsx')

# Update ui/index.ts
ui_idx = PORTAL + '/components/ui/index.ts'
with open(ui_idx) as f: ui = f.read()
new_exports = [
    "export { ExportButton } from './ExportButton';",
    "export { ActionBar } from './ActionBar';",
]
added = False
for exp in new_exports:
    if exp not in ui:
        ui += chr(10) + exp
        added = True
if added:
    with open(ui_idx,'w') as f: f.write(ui)
    log('  Updated: ui/index.ts')
    results['fixed'].append('ui/index.ts updated')

log('='*40)
log('X3 COMPLETE — Created: '+str(len(results['created'])))
for c in results['created']: log('  OK '+c)
with open('/home/amr/AI-COMPANY-OS/tasks/logs/x3_result.json','w') as f:
    json.dump(results,f,indent=2)