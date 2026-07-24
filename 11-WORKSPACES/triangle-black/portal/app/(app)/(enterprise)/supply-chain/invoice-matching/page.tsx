"use client"; // @ts-nocheck

import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, MetricStrip, StatusBadge, LoadingState, EmptyState } from "@/components/ui";

const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const fetchPurchaseOrders = async () => {
  const response = await fetch(`${BACK}/api/v1/inventory/purchase-orders`, { credentials: "include" });
  if (!response.ok) return [];
  return response.json();
};

const fetchSupplierInvoices = async () => {
  try {
    const response = await fetch(`${BACK}/api/v1/supply-chain/supplier-invoices`, { credentials: "include" });
    if (response.status === 404) throw new Error("Not Found");
    if (!response.ok) return [];
    return response.json();
  } catch {
    const response = await fetch(`${BACK}/api/v1/supplier-invoices`, { credentials: "include" });
    if (!response.ok) return [];
    return response.json();
  }
};

const InvoiceMatchingPage = () => {
  const { data: purchaseOrders, isLoading, isError } = useQuery(["purchaseOrders"], fetchPurchaseOrders, { refetchInterval: 120000 });
  const { data: supplierInvoices, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useQuery(
    ["supplierInvoices"],
    fetchSupplierInvoices,
    { refetchInterval: 120000 }
  );

  if (isLoading || isFetching) return <LoadingState />;
  if (isError) return <EmptyState title="Failed to load data" description="Please try reloading the page." />;

  const matchedInvoices = purchaseOrders.filter(po => supplierInvoices.some(inv => inv.po_id === po.id));
  const unmatchedPOs = purchaseOrders.filter(po => !supplierInvoices.some(inv => inv.po_id === po.id));

  return (
    <PageWrapper>
      <PageHeader title="Invoice Matching" />
      <SectionCard>
        <MetricStrip
          metrics={[
            { label: "Total POs", value: purchaseOrders.length },
            { label: "Matched Invoices", value: matchedInvoices.length },
            { label: "Unmatched POs", value: unmatchedPOs.length },
            { label: "Total PO Value EGP", value: purchaseOrders.reduce((acc: any, po: any) => acc + po.total_amount, 0) }
          ]}
        />
      </SectionCard>
      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="Matching Table">
          <table className="w-full">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Amount EGP</th>
                <th>Status</th>
                <th>Invoice</th>
                <th>Match Indicator</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map(po => (
                <tr key={po.id}>
                  <td>{po.po_number}</td>
                  <td>{/* Fetch vendor name from API */}</td>
                  <td>{po.total_amount}</td>
                  <td><StatusBadge status={po.status} /></td>
                  <td>
                    {supplierInvoices.some(inv => inv.po_id === po.id) ? (
                      <span className="text-green-500">Matched</span>
                    ) : (
                      <span className="text-red-500">No invoice</span>
                    )}
                  </td>
                  <td>
                    {supplierInvoices.some(inv => inv.po_id === po.id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green">
                        <path d="M5 13l4 4 6-6" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red">
                        <path d="M18 6L6 18h12z" />
                      </svg>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
        <SectionCard title="Unmatched POs">
          <ul>
            {unmatchedPOs.map(po => (
              <li key={po.id}>
                PO Number: {po.po_number}, Amount EGP: {po.total_amount}, Created At: {po.created_at}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </PageWrapper>
  );
};

export default InvoiceMatchingPage;