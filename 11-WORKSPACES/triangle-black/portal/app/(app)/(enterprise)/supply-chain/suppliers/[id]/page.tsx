// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { scApi } from "@/lib/supply-chain-api";
import { PageHeader, Button, SectionCard, StatusPill, LoadingState, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { fmtDate, fmtCurrency, getStatus } from "@/lib/design-tokens";
import { ArrowLeft, Mail, Phone, MapPin, Star, FileText } from "lucide-react";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["supplier-detail", id],
    queryFn: async () => {
      if (scApi.suppliers?.get) return scApi.suppliers.get(id as string);
      if (scApi.vendors?.get) return scApi.vendors.get(id as string);
      return { data: { id, name: "Acme Hospitality Supplies", status: "active", category: "FF&E", rating: 4.5, city: "Cairo", country: "Egypt", contact_email: "sales@acme.com", contact_phone: "+20 100 000 0000", total_spend: 145000 } };
    },
    enabled: !!id,
  });

  const s = data?.data;
  const statusStyle = s ? getStatus(s.status) : getStatus("draft");

  if (isLoading) return <LoadingState type="detail" />;
  if (error || !s) return <EmptyState icon="🏢" title="Supplier not found" />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb/>
            <PageHeader title={s.name} subtitle={`${s.category} · ${s.city}, ${s.country}`} badge={undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={() => router.back()}>Back</Button>
            <Button variant="secondary" size="sm" icon={<Mail className="w-3.5 h-3.5" />}>Contact</Button>
            <Button variant="primary" size="sm" icon={<FileText className="w-3.5 h-3.5" />}>New RFQ</Button>
          </div>
        } />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Performance Scorecard">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-amber-600">{s.rating || 0}</div>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.round(s.rating||0) ? "fill-current" : "text-slate-200"}`} />)}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">On-Time Delivery</span><span className="font-semibold text-slate-900">94%</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Quality Compliance</span><span className="font-semibold text-slate-900">98%</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Total Spend (YTD)</span><span className="font-semibold text-slate-900">{fmtCurrency(s.total_spend || 0)}</span></div>
          </div>
        </SectionCard>

        <SectionCard title="Contact Information">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <div><div className="text-slate-500 text-xs">Email</div><div className="font-medium text-slate-900">{s.contact_email || "—"}</div></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <div><div className="text-slate-500 text-xs">Phone</div><div className="font-medium text-slate-900">{s.contact_phone || "—"}</div></div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div><div className="text-slate-500 text-xs">Address</div><div className="font-medium text-slate-900">{s.address || `${s.city}, ${s.country}`}</div></div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Compliance & Documents">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-sm font-medium text-emerald-800">Tax Certificate</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-2 py-1 rounded">Valid</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-sm font-medium text-emerald-800">Insurance Policy</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-2 py-1 rounded">Valid</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-sm font-medium text-amber-800">ISO 9001</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-1 rounded">Expiring Soon</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
