"use client";
/**
 * Triangle Black Theme System
 * Manages dual-theme: obsidian (dark) and ivory (light)
 * Persists to localStorage. Applies data-theme to document element.
 */
import { useEffect, useState, useCallback } from "react";

export type TBTheme = "obsidian" | "ivory";

const STORAGE_KEY = "tb-theme";
const DEFAULT_THEME: TBTheme = "ivory";

export function useTheme() {
  const [theme, setThemeState] = useState<TBTheme>(DEFAULT_THEME);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as TBTheme | null;
    const initial = stored === "obsidian" || stored === "ivory"
      ? stored
      : DEFAULT_THEME;
    applyTheme(initial);
    setThemeState(initial);
  }, []);

  const setTheme = useCallback((next: TBTheme) => {
    applyTheme(next);
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "ivory" ? "obsidian" : "ivory");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, isDark: theme === "obsidian" };
}

function applyTheme(theme: TBTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  // Keep .dark class in sync for Tailwind dark: variants
  if (theme === "obsidian") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
