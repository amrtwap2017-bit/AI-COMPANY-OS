"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function InvoiceMatchingRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/supply-chain/invoices"); }, []);
  return null;
}
