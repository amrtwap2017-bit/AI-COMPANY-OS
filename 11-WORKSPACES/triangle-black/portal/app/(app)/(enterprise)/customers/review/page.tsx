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
  Progress,
} from "@/components/ui";

const fetchContracts = async () => {
  const response = await fetch("/api/v1/contracts", { credentials: "include" });
  return response.json();
};

const fetchWorkOrders = async () => {
  const response = await fetch("/api/v1/work-orders", { credentials: "include" });
  return response.json();
};

const fetchInvoices = async () => {
  const response = await fetch("/api/v1/invoices", { credentials: "include" });
  return response.json();
};

const CustomerSuccessPage = () => {
  const contractsQuery = useQuery(["contracts"], fetchContracts, {
    refetchInterval: 300000,
  });

  const workOrdersQuery = useQuery(["work-orders"], fetchWorkOrders, {
    refetchInterval: 300000,
  });

  const invoicesQuery = useQuery(["invoices"], fetchInvoices, {
    refetchInterval: 300000,
  });

  if (contractsQuery.isLoading || workOrdersQuery.isLoading || invoicesQuery.isLoading) {
    return <LoadingState />;
  }

  if (contractsQuery.isError || workOrdersQuery.isError || invoicesQuery.isError) {
    return <EmptyState message="Failed to load data" />;
  }

  const contracts = contractsQuery.data;
  const workOrders = workOrdersQuery.data;
  const invoices = invoicesQuery.data;

  const activeContractsCount = contracts.filter((c) => c.status === "active").length;
  const expiredContractsCount = contracts.filter(
    (c) => c.status !== "active" && new Date(c.end_date) < new Date()
  ).length;
  const totalInvoiceValue = invoices.reduce(
    (acc, inv) => acc + inv.total_amount,
    0
  );
  const completedWorkOrdersCount = workOrders.filter((wo) => wo.completed_at).length;
  const totalWorkOrdersCount = workOrders.length;
  const woCompletionRate = ((completedWorkOrdersCount / totalWorkOrdersCount) * 100).toFixed(2);

  const contractHealthData = contracts
    .filter((c) => c.status === "active")
    .map((c) => {
      const woCount = workOrders.filter((wo) => wo.contract_id === c.id).length;
      const invoiceCount = invoices.filter((inv) => inv.contract_id === c.id).length;
      const endDate = new Date(c.end_date);
      const isExpiringSoon = endDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      return {
        client_name: c.client_name,
        contract_value: c.contract_value.toLocaleString() + " EGP",
        status: c.status,
        end_date: isExpiringSoon ? "Expiring soon" : endDate.toDateString(),
        wo_count: woCount,
        invoice_count: invoiceCount,
      };
    })
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
    .slice(0, 10);

  const revenueSummaryData = {
    paid: invoices.filter((inv) => inv.status === "paid").reduce((acc, inv) => acc + inv.total_amount, 0),
    pending: invoices
      .filter((inv) => inv.status === "pending")
      .reduce((acc, inv) => acc + inv.total_amount, 0),
    overdue: invoices
      .filter((inv) => inv.status === "overdue")
      .reduce((acc, inv) => acc + inv.total_amount, 0),
  };

  const recentWorkOrdersData = workOrders
    .filter((wo) => wo.completed_at)
    .slice(0, 5)
    .map((wo) => {
      const contract = contracts.find((c) => c.id === wo.contract_id);
      return {
        title: wo.title,
        contract_name: contract ? contract.client_name : "Unknown",
        type: wo.type,
        completed_at: new Date(wo.completed_at).toLocaleDateString(),
      };
    });

  return (
    <PageWrapper>
      <PageHeader title="Customer Success Overview" />
      <SectionCard title="Metrics">
        <MetricStrip
          metrics={[
            { label: "Active Contracts", value: activeContractsCount },
            { label: "Expired Contracts", value: expiredContractsCount },
            {
              label: "Total Invoice Value EGP",
              value: totalInvoiceValue.toLocaleString() + " EGP",
            },
            { label: "WO Completion Rate", value: woCompletionRate + "%" },
          ]}
        />
      </SectionCard>
      <SectionCard title="Contract Health">
        <div className="grid grid-cols-1 gap-4">
          {contractHealthData.map((c, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-bold">{c.client_name}</h3>
              <p>{c.contract_value}</p>
              <StatusBadge status={c.status} />
              <p>{c.end_date}</p>
              <p>WO Count: {c.wo_count}</p>
              <p>Invoice Count: {c.invoice_count}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Revenue Summary">
        <div className="grid grid-cols-3 gap-4">
          <Progress
            label="Paid"
            value={(revenueSummaryData.paid / totalInvoiceValue) * 100}
            color="green"
          />
          <Progress
            label="Pending"
            value={(revenueSummaryData.pending / totalInvoiceValue) * 100}
            color="amber"
          />
          <Progress
            label="Overdue"
            value={(revenueSummaryData.overdue / totalInvoiceValue) * 100}
            color="red"
          />
        </div>
      </SectionCard>
      <SectionCard title="Recent Work Orders by Contract">
        {recentWorkOrdersData.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recentWorkOrdersData.map((wo, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <h3>{wo.title}</h3>
                <p>{wo.contract_name}</p>
                <StatusBadge status={wo.type} />
                <p>{wo.completed_at}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No recent work orders" />
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default CustomerSuccessPage;