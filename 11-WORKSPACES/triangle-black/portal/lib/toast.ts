"use client";
import { toast as sonner } from "sonner";

export const toast = {
  success: (msg: string, opts?: any) =>
    sonner.success(msg, { duration: 3000, ...opts }),

  error: (msg: string, opts?: any) =>
    sonner.error(msg, { duration: 5000, ...opts }),

  info: (msg: string, opts?: any) =>
    sonner(msg, { duration: 3000, ...opts }),

  warning: (msg: string, opts?: any) =>
    sonner.warning(msg, { duration: 4000, ...opts }),

  loading: (msg: string) =>
    sonner.loading(msg),

  dismiss: (id?: string | number) =>
    sonner.dismiss(id),

  promise: <T>(promise: Promise<T>, opts: {
    loading: string;
    success: string | ((data: T) => string);
    error:   string | ((err: any) => string);
  }) => sonner.promise(promise, opts),
};

export default toast;
