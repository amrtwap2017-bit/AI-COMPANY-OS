"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function QRCodesRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/operations/assets/qr"); }, []);
  return null;
}
