"use client"; // @ts-nocheck
/**
 * useApiData - Safe data extraction from react-query responses
 * Handles all API response shapes: array, {data:[]}, {items:[]}, {results:[]}
 */
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "./useAuthFetch";

/**
 * Extract array from any API response shape
 */
export function toArray<T = any>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response as T[];
  // Common API response shapes
  for (const key of ["data","items","results","records","list","signals","alerts"]) {
    if (Array.isArray(response[key])) return response[key] as T[];
  }
  return [];
}

/**
 * Safe number extraction
 */
export function toNumber(val: any, fallback = 0): number {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

/**
 * useApiArray - fetch endpoint and always return array
 */
export function useApiArray<T = any>(queryKey: string[], url: string, options: any = {}) {
  const result = useQuery(
    queryKey,
    () => authFetch(url).then(r => r.json()),
    { retry: 1, staleTime: 30000, ...options }
  );
  return {
    ...result,
    data: toArray<T>(result.data),
  };
}

export default useApiArray;
