"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function VendorsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/supply-chain/vendor-management"); }, []);
  return null;
}
