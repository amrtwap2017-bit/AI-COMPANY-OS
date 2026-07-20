// @ts-nocheck
export function toList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.results?.items)) return payload.results.items;
  return [];
}

export function toCount(payload: any): number {
  if (typeof payload === "number") return payload;
  if (typeof payload?.count === "number") return payload.count;
  if (typeof payload?.total === "number") return payload.total;
  if (typeof payload?.data?.count === "number") return payload.data.count;
  if (typeof payload?.data?.total === "number") return payload.data.total;
  const list = toList(payload);
  return list.length;
}

export function toNumber(...values: any[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function formatCurrency(value: number | null, currency = "EGP") {
  if (value === null) return "--";
  return `${currency} ${value.toLocaleString()}`;
}

export function formatCount(value: number | null) {
  if (value === null) return "--";
  return value.toLocaleString();
}

export function firstDefined<T>(...values: T[]): T | null {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

export function asText(value: any, fallback = "—") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}
