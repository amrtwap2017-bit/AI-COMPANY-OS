"use client";
// @ts-nocheck
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
export default function Redirect() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  useEffect(() => { router.replace(id ? "/supply-chain/purchase-requests/" + id : "/supply-chain/purchase-requests"); }, [id]);
  return <div className="min-h-screen bg-base flex items-center justify-center"><div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A,#0E1B30)"}}><div className="tb-hero-inner text-center"><h1 className="tb-hero-title">Loading...</h1></div></div></div>;
}
