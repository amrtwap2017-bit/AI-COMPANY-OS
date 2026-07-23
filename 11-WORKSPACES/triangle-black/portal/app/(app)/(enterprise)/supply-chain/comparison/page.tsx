"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const fetchBoqTemplate = async (wo_type: string) => {
  const response = await fetch(`/api/v1/ai/documents/boq/template?wo_type=${wo_type}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch BOQ template");
  return response.json();
};

const saveBoq = async (title: string, lines: any[]) => {
  const response = await fetch("/api/v1/ai/documents/boq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, lines }),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to save BOQ");
  return response.json();
};

const BoqBuilderPage = () => {
  const [selectedType, setSelectedType] = useState<string>("hvac");
  const [editableLines, setEditableLines] = useState<any[]>([]);

  const { data: templateData, isLoading, isError } = useQuery(
    ["boqTemplate", selectedType],
    () => fetchBoqTemplate(selectedType),
    {
      refetchOnWindowFocus: false,
      initialData: { wo_type: selectedType, lines: [], total_egp: 0 },
    }
  );

  const handleSaveBOQ = async () => {
    if (!editableLines.length) return;
    try {
      const result = await saveBoq("New BOQ", editableLines);
      alert(`BOQ saved: ${result.title} — ${result.total_egp} EGP`);
    } catch (error) {
      console.error(error);
      alert("Failed to save BOQ");
    }
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load template" />;

  const handleQuantityChange = (index: number, value: string) => {
    setEditableLines((prevLines) =>
      prevLines.map((line, i) => (i === index ? { ...line, quantity: value } : line))
    );
  };

  return (
    <PageWrapper>
      <PageHeader title="BOQ Builder and Document Control" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "BOQ Types Available", value: 4 },
            { label: "Total Templates", value: templateData.total_egp },
            { label: "Documents Created", value: 0 },
          ]}
        />
      </SectionCard>
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedType("hvac")}
          className={`btn ${selectedType === "hvac" ? "btn-active" : ""}`}
        >
          HVAC
        </button>
        <button
          onClick={() => setSelectedType("electrical")}
          className={`btn ${selectedType === "electrical" ? "btn-active" : ""}`}
        >
          Electrical
        </button>
        <button
          onClick={() => setSelectedType("plumbing")}
          className={`btn ${selectedType === "plumbing" ? "btn-active" : ""}`}
        >
          Plumbing
        </button>
        <button
          onClick={() => setSelectedType("general")}
          className={`btn ${selectedType === "general" ? "btn-active" : ""}`}
        >
          General
        </button>
      </div>
      {editableLines.length > 0 && (
        <table className="w-full">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {editableLines.map((line, index) => (
              <tr key={index}>
                <td>{line.description}</td>
                <td><input type="number" value={line.quantity} onChange={(e) => handleQuantityChange(index, e.target.value)} /></td>
                <td>{line.unit}</td>
                <td>{line.unit_price}</td>
                <td>{(parseFloat(line.quantity) * parseFloat(line.unit_price)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editableLines.length > 0 && (
        <div className="mt-4">
          Total: {editableLines.reduce((acc, line) => acc + (parseFloat(line.quantity) * parseFloat(line.unit_price)), 0).toFixed(2)} EGP
        </div>
      )}
      <button onClick={handleSaveBOQ} className="btn btn-primary mt-4">Save BOQ</button>
    </PageWrapper>
  );
};

export default BoqBuilderPage;