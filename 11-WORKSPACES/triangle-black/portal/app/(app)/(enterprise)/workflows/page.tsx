"use client";
// @ts-nocheck
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function R() {
  const router = useRouter();
  useEffect(() => { router.replace("/workflow-designer"); }, []);
  return <div className="min-h-screen bg-base flex items-center justify-center"><div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A,#0E1B30)"}}><div className="tb-hero-inner text-center"><div className="text-label-upper text-cyan-400 mb-2">Loading</div><h1 className="tb-hero-title">Triangle Black</h1></div></div></div>;
}
