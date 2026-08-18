// @ts-nocheck
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
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-secondary
          hover:bg-surface-alt rounded-lg border border-border transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl
            border border-border shadow-lg z-20 overflow-hidden">
            <button
              onClick={() => { exportToCsv(filename, data); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm
                text-primary hover:bg-base-alt transition-colors"
            >
              <Download className="w-4 h-4 text-tertiary" />
              Download CSV
            </button>
            <button
              onClick={() => { printTable(title, data); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm
                text-primary hover:bg-base-alt transition-colors"
            >
              <Printer className="w-4 h-4 text-tertiary" />
              Print
            </button>
          </div>
        </>
      )}
    </div>
  );
}
