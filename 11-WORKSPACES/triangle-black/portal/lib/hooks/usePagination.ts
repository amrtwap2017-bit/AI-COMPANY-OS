// @ts-nocheck
import { useState, useMemo } from "react";

function toArray<T>(items: T[] | any): T[] {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  // Handle API responses that return {items:[], data:[], results:[]}
  if (Array.isArray(items.items))   return items.items;
  if (Array.isArray(items.data))    return items.data;
  if (Array.isArray(items.results)) return items.results;
  if (Array.isArray(items.leads))   return items.leads;
  if (Array.isArray(items.notifications)) return items.notifications;
  if (Array.isArray(items.customers))     return items.customers;
  if (Array.isArray(items.queue))         return items.queue;
  return [];
}

export function usePagination<T>(
  rawItems: T[] | any,
  pageSize = 20
) {
  const [page, setPage] = useState(1);
  const items = toArray<T>(rawItems);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  function reset() { setPage(1); }

  return {
    page,
    totalPages,
    pageSize,
    total:   items.length,
    items:   paginatedItems,
    goToPage,
    reset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
