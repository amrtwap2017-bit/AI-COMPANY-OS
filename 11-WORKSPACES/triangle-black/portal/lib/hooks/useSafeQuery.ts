"use client"; // @ts-nocheck
/**
 * safeQuery - Direct fetch wrapper that bypasses react-query version issues
 * Use this instead of useQuery when react-query version conflicts occur
 */
import { useState, useEffect } from "react";

export function useSafeQuery(key: string[], fn: () => Promise<any>, options: any = {}) {
  const [data, setData]       = useState<any>(null);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError]   = useState(false);
  const [error, setErrorMsg]  = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fn().then(d => {
      if (!cancelled) { setData(d); setLoading(false); }
    }).catch(e => {
      if (!cancelled) { setErrorMsg(e); setError(true); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [JSON.stringify(key)]);

  const refetch = () => {
    setLoading(true);
    fn().then(d => { setData(d); setLoading(false); })
       .catch(e => { setErrorMsg(e); setError(true); setLoading(false); });
  };

  return { data, isLoading, isError, error, refetch };
}

export function useSafeMutation(fn: (vars: any) => Promise<any>, options: any = {}) {
  const [isLoading, setLoading] = useState(false);
  const [isError, setError]   = useState(false);
  const [data, setData]       = useState<any>(null);

  const mutate = async (variables: any) => {
    setLoading(true); setError(false);
    try {
      const result = await fn(variables);
      setData(result);
      options.onSuccess?.(result, variables);
      setLoading(false);
      return result;
    } catch (e: any) {
      setError(true);
      options.onError?.(e, variables);
      setLoading(false);
      throw e;
    }
  };

  return { mutate, mutateAsync: mutate, isLoading, isPending: isLoading, isError, data };
}
