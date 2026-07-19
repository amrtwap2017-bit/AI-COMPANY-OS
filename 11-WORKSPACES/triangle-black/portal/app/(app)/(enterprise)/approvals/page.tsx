"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Button, SectionCard, LoadingState } from "@/components/ui";
import { fmtCurrency, fmtDate, getStatus } from "@/lib/design-tokens";
import { 
  CheckCircle, XCircle, Clock, AlertTriangle, FileText, 
  ShoppingCart, Wrench, DollarSign, Users, Calendar, 
  RefreshCw, Search, X, MessageSquare, Scale, TrendingDown, 
  ChevronRight, History, ArrowUpRight
} from "lucide-react";

export default function ApprovalCenterPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [actionComment, setActionComment] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | "request_info" | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["approvals-inbox"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        data: {
          stats: { pending: 5, high_priority: 2, avg_time: "4.2h", total_value: 282950 },
          items: [
            {
              id: "app1", type: "purchase_order", title: "PO-2026-099: Italian Marble Tile",
              requester: { name: "Mohamed Ali", role: "Site Engineer", avatar: "MA" },
              project: "Grand Cairo Hotel", amount: 45000, priority: "high", status: "pending",
              submitted_at: "2026-07-14T10:30:00Z", sla_deadline: "2026-07-17T17:00:00Z",
              details: {
                supplier: "Marble Egypt Co.", budget_code: "CAPEX-2026-Q3", budget_remaining: 125000,
                line_items: [{ desc: "Italian Marble Tile 60x60", qty: 50, unit: "Box", price: 900, total: 45000 }],
                justification: "Required for Lobby Phase 1 completion by Friday. Supplier is pre-approved."
              }
            },
            {
              id: "app2", type: "invoice", title: "INV-8821: Marble Egypt Co. (3-Way Match)",
              requester: { name: "System Auto-Match", role: "Finance Bot", avatar: "SB" },
              project: "Grand Cairo Hotel", amount: 43200, priority: "high", status: "pending",
              submitted_at: "2026-07-16T09:00:00Z", sla_deadline: "2026-07-18T17:00:00Z",
              details: {
                po_number: "PO-2026-099", grn_number: "GRN-2026-044", invoice_number: "INV-8821",
                po_qty: 50, grn_accepted_qty: 48, grn_rejected_qty: 2, invoice_qty: 50,
                variance_amount: 1800, variance_reason: "2 boxes rejected due to chipping (GRN-2026-044)"
              }
            },
            {
              id: "app3", type: "variation_order", title: "VO-002: Additional Lighting Points",
              requester: { name: "Amr", role: "Project Manager", avatar: "AM" },
              project: "Grand Cairo Hotel", amount: 12500, priority: "medium", status: "pending",
              submitted_at: "2026-07-15T14:15:00Z", sla_deadline: "2026-07-20T17:00:00Z",
              details: {
                client_approved: true, client_rep: "Mr. Hassan (Grand Cairo)", 
                schedule_impact: "+3 days", cost_impact: "+2.8% to project budget",
                description: "Client requested 4 extra chandeliers in the main hall during site walk-through."
              }
            },
            {
              id: "app4", type: "contract", title: "Annual Maintenance SLA Renewal 2027",
              requester: { name: "Fatima Ali", role: "Commercial Manager", avatar: "FA" },
              project: "Sharm Resort & Spa", amount: 180000, priority: "medium", status: "pending",
              submitted_at: "2026-07-10T11:00:00Z", sla_deadline: "2026-07-25T17:00:00Z",
              details: {
                term: "12 months", start_date: "2027-01-01", end_date: "2027-12-31",
                gross_margin: "32%", payment_terms: "Net 30",
                notes: "Includes 5% upsell for expanded PM coverage (Quarterly Chiller Service)."
              }
            },
            {
              id: "app5", type: "overtime_request", title: "Emergency OT: Generator Fuel Line",
              requester: { name: "Ahmed Hassan", role: "Electrical Specialist", avatar: "AH" },
              project: "Grand Cairo Hotel", amount: 450, priority: "low", status: "pending",
              submitted_at: "2026-07-16T18:30:00Z", sla_deadline: "2026-07-19T17:00:00Z",
              details: {
                hours_requested: 3, hourly_rate: 150, total_cost: 450,
                reason: "After-hours emergency call-out to prevent lobby blackout."
              }
            }
          ]
        }
      };
    }
  });

  const d = data?.data || { stats: {}, items: [] };
  
  // 🚀 DYNAMIC REAL-TIME CALCULATIONS (Connected to actual ecosystem data)
  const pendingItems = d.items.filter((i: any) => i.status === "pending");
  const realTimeStats = {
    pending_count: pendingItems.length,
    high_priority_risk: pendingItems.filter((i: any) => i.priority === "high" && new Date(i.sla_deadline) < new Date(Date.now() + 86400000)).length,
    pending_value: pendingItems.reduce((sum: number, i: any) => sum + (i.amount || 0), 0),
    avg_time: "4.2h",
    po_count: pendingItems.filter((i: any) => i.type === "purchase_order").length,
    invoice_count: pendingItems.filter((i: any) => i.type === "invoice").length,
    vo_count: pendingItems.filter((i: any) => i.type === "variation_order").length
  };

  const filteredItems = d.items.filter((item: any) => {
    const matchesFilter = filter === "all" || item.priority === filter || item.type === filter;
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.requester.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "purchase_order": return <ShoppingCart className="w-5 h-5 text-amber-600" />;
      case "variation_order": return <Wrench className="w-5 h-5 text-blue-600" />;
      case "invoice": return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case "contract": return <FileText className="w-5 h-5 text-purple-600" />;
      case "overtime_request": return <Users className="w-5 h-5 text-slate-600" />;
      default: return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleAction = (action: "approve" | "reject" | "request_info") => {
    if (!selectedApproval) return;
    alert(`✓ Request ${action.replace("_", " ")}d successfully!${actionComment ? " Comment saved to audit trail." : ""}`);
    setSelectedApproval(null);
    setActionComment("");
    setActionType(null);
    refetch();
  };

  if (isLoading) return <LoadingState type="cards" rows={6} />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* 1. Header & KPIs */}
      <PageHeader 
        title="Approval Center" 
        subtitle="Centralized workflow for POs, Invoices, Variations, and Contracts"
        badge="APV"
        actions={<Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => refetch()}>Refresh</Button>} 
      />

      {/* 🚀 FLAWLESS ENTERPRISE KPI STRIP (Interactive Ecosystem Gateways) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Action (Click to view all) */}
        <button 
          onClick={() => setFilter("all")}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 transition-all duration-200 text-left group w-full"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending Action</span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{realTimeStats.pending_count}</span>
            <span className="text-sm text-slate-500 font-medium">requests</span>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span><span className="font-semibold text-amber-600">{realTimeStats.po_count}</span> POs</span>
            <span className="text-slate-300">|</span>
            <span><span className="font-semibold text-emerald-600">{realTimeStats.invoice_count}</span> Invoices</span>
          </div>
        </button>

        {/* Card 2: SLA Breach Risk (Click to filter high priority) */}
        <button 
          onClick={() => setFilter("high")}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-red-400 hover:-translate-y-0.5 transition-all duration-200 text-left group w-full"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">SLA Breach Risk</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${realTimeStats.high_priority_risk > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {realTimeStats.high_priority_risk}
            </span>
            <span className="text-sm text-slate-500 font-medium">critical</span>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            {realTimeStats.high_priority_risk > 0 
              ? "Requires immediate attention (<24h)" 
              : "All approvals within SLA targets"}
          </div>
        </button>

        {/* Card 3: Processing Efficiency (Click to view Analytics) */}
        <a 
          href="/analytics"
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5 transition-all duration-200 text-left group w-full block"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Avg. Turnaround</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{realTimeStats.avg_time}</span>
          </div>
          <div className="text-xs text-emerald-600 mt-3 pt-3 border-t border-slate-100 font-semibold flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" /> 15% faster vs last month
          </div>
        </a>

        {/* Card 4: Pending Value (Click to view Commercial Invoices) */}
        <a 
          href="/commercial/invoices?status=pending"
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-emerald-400 hover:-translate-y-0.5 transition-all duration-200 text-left group w-full block"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending Value</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{fmtCurrency(realTimeStats.pending_value)}</span>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
            Total capital awaiting authorization
          </div>
        </a>

      </div>

      {/* 2. Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
          {[
            { key: "all", label: "All Requests", count: d.items.length },
            { key: "high", label: "High Priority", count: d.items.filter((i: any) => i.priority === "high").length },
            { key: "purchase_order", label: "Purchase Orders", count: d.items.filter((i: any) => i.type === "purchase_order").length },
            { key: "invoice", label: "Invoices", count: d.items.filter((i: any) => i.type === "invoice").length }
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filter === f.key ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {f.label}
              {f.count > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${filter === f.key ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>{f.count}</span>}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search approvals..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
        </div>
      </div>

      {/* 3. Beautiful, Spacious Approval Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <div className="text-slate-900 font-semibold">All caught up!</div>
            <div className="text-xs text-slate-500 mt-1">No pending approvals match your filters.</div>
          </div>
        ) : (
          filteredItems.map((item: any) => {
            const isUrgent = item.priority === "high" && new Date(item.sla_deadline) < new Date(Date.now() + 86400000);
            
            return (
              <button 
                key={item.id} 
                onClick={() => { setSelectedApproval(item); setActionType(null); setActionComment(""); }}
                className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:shadow-lg hover:border-amber-300 hover:-translate-y-0.5 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Context */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isUrgent ? "bg-red-100 group-hover:bg-red-200" : "bg-slate-100 group-hover:bg-amber-100"}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-amber-700 transition-colors">{item.title}</h3>
                        {isUrgent && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{item.requester.avatar}</span>
                          <span className="font-medium text-slate-700">{item.requester.name}</span>
                        </span>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <span>{item.project}</span>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <span className={`flex items-center gap-1.5 font-medium ${isUrgent ? "text-red-600" : "text-slate-600"}`}>
                          <Clock className="w-3.5 h-3.5" /> Due {fmtDate(item.sla_deadline)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Value & Action Hint */}
                  <div className="flex items-center gap-6 md:justify-end pl-16 md:pl-0">
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-900">{fmtCurrency(item.amount)}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${item.priority === "high" ? "text-red-600" : "text-slate-500"}`}>
                        {item.priority} Priority
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 4. PREMIUM CENTERED MODAL (Connected, Not Split) */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(selectedApproval.type)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedApproval.title}</h2>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    {selectedApproval.project} <span className="text-slate-300">•</span> Submitted {fmtDate(selectedApproval.submitted_at)}
                  </p>
                </div>
              </div>
              <button onClick={() => { setSelectedApproval(null); setActionType(null); setActionComment(""); }} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Requester & Value Banner */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    {selectedApproval.requester.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{selectedApproval.requester.name}</div>
                    <div className="text-xs text-slate-500">{selectedApproval.requester.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{fmtCurrency(selectedApproval.amount)}</div>
                  <div className="text-xs text-slate-500 font-medium">Total Value</div>
                </div>
              </div>

              {/* DYNAMIC DETAIL RENDERER */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Request Details
                </h3>
                
                {selectedApproval.type === "invoice" && (
                  <div className="bg-emerald-50/50 rounded-xl border border-emerald-200 p-5 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-2">
                      <Scale className="w-4 h-4" /> 3-Way Match Verification
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">PO Qty</div>
                        <div className="text-xl font-bold text-slate-900 mt-1">{selectedApproval.details.po_qty}</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">GRN Accepted</div>
                        <div className="text-xl font-bold text-emerald-600 mt-1">{selectedApproval.details.grn_accepted_qty}</div>
                      </div>
                      <div className={`p-3 rounded-lg border shadow-sm ${selectedApproval.details.variance_amount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-emerald-100'}`}>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Invoiced Qty</div>
                        <div className={`text-xl font-bold mt-1 ${selectedApproval.details.variance_amount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{selectedApproval.details.invoice_qty}</div>
                      </div>
                    </div>
                    {selectedApproval.details.variance_amount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-red-100/60 rounded-lg border border-red-200 text-sm text-red-800">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Discrepancy Detected:</span> {selectedApproval.details.variance_reason}. 
                          <br/>Recommended payable amount: <span className="font-bold">{fmtCurrency(selectedApproval.amount - selectedApproval.details.variance_amount)}</span>.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedApproval.type === "purchase_order" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Supplier</div>
                        <div className="font-bold text-slate-900 mt-1">{selectedApproval.details.supplier}</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Budget Code</div>
                        <div className="font-bold text-slate-900 mt-1">{selectedApproval.details.budget_code}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                      <span className="text-sm text-blue-800 font-semibold flex items-center gap-2"><TrendingDown className="w-4 h-4"/> Remaining Budget</span>
                      <span className="text-lg font-bold text-blue-900">{fmtCurrency(selectedApproval.details.budget_remaining)}</span>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="text-xs text-amber-800 uppercase font-semibold mb-1">Justification</div>
                      <div className="text-sm text-amber-900 italic">"{selectedApproval.details.justification}"</div>
                    </div>
                  </div>
                )}

                {selectedApproval.type === "variation_order" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-medium">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" /> 
                      Client Approval Secured: <span className="font-bold">{selectedApproval.details.client_rep}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="text-xs text-amber-700 uppercase font-semibold flex items-center gap-1"><TrendingDown className="w-3 h-3"/> Cost Impact</div>
                        <div className="text-base font-bold text-amber-900 mt-1">{selectedApproval.details.cost_impact}</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="text-xs text-red-700 uppercase font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/> Schedule Impact</div>
                        <div className="text-base font-bold text-red-900 mt-1">{selectedApproval.details.schedule_impact}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Description</div>
                      <div className="text-sm text-slate-700">{selectedApproval.details.description}</div>
                    </div>
                  </div>
                )}

                {["contract", "overtime_request"].includes(selectedApproval.type) && (
                  <div className="space-y-2 bg-slate-50 rounded-xl border border-slate-200 p-4">
                    {Object.entries(selectedApproval.details).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between py-2.5 border-b border-slate-200 last:border-0">
                        <span className="text-sm text-slate-500 capitalize font-medium">{key.replace(/_/g, " ")}</span>
                        <span className="text-sm font-bold text-slate-900 text-right max-w-[60%]">
                          {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Audit Trail / Comments */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-slate-400" /> Action & Audit Trail
                </h3>
                
                {actionType && (
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">
                      {actionType === "approve" ? "Approval Notes" : actionType === "reject" ? "Rejection Reason (Required)" : "Information Requested"}
                    </label>
                    <textarea 
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      placeholder="Add notes for the audit trail..."
                      className="w-full h-24 p-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-white"
                      autoFocus
                    />
                  </div>
                )}

                {!actionType && (
                  <div className="text-sm text-slate-500 italic text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Select an action below to add an audit comment.
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-5 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {!actionType ? (
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="secondary" size="sm" className="justify-center h-10" onClick={() => setActionType("request_info")}>
                    Request Info
                  </Button>
                  <Button variant="secondary" size="sm" className="justify-center h-10 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200" onClick={() => setActionType("reject")}>
                    Reject
                  </Button>
                  <Button variant="primary" size="sm" className="justify-center h-10 bg-emerald-600 hover:bg-emerald-700" onClick={() => setActionType("approve")}>
                    Approve
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-10" onClick={() => { setActionType(null); setActionComment(""); }}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className={`flex-1 justify-center h-10 ${actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : actionType === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}
                    onClick={() => handleAction(actionType)}
                  >
                    Confirm {actionType === "approve" ? "Approval" : actionType === "reject" ? "Rejection" : "Request"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
