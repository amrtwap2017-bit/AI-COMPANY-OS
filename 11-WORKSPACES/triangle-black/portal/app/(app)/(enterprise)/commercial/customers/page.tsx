// @ts-nocheck
"use client";
import { useQuery } from 'react-query';
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, Button } from "@/components/ui";
import { toArr, fmtDate } from "@/utils/helpers";

const LeadsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchLeads = async () => {
    const params = new URLSearchParams();
    if (statusFilter) {
      params.append('status', statusFilter);
    }
    return authFetch(`/api/v1/leads/?limit=100&${params.toString()}`);
  };

  const { data, isLoading, isError } = useQuery(['leads', statusFilter], fetchLeads);

  const leads = toArr(data?.data || []);

  const totalLeads = leads.length;
  const convertedLeads = leads.filter(lead => lead.priority === 'converted').length;
  const newLeads = leads.filter(lead => lead.priority === 'new').length;
  const avgScore = leads.reduce((acc, lead) => acc + lead.score, 0) / leads.length || 0;

  return (
    <PageWrapper>
      <PageHeader title="CRM Customers" />
      <div className="grid grid-cols-4 gap-4">
        <SectionCard title="Total Leads" value={totalLeads} />
        <SectionCard title="Converted Leads" value={convertedLeads} />
        <SectionCard title="New Leads" value={newLeads} />
        <SectionCard title="Avg Score" value={avgScore.toFixed(2)} />
      </div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded mr-4"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="converted">Converted</option>
          <option value="new">New</option>
        </select>
      </div>
      {isLoading && <LoadingState />}
      {isError && <EmptyState title="Failed to load leads" />}
      {!isLoading && !isError && leads.length === 0 && (
        <EmptyState title="No leads found" />
      )}
      {!isLoading && !isError && leads.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {leads.map(lead => (
            <SectionCard key={lead.id} title={lead.name} value={`${lead.company} - ${fmtDate(lead.updated_at)}`} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default LeadsPage;