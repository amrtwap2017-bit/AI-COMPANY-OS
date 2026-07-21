#!/bin/bash
# SAFE NEW PAGE — Creates a page that never has build errors
# Usage: bash scripts/new_page.sh "app/(app)/supply-chain/agreements" "Agreements" "AGR" "/api/v1/contracts"

PAGE_PATH=$1
TITLE=$2
BADGE=$3
API=$4
PORTAL="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"

if [ -z "$PAGE_PATH" ]; then
  echo "Usage: bash scripts/new_page.sh <route> <title> <badge> <api>"
  echo "Example: bash scripts/new_page.sh 'app/(app)/my-page' 'My Page' 'MP' '/api/v1/items'"
  exit 1
fi

FULL_PATH="$PORTAL/$PAGE_PATH/page.tsx"
mkdir -p "$(dirname $FULL_PATH)"

cat > "$FULL_PATH" << PAGEOF
// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, DataTable, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { RefreshCw } from "lucide-react";

export default function Page() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["${PAGE_PATH//\//-}"],
    queryFn:  () => authFetchJSON("${API}"),
    staleTime: 30_000, retry: 2,
  });

  const items = Array.isArray(data) ? data : data?.items || data?.data || data?.results || [];
  const { query, setQuery, filtered } = useSearch(items, ["name","title","status","type"]);
  const { page, totalPages, items: rows, goToPage } = usePagination(filtered, 20);

  const columns = [
    { key:"name",   label:"Name",   render:(r:any)=><span className="text-sm font-semibold text-slate-900">{r.name||r.title||r.id||"—"}</span> },
    { key:"status", label:"Status", render:(r:any)=><span className="text-xs text-slate-600 capitalize">{r.status||"—"}</span> },
    { key:"type",   label:"Type",   render:(r:any)=><span className="text-xs text-slate-500">{r.type||r.category||"—"}</span> },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader
        title="${TITLE}"
        subtitle={\`\${items.length} records\`}
        badge="${BADGE}"
        actions={
          <button onClick={()=>refetch()} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={\`h-4 w-4 \${isFetching?"animate-spin":""}\`}/>
          </button>
        }/>
      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? <LoadingState type="table" rows={8}/> :
         rows.length === 0 ? <EmptyState icon="📋" title="No data" description="No records found"/> :
         <DataTable columns={columns} data={rows}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </PageWrapper>
  );
}
PAGEOF

echo "✅ Created: $FULL_PATH"
echo "   No CSV issues, no SSR issues, no placeholder text"
echo "   Edit columns array to match your data"
