// @ts-nocheck
"use client";
import { useQuery } from 'react-query';
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState, Button } from "@/components/ui";
import { useState } from "react";

const toArr = (value) => Array.isArray(value) ? value : [value];

const fmtDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

const TechnicianCard = ({ technician }) => {
  const { name, specialization, is_active, current_work_orders, max_work_orders } = technician;
  const workloadProgress = ((current_work_orders / max_work_orders) * 100).toFixed(2);

  return (
    <SectionCard>
      <h3>{name}</h3>
      <p>Specialization: {toArr(specialization).join(", ")}</p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '10px' }}>{is_active ? 'Active' : 'Inactive'}</span>
        <progress value={current_work_orders} max={max_work_orders} style={{ width: '80%' }} />
      </div>
    </SectionCard>
  );
};

const TechnicianGrid = ({ technicians }) => {
  if (technicians.length === 0) return <EmptyState message="No technicians found." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
      {technicians.map((technician) => (
        <TechnicianCard key={technician.id} technician={technician} />
      ))}
    </div>
  );
};

const TechnicianPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  const { data: technicians, isLoading, isError } = useQuery(
    'technicians',
    () => authFetch('/api/v1/technicians/?limit=100'),
    {
      select: (data) =>
        data.results.filter((tech) =>
          tech.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (!filterActive || tech.is_active)
        ),
    }
  );

  if (isLoading) return <LoadingState />;
  if (isError) return <EmptyState message="Failed to load technicians." />;

  return (
    <PageWrapper>
      <PageHeader title="Technician Management">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <Button onClick={() => setFilterActive(!filterActive)}>
            {filterActive ? 'Show All' : 'Show Active'}
          </Button>
        </div>
      </PageHeader>
      <TechnicianGrid technicians={technicians} />
    </PageWrapper>
  );
};

export default TechnicianPage;