// @ts-nocheck

"use client";
import { useQuery } from "@tanstack/react-query";
import { scApi, extractList } from "@/lib/supply-chain-api";
import { exportToCSV } from "@/lib/csv-utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download, Building2, Star, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function VendorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["suppliers-vendors"],
    queryFn: () => scApi.suppliers.list(0, 100),
    staleTime: 60_000,
  });

  const vendors = extractList(data?.data);
  const active  = vendors.filter(v=>v.status==="active"||v.status==="approved");
  const preferred = vendors.filter(v=>v.preferred_flag);

  function handleExport() {
    exportToCSV(`vendors-${new Date().toISOString().slice(0,10)}.csv`, vendors.map(v=>({
      supplier_code:v.supplier_code, company_name:v.company_name,
      supplier_type:v.supplier_type, status:v.status,
      tax_number:v.tax_number??"", payment_terms:v.payment_terms??"",
      lead_time_days:v.lead_time_days??"", preferred:v.preferred_flag?"yes":"no",
    })));
  }

  return (
    <div className="space-y-5">
      <Breadcrumb/>
      <PageHeader title="Vendor Directory" subtitle="Approved and active procurement vendors" badge="Vendors"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5"/>} onClick={handleExport}>Export CSV</Button>
            <Link href="/supply-chain/suppliers">
              <Button variant="primary" size="sm" icon={<ExternalLink className="w-3.5 h-3.5"/>}>Manage in Supplier Master</Button>
            </Link>
          </div>
        } />

      <div className="grid grid-cols-3 gap-3">
        {[
          {label:"Total Vendors",    val:vendors.length,   bg:"bg-slate-50",   border:"border-slate-200",  txt:"text-slate-700"},
          {label:"Active / Approved",val:active.length,    bg:"bg-emerald-50", border:"border-emerald-200",txt:"text-emerald-700"},
          {label:"Preferred",        val:preferred.length, bg:"bg-amber-50",   border:"border-amber-200",  txt:"text-amber-700"},
        ].map(k=>(
          <div key={k.label} className={`rounded-2xl border ${k.border} ${k.bg} p-4`}>
            <div className={`text-2xl font-bold ${k.txt}`}>{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">{k.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? <LoadingState type="table" rows={8}/> : vendors.length===0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <EmptyState icon="🏢" title="No vendors found" description="Add suppliers in the Supplier Master to see them here" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {vendors.map(v=>(
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-slate-500"/>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="font-bold text-slate-900 text-sm leading-tight truncate">{v.company_name}</div>
                    {v.preferred_flag&&<Star className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor"/>}
                  </div>
                  <div className="font-mono text-xs text-amber-700 mt-0.5">{v.supplier_code}</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Type</span>
                  <span className="text-slate-700 font-medium capitalize">{v.supplier_type?.replace(/_/g," ")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Payment</span>
                  <span className="text-slate-700 font-medium uppercase">{v.payment_terms?.replace(/_/g," ")??"-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Lead Time</span>
                  <span className="text-slate-700 font-medium">{v.lead_time_days ? `${v.lead_time_days} days`:"-"}</span>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-xs px-2 py-0.5 rounded-md font-semibold capitalize ${
                  v.status==="active"?"bg-emerald-50 text-emerald-700 border border-emerald-200":
                  v.status==="approved"?"bg-blue-50 text-blue-700 border border-blue-200":
                  "bg-slate-100 text-slate-500"
                }`}>{v.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
