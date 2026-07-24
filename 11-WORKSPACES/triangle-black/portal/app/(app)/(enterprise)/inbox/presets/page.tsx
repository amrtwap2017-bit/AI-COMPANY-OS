"use client"; // @ts-nocheck

import { useState } from "react";
import Link from "next/link";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  EmptyState,
  Button,
} from "@/components/ui";

const presets = [
  { name: "Critical Alerts", filter: "priority=critical&channel=Signal" },
  { name: "Maintenance Signals", filter: "category=maintenance" },
  { name: "Supply Chain Alerts", filter: "category=inventory" },
  { name: "Commercial Updates", filter: "category=commercial" },
  { name: "All Signals", filter: "" },
];

const InboxPresetsPage = () => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  return (
    <PageWrapper>
      <PageHeader title="Inbox Presets" description="Saved filters and views for inbox" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset: any) => (
          <SectionCard
            key={preset.name}
            title={preset.name}
            selected={selectedPreset === preset.name}
            onClick={() => setSelectedPreset(preset.name)}
          >
            <p className="text-sm text-gray-500">Filter: {preset.filter}</p>
            <Link href={`/alerts?filter=${preset.filter}`}>
              <Button size="sm" variant="outline">
                View
              </Button>
            </Link>
          </SectionCard>
        ))}
      </div>
      <EmptyState title="Custom presets coming soon" />
    </PageWrapper>
  );
};

export default InboxPresetsPage;