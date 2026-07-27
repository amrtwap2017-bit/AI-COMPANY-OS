"use client";
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  
  useEffect(() => {
    if (id) {
      router.replace("/operations/technicians/" + id);
    } else {
      router.replace("/operations/technicians");
    }
  }, [id, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center" className="bg-base">
      <div style={{textAlign:"center"}}>
        <div style={{width:32,height:32,borderRadius:"50%",border:"3px solid var(--color-brand)",borderTopColor:"transparent",margin:"0 auto",animation:"spin 0.8s linear infinite"}}/>
        <div className="tb-empty-desc">Redirecting...</div>
      </div>
    </div>
  );
}
