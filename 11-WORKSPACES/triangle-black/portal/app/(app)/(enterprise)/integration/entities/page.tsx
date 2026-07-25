// @ts-nocheck
"use client";

import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge } from "@/components/ui";
import Link from "next/link";

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


const entities = [
  { name: "Work Orders", records: 72, operations: ["Create", "Read", "Update"], link: "/operations/work-orders" },
  { name: "Technicians", records: 25, operations: ["Read", "Assign"], link: "/operations/technicians" },
  { name: "Assets", records: 46, operations: ["Read", "Monitor"], link: "/maintenance/assets" },
  { name: "PM Plans", records: 30, operations: ["Create", "Schedule"], link: "/maintenance/pm-plans" },
  { name: "Contracts", records: 72, operations: ["Read", "Renew"], link: "/customers/review" },
  { name: "Invoices", records: 45, operations: ["Read"], link: "/customers/review" },
  { name: "Purchase Orders", records: 21, operations: ["Create", "Receive"], link: "/supply-chain/purchase-orders" },
  { name: "Purchase Requests", records: null, operations: ["Create", "Approve"], link: "/approvals" },
  { name: "Vendors", records: 13, operations: ["Read", "Compare"], link: "/supply-chain/vendors" },
  { name: "RFQs", records: 8, operations: ["Create", "Track"], link: "/supply-chain/rfqs" },
  { name: "Leads", records: 110, operations: ["Create", "Track"], link: "/commercial/pipeline" },
  { name: "Projects", records: 12, operations: ["Read", "Monitor"], link: "/projects-center" },
];

const AI_SIGNAL_ENTITY = {
  name: "signals_engine",
  types: 9,
};

export default function Page() {
  return (
    <PageWrapper>
      <PageHeader title="Data Entities Overview" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStrip label="Total Entities" value={12} />
        <MetricStrip label="API Routes" value={115} />
        <MetricStrip label="AI Endpoints" value={9} />
        <MetricStrip label="Database Tables" value={126} />
      </div>
      <SectionCard title="Entity Registry">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">Entity Name</th>
              <th className="border px-4 py-2">Records</th>
              <th className="border px-4 py-2">Primary Operations</th>
              <th className="border px-4 py-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {toArr(entities).map((entity, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{entity.name}</td>
                <td className="border px-4 py-2">{entity.records !== null ? entity.records : "varies"}</td>
                <td className="border px-4 py-2">
                  {entity.toArr(operations).map((operation, opIndex) => (
                    <span key={opIndex} className="mr-2">
                      {operation}
                    </span>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  <Link href={entity.link}>
                    <a className="text-blue-500 hover:underline">View</a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
      <SectionCard title="AI Signal Entity">
        <div className="flex items-center space-x-4">
          <span>{AI_SIGNAL_ENTITY.name}</span>
          <StatusBadge status="active" />
        </div>
        <p>Signal Types: {AI_SIGNAL_ENTITY.types}</p>
      </SectionCard>
    </PageWrapper>
  );
}