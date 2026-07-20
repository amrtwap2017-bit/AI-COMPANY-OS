// @ts-nocheck
import { useState, useMemo } from "react";

function toArray<T>(items: T[] | any): T[] {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (Array.isArray(items.items))         return items.items;
  if (Array.isArray(items.data))          return items.data;
  if (Array.isArray(items.results))       return items.results;
  if (Array.isArray(items.leads))         return items.leads;
  if (Array.isArray(items.notifications)) return items.notifications;
  if (Array.isArray(items.customers))     return items.customers;
  if (Array.isArray(items.queue))         return items.queue;
  return [];
}

export function useSearch<T extends Record<string, any>>(
  rawItems: T[] | any,
  searchFields: (keyof T)[]
) {
  const [query, setQuery] = useState("");
  const items = toArray<T>(rawItems);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      searchFields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }, [items, query, searchFields]);

  return {
    query,
    setQuery,
    filtered,
    total:    items.length,
    found:    filtered.length,
    hasQuery: query.trim().length > 0,
    clear:    () => setQuery(""),
  };
}
