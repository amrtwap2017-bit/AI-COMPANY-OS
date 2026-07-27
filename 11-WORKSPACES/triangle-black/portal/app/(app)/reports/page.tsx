"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/analytics"); }, [router]);
  return <div className="flex items-center justify-center h-screen text-gray-400">Redirecting...</div>;
}
