// @ts-nocheck
"use client";

import { useParams, useRouter } from "next/navigation";
import { PageWrapper, LoadingState } from "@/components/ui";
import { useEffect } from "react";

const EngineeringSectionPage = () => {
  const params = useParams();
  const section = params?.section;
  const router = useRouter();

  useEffect(() => {
    if (section) {
      switch (section.toLowerCase()) {
        case "intelligence":
          router.replace("/engineering/intelligence");
          break;
        case "actions":
          router.replace("/engineering/actions");
          break;
        case "review":
          router.replace("/engineering/review");
          break;
        case "ai":
          router.replace("/engineering/ai");
          break;
        default:
          router.replace("/engineering");
      }
    }
  }, [section, router]);

  return <LoadingState />;
};

export default EngineeringSectionPage;