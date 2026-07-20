# P3 — Improve API Client: Error Handling + Retry + Toast
import os, shutil, re, json, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/p3.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'fixed':[], 'created':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

log('P3 START — API Error Handling + Retry + Notifications')

# Create React Query config with retry + error handling
rq_config = '''// @ts-nocheck
// React Query global configuration
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 30_000,       // 30 seconds
      gcTime:    5 * 60_000,   // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Global error handler
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "observerResultsUpdated") {
    const query = event.query;
    if (query.state.status === "error") {
      const error = query.state.error as any;
      if (error?.status === 401) {
        // Silent — handled by individual components
        return;
      }
    }
  }
});
'''

config_path = PORTAL + '/lib/query-client.ts'
with open(config_path,'w') as f: f.write(rq_config)
log('  Created: lib/query-client.ts')
results['created'].append('lib/query-client.ts')

# Create API error utility
api_error = '''// @ts-nocheck
// API Error utilities

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function isServerError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 500;
}
'''

error_path = PORTAL + '/lib/api-error.ts'
with open(error_path,'w') as f: f.write(api_error)
log('  Created: lib/api-error.ts')
results['created'].append('lib/api-error.ts')

# Create notification helper
notify = '''// @ts-nocheck
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
'''

notify_path = PORTAL + '/lib/notify.ts'
with open(notify_path,'w') as f: f.write(notify)
log('  Created: lib/notify.ts')
results['created'].append('lib/notify.ts')

# Create constants file
constants = '''// @ts-nocheck
// Application constants

export const APP_NAME = "Triangle Black";
export const APP_VERSION = "2.0.0";
export const EGYPT_MARKET = "Egypt";

export const API_TIMEOUT = 30_000; // 30 seconds
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const LEAD_STATUSES = [
  { value: "new",         label: "New",          color: "purple"  },
  { value: "qualified",   label: "Qualified",    color: "blue"    },
  { value: "negotiation", label: "Negotiation",  color: "amber"   },
  { value: "won",         label: "Won",          color: "emerald" },
  { value: "lost",        label: "Lost",         color: "red"     },
] as const;

export const WO_STATUSES = [
  { value: "open",        label: "Open",         color: "blue"    },
  { value: "in_progress", label: "In Progress",  color: "amber"   },
  { value: "completed",   label: "Completed",    color: "emerald" },
  { value: "cancelled",   label: "Cancelled",    color: "red"     },
] as const;

export const PRIORITIES = [
  { value: "low",       label: "Low",       color: "#6b7280" },
  { value: "medium",    label: "Medium",    color: "#3b82f6" },
  { value: "high",      label: "High",      color: "#f59e0b" },
  { value: "critical",  label: "Critical",  color: "#ef4444" },
  { value: "emergency", label: "Emergency", color: "#dc2626" },
] as const;

export const EGYPT_HOTEL_TYPES = [
  "5-Star Hotel", "4-Star Hotel", "Resort",
  "Business Hotel", "Boutique Hotel", "Aparthotel",
] as const;

export const EGYPT_CITIES = [
  "Cairo", "Alexandria", "Sharm El Sheikh",
  "Hurghada", "Luxor", "Aswan", "Marsa Alam",
] as const;
'''

constants_path = PORTAL + '/lib/constants.ts'
with open(constants_path,'w') as f: f.write(constants)
log('  Created: lib/constants.ts')
results['created'].append('lib/constants.ts')

log(chr(10)+'='*40)
log('P3 COMPLETE — Created: '+str(len(results['created'])))
for c in results['created']: log('  OK '+c)
import json as _j
with open('/home/amr/AI-COMPANY-OS/tasks/logs/p3_result.json','w') as f:
    _j.dump(results,f,indent=2)