// @ts-nocheck
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Redirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/operations/work-orders/new"); }, [router]);
  return null;
}
