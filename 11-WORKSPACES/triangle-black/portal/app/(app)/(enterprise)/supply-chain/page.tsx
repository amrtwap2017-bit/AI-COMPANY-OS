// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, MetricStrip, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { safeFetch, toList } from "@/lib/safe-api";
import { ShoppingCart, Package, Truck, FileText, BarChart3, ArrowRight, Users2 } from "lucide-react";

export default function SupplyChainPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [pos,       setPOs]       = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(()=>{
    Promise.all([
      safeFetch("/api/v1/actions/inventory/stock-balances"),
      safeFetch("/api/v1/actions/procurement/dashboard"),
    ]).then(([inv,proc])=>{
      setInventory(toList(inv?.data?.stock_balances||inv?.data||inv));
      setPOs(toList(proc?.data?.purchase_orders||proc?.data||proc));
    }).finally(()=>setLoading(false));
  },[]);

  const lowStock = inventory.filter((i:any)=>(i.quantity||i.balance||0)<5).length;

  const kpis = [
    { label:"Inventory Items", value:loading?"...":String(inventory.length||"0"), sub:"tracked",   color:"blue"    as const },
    { label:"Purchase Orders", value:loading?"...":String(pos.length||"0"),       sub:"active",    color:"amber"   as const },
    { label:"Low Stock",       value:loading?"...":String(lowStock),              sub:"need reorder",color:"red"   as const },
    { label:"Suppliers",       value:loading?"...":"—",                           sub:"registered",color:"emerald" as const },
  ];

  const MODULES = [
    { label:"Inventory",         href:"/inventory",                        icon:Package,    desc:"Stock levels & items" },
    { label:"Warehouses",        href:"/warehouses",                       icon:ShoppingCart, desc:"Warehouse management" },
    { label:"Purchase Orders",   href:"/supply-chain/purchase-orders",     icon:FileText,   desc:"PO management" },
    { label:"Purchase Requests", href:"/supply-chain/purchase-requests",   icon:FileText,   desc:"Request for purchase" },
    { label:"Suppliers",         href:"/supply-chain/suppliers",           icon:Users2,     desc:"Vendor & supplier directory" },
    { label:"RFQs",              href:"/supply-chain/rfqs",                icon:FileText,   desc:"Request for quotations" },
    { label:"Intelligence",      href:"/supply-chain/intelligence",        icon:BarChart3,  desc:"Supply chain analytics" },
    { label:"SC Command",        href:"/supply-chain/command",             icon:BarChart3,  desc:"Supply chain command center" },
  ];

  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Supply Chain & Procurement" subtitle="Inventory, purchasing and vendor management" badge="SCM"/>
      {loading ? <LoadingState type="cards" rows={4} cols={4}/> : <MetricStrip metrics={kpis} cols={4}/>}
      {lowStock>0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          ⚠️ <strong>{lowStock} items</strong> below minimum stock level — review inventory
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MODULES.map(mod=>{
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className="group bg-white rounded-2xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-amber-50">
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-600"/>
              </div>
              <p className="font-semibold text-sm text-slate-900">{mod.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
