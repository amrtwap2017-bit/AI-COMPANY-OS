// @ts-nocheck
/**
 * normalize - safely extract array from any API response shape
 * API may return: array | { data: array } | { items: array } | { results: array }
 */
export function toArray<T = any>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.records)) return response.records;
  // If it's an object with numeric keys, convert
  if (typeof response === "object") {
    const vals = Object.values(response);
    if (vals.length > 0 && Array.isArray(vals[0])) return vals[0] as T[];
  }
  return [];
}

/**
 * safeSort - sort without crashing if not array
 */
export function safeSort<T>(arr: any, compareFn?: (a: T, b: T) => number): T[] {
  return toArray<T>(arr).sort(compareFn);
}

/**
 * safeFilter - filter without crashing
 */
export function safeFilter<T>(arr: any, fn: (item: T) => boolean): T[] {
  return toArray<T>(arr).filter(fn);
}

/**
 * safeMap - map without crashing
 */
export function safeMap<T, U>(arr: any, fn: (item: T, i: number) => U): U[] {
  return toArray<T>(arr).map(fn);
}
