// @ts-nocheck
"use client";
import { useEffect } from "react";
import { devAutoLogin } from "@/lib/token-store";

export function ClientInit() {
  useEffect(() => {
    // Auto-login in dev mode
    devAutoLogin();
  }, []);

  return null; // no UI
}
