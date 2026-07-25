// @ts-nocheck
"use client";

import { useState } from "react";
import { Button, EmptyState, PageHeader, PageWrapper, SectionCard } from "@/components/ui";
import Link from "next/link";
import {

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};

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
        {toArr(presets).map((preset: any) => (
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