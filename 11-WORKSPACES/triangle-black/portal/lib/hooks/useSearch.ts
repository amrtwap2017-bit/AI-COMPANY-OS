// @ts-nocheck
import { useState, useMemo } from "react";

export function useSearch<T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[]
) {
  const [query, setQuery] = useState("");

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
    total:     items.length,
    found:     filtered.length,
    hasQuery:  query.trim().length > 0,
    clear:     () => setQuery(""),
  };
}
