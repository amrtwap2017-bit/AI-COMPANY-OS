// @ts-nocheck
"use client";
import { useQuery } from 'react-query';
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, Button } from "@/components/ui";
import { toArr, fmtDate } from "@/utils/helpers";

const SupplyChainWorkbench = () => {
  const fetchPurchaseRequests = async () => {
    const response = await authFetch('/api/v1/purchase-requests/?limit=100');
    if (!response.ok) {
      throw new Error('Failed to fetch purchase requests');
    }
    return response.json();
  };

  const { data, isLoading, isError } = useQuery(['purchaseRequests'], fetchPurchaseRequests);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredData = data?.filter(item => 
    item.pr_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === '' || item.status === filterStatus)
  );

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load purchase requests" />;

  const kpiData = {
    total: data?.length,
    pending: data?.filter(item => item.status === 'pending').length,
    approved: data?.filter(item => item.status === 'approved').length,
    rejected: data?.filter(item => item.status === 'rejected').length
  };

  return (
    <PageWrapper>
      <PageHeader title="Supply Chain Workbench" />
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(kpiData).map(([key, value]) => (
          <SectionCard key={key} title={key.charAt(0).toUpperCase() + key.slice(1)} count={value} />
        ))}
      </div>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search PR Number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded mr-4"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {filteredData?.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Estimated Cost</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td>{item.pr_number}</td>
                <td>{item.status}</td>
                <td>{item.urgency}</td>
                <td>${item.required_date}</td>
                <td>{fmtDate(item.required_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState message="No purchase requests found" />
      )}
    </PageWrapper>
  );
};

export default SupplyChainWorkbench;