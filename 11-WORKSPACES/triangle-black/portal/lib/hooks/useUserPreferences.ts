// @ts-nocheck
/**
 * useUserPreferences — Triangle Black user preference management
 * Reads/writes preferences to /api/v1/user-preferences/{userId}
 * Supports: dashboard widget visibility, theme, table columns, layout
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "./useAuthFetch";

const DEFAULT_USER = "portal_user";

// Default preferences for new users
const DEFAULT_PREFS: Record<string, string> = {
  "dashboard.widgets.digital_twin": "true",
  "dashboard.widgets.ai_signals":   "true",
  "dashboard.widgets.cash_flow":    "true",
  "dashboard.widgets.sla":          "true",
  "dashboard.widgets.pred_maint":   "true",
  "theme":                          "light",
  "table.wo.density":               "normal",
  "table.wo.columns":               "title,status,priority,type,due_date",
  "sidebar.collapsed":              "false",
};

export function useUserPreferences(userId: string = DEFAULT_USER) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["user-prefs", userId],
    queryFn: () =>
      authFetch(`/api/v1/user-preferences/${userId}`)
        .then(r => r.json())
        .then(d => ({ ...DEFAULT_PREFS, ...(d.preferences ?? {}) })),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const setPref = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string | boolean | object }) => {
      const strValue = typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
      return authFetch(`/api/v1/user-preferences/${userId}/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: strValue }),
      }).then(r => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-prefs", userId] });
    },
  });

  const setBulk = useMutation({
    mutationFn: (prefs: Record<string, string | boolean | object>) => {
      const strPrefs: Record<string, string> = {};
      for (const [k, v] of Object.entries(prefs)) {
        strPrefs[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
      }
      return authFetch(`/api/v1/user-preferences/${userId}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: strPrefs }),
      }).then(r => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-prefs", userId] });
    },
  });

  const prefs = data ?? DEFAULT_PREFS;

  const getBoolean = (key: string, fallback = true): boolean => {
    const val = prefs[key];
    if (val === undefined) return fallback;
    return val === "true" || val === true;
  };

  const getString = (key: string, fallback = ""): string => {
    return prefs[key] ?? fallback;
  };

  const widgetVisible = (widgetKey: string): boolean => {
    return getBoolean(`dashboard.widgets.${widgetKey}`, true);
  };

  const toggleWidget = (widgetKey: string) => {
    const current = widgetVisible(widgetKey);
    setPref.mutate({
      key: `dashboard.widgets.${widgetKey}`,
      value: String(!current),
    });
  };

  return {
    prefs,
    isLoading,
    setPref:       (key: string, value: string | boolean | object) => setPref.mutate({ key, value }),
    setBulk:       (prefs: Record<string, any>) => setBulk.mutate(prefs),
    getBoolean,
    getString,
    widgetVisible,
    toggleWidget,
    isSaving:      setPref.isPending || setBulk.isPending,
  };
}

export default useUserPreferences;
