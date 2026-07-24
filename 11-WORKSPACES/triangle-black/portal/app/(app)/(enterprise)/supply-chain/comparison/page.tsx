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

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchBoqTemplate = async (wo_type: string) => {
  const response = await fetch(`${BACK}/api/v1/ai/documents/boq/template?wo_type=${wo_type}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch BOQ template");
  return response.json();
};

const saveBoq = async (title: string, lines: any[]) => {
  const response = await fetch(`${BACK}/api/v1/ai/documents/boq`, {
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

  const { data: templateData, isLoading, isError } = useQuery({
    queryKey: ["boqTemplate", selectedType],
    queryFn: () => fetchBoqTemplate(selectedType), refetchOnWindowFocus: false,});

  // Rest of your component code...
};