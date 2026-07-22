"use client"; // @ts-nocheck

import { useParams, useRouter } from "next/navigation";
import { PageWrapper, PageHeader, LoadingState } from "@/components/ui";
import { useEffect } from "react";

const MaintenancePage = () => {
  const params = useParams();
  const section = params?.section;
  const router = useRouter();

  useEffect(() => {
    if (section) {
      switch (section.toLowerCase()) {
        case "assets":
          router.replace("/maintenance/assets");
          break;
        case "pm-plans":
          router.replace("/maintenance/pm-plans");
          break;
        case "schedule":
          router.replace("/maintenance/schedule");
          break;
        case "intelligence":
          router.replace("/maintenance/intelligence");
          break;
        case "review":
          router.replace("/maintenance/review");
          break;
        case "actions":
          router.replace("/maintenance/actions");
          break;
        case "asset-tree":
          router.replace("/maintenance/asset-tree");
          break;
        default:
          router.replace("/maintenance");
      }
    }
  }, [section, router]);

  return (
    <PageWrapper>
      <PageHeader title="Maintenance" />
      <LoadingState message="Loading maintenance section..." />
    </PageWrapper>
  );
};

export default MaintenancePage;