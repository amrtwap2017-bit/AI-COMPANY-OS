// Triangle Black — Shared Utility Helpers

export const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

export const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};

export const fmtEGP = (n: any): string => {
  try { return `EGP ${Number(n || 0).toLocaleString()}`; }
  catch { return "EGP 0"; }
};

export const fmtPct = (n: any): string => {
  try { return `${Number(n || 0).toFixed(1)}%`; }
  catch { return "0%"; }
};
