"use client";
// @ts-nocheck
// Triangle Black — Technician Portal Entry
// Sprint-018: Mobile Technician Portal

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TechnicianPortalPage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("tb_access_token");
    if (token) {
      router.replace("/technician-portal/dashboard");
    } else {
      router.replace("/login?redirect=/technician-portal/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Loading Technician Portal...</p>
      </div>
    </div>
  );
}
