// @ts-nocheck
// Notification utilities using sonner
import { toast } from "sonner";

export const notify = {
  success: (msg: string) => toast.success(msg),
  error:   (msg: string) => toast.error(msg),
  info:    (msg: string) => toast.info(msg),
  warning: (msg: string) => toast.warning(msg),
  loading: (msg: string) => toast.loading(msg),

  apiSuccess: (action: string) =>
    toast.success(action + " completed successfully"),

  apiError: (action: string, error?: unknown) => {
    const msg = error instanceof Error ? error.message : "Please try again";
    toast.error(action + " failed: " + msg);
  },

  promise: <T>(promise: Promise<T>, msgs: {
    loading: string; success: string; error: string;
  }) => toast.promise(promise, msgs),
};
