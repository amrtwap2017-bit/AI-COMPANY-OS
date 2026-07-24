"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import {
  PageWrapper,
  PageHeader,
  SectionCard,
  MetricStrip,
  StatusBadge,
  LoadingState,
  EmptyState,
} from "@/components/ui";

const fetchSignals = async () => {
  const response = await fetch("/api/v1/ai/signals", { credentials: "include" });
  return response.json();
};

const fetchSLA = async () => {
  const response = await fetch("/api/v1/ai/analytics/sla", { credentials: "include" });
  return response.json();
};

const fetchContracts = async () => {
  const response = await fetch("/api/v1/contracts", { credentials: "include" });
  return response.json();
};

const RiskRegisterPage = () => {
  const signalsQuery = useQuery(["signals"], fetchSignals, { refetchInterval: 60000 });
  const slaQuery = useQuery(["sla"], fetchSLA, { refetchInterval: 60000 });
  const contractsQuery = useQuery(["contracts"], fetchContracts, { refetchInterval: 60000 });

  if (signalsQuery.isLoading || slaQuery.isLoading || contractsQuery.isLoading) {
    return <LoadingState />;
  }

  if (signalsQuery.isError || slaQuery.isError || contractsQuery.isError) {
    return <EmptyState message="Failed to load data" />;
  }

  const signals = signalsQuery.data;
  const slaData = slaQuery.data;
  const contracts = contractsQuery.data;

  const highRisks = (signals || []).filter(signal => signal.priority === "critical");
  const mediumRisks = (signals || []).filter(signal => signal.priority === "high");

  const complianceRisk = slaData.compliance < 95 ? (
    <SectionCard title="SLA Risk" status="red">
      Compliance gap: {Math.abs(slaData.compliance - 100).toFixed(2)}%
    </SectionCard>
  ) : null;

  const financialRisk = (contracts || []).filter(contract => contract.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).reduce((acc, contract) => acc + contract.valueAtRisk, 0);

  return (
    <PageWrapper>
      <PageHeader title="Executive Risk Register" />
      <div className="grid grid-cols-3 gap-4">
        <MetricStrip title="High Risks" value={highRisks.length} color="red" />
        <MetricStrip title="Medium Risks" value={mediumRisks.length} color="orange" />
        {complianceRisk}
      </div>
      <SectionCard title="Risk Register Table">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Risk ID</th>
              <th>Description</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Impact</th>
              <th>Mitigation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(signals || []).sort((a, b) => (b.priority === "critical" ? -1 : 1)).map(signal => (
              <tr key={signal.id}>
                <td>{signal.id}</td>
                <td>{signal.title}</td>
                <td><StatusBadge status={signal.category} /></td>
                <td><StatusBadge status={signal.priority} /></td>
                <td>{signal.impact === "critical" ? "HIGH" : signal.impact === "high" ? "MEDIUM" : "LOW"}</td>
                <td>{signal.recommended_action}</td>
                <td><StatusBadge status="active" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
      {financialRisk > 0 && (
        <SectionCard title="Financial Risk">
          Contracts expiring in 30 days: ${(Number(financialRisk) || 0).toFixed(2)}
        </SectionCard>
      )}
    </PageWrapper>
  );
};

export default RiskRegisterPage;