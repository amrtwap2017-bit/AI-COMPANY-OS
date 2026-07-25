// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, DataTable, LoadingState, EmptyState, StatusBadge } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";

const fmtDate = (d: any): string => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
};

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const HotelsPage = () => {
  const { data, isLoading } = useQuery(
    ["hotels"],
    () => authFetch("/api/v1/hotels/").then(r => r.json()),
    { refetchInterval: 300000 }
  );

  if (isLoading) return <LoadingState />;
  const hotels = toArr(data);

  return (
    <PageWrapper>
      <PageHeader
        title="Hotels"
        subtitle={`${hotels.length} properties`}
        badge="ADMIN"
      />
      <SectionCard title="All Hotels">
        {hotels.length === 0 ? <EmptyState /> : (
          <div className="space-y-3">
            {hotels.map((hotel: any) => (
              <div key={hotel.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-800">{hotel.name}</p>
                  <p className="text-sm text-slate-500">{hotel.city}, {hotel.country}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={hotel.status || "active"} />
                  <Link
                    href={`/administration/hotels/${hotel.id}`}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
};

export default HotelsPage;
