"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/analytics");
  }, [router]);
  return null;
}
