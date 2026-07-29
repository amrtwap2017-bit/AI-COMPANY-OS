"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function ApprovalsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/supply-chain/approvals-center"); }, []);
  return null;
}
