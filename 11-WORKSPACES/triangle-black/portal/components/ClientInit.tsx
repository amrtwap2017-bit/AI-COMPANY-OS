// @ts-nocheck
// Triangle Black - Client Init
// Program A - Task A1: Uses tokenManager for dev auto-login
"use client";
import { useEffect } from "react";
import { tokenManager } from "@/lib/auth/token-manager";

export function ClientInit() {
  useEffect(() => {
    tokenManager.devAutoLogin();
  }, []);
  return null;
}
