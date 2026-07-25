// @ts-nocheck
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui";

const SECTION_MAP = {
  "overview":  "/projects-center",
  "active":    "/projects-center",
  "completed": "/projects-center/review",
  "reports":   "/executive/reports",
  "intelligence": "/projects-center/intelligence",
  "actions":   "/projects-center/actions",
};

export default function ProjectSectionPage() {
  const router = useRouter();
  const params = useParams();
  const section = String(params?.section || "overview");

  useEffect(() => {
    const target = SECTION_MAP[section] || "/projects-center";
    router.replace(target);
  }, [router, section]);

  return <LoadingState message={`Loading ${section} section...`} />;
}
