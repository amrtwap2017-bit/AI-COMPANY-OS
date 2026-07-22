"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function LegacyRedirectPage() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    const id = params?.id;
    router.replace(id ? `/customers/${{id}}` : "/customers");
  }, [router, params]);
  return null;
}
