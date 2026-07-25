// Triangle Black — useUserPreferences hook
// Sprint 98: Created to fix TS17008 cascade (was imported but missing)

"use client";

import { useState, useEffect, useCallback } from "react";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "en" | "ar";
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  currency: "EGP" | "USD" | "EUR";
  timezone: string;
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
  dashboardLayout: "compact" | "comfortable" | "spacious";
  defaultHotelId: string | null;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  language: "en",
  dateFormat: "DD/MM/YYYY",
  currency: "EGP",
  timezone: "Africa/Cairo",
  sidebarCollapsed: false,
  notificationsEnabled: true,
  dashboardLayout: "comfortable",
  defaultHotelId: null,
};

const STORAGE_KEY = "tb_user_preferences";

function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function savePreferences(prefs: UserPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
    setIsLoaded(true);
  }, []);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        savePreferences(next);
        return next;
      });
    },
    []
  );

  const resetPreferences = useCallback(() => {
    savePreferences(DEFAULT_PREFERENCES);
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences,
    isLoaded,
  };
}
