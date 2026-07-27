"use client";
// @ts-nocheck
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function HubRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/hub"); }, []);
  return <div className="min-h-screen bg-base flex items-center justify-center"><div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A,#0A1530)"}}><div className="tb-hero-inner text-center"><h1 className="tb-hero-title">AI Hub</h1></div></div></div>;
}
