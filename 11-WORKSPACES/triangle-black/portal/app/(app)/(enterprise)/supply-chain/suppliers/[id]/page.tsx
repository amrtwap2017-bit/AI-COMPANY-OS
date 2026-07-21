"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader, PageWrapper, SectionCard, StatusBadge, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { fmtDate, fmtCurrency } from "@/lib/design-tokens";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export default function SupplierDetailPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["supplier-detail", id],
    queryFn: async () => {
      const res = await authFetch("/api/v1/inventory/vendors/" + id);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 30_000,
  });

  if (isLoading) return <PageWrapper><LoadingState type="detail" /></PageWrapper>;

  const s = data || {};

  return (
    <PageWrapper>
      <PageHeader
        title={s.name || "Supplier"}
        subtitle={s.category || "Vendor"}
        badge="SUP"
        back={
          <Link href="/supply-chain/suppliers"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
        actions={<StatusBadge status={s.is_active ? "active" : "inactive"} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SectionCard title="Vendor Details">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Code",      value: s.vendor_code },
                { label: "Category",  value: s.category },
                { label: "Payment",   value: s.payment_terms },
                { label: "Lead Time", value: s.lead_time_days ? s.lead_time_days + " days" : null },
              ].map(f => f.value && (
                <div key={f.label} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Contact">
          <div className="space-y-3">
            {s.contact_person && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="font-medium">{s.contact_person}</span>
              </div>
            )}
            {s.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />{s.phone}
              </div>
            )}
            {s.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />{s.email}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </PageWrapper>
  );
}
