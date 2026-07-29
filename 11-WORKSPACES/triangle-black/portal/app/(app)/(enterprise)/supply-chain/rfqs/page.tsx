"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function RFQsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/supply-chain/rfq-management"); }, []);
  return null;
}
