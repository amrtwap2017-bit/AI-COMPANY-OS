// @ts-nocheck
import { useState, useMemo } from "react";

export function usePagination<T>(
  items: T[],
  pageSize = 20
) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  // Reset to page 1 when items change significantly
  function reset() { setPage(1); }

  return {
    page,
    totalPages,
    pageSize,
    total:     items.length,
    items:     paginatedItems,
    goToPage,
    reset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
