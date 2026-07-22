"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/commercial/contracts/renewal");
  }, [router]);
  return null;
}
