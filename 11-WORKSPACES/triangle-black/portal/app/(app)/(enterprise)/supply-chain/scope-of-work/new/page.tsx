
"use client";
// @ts-nocheck
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const EMPTY_BOQ = {description:"",unit:"unit",quantity:1,unit_rate:0,category:"material"};
export default function SOWCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title:"", description:"", type:"service", client_name:"", client_email:"",
    currency:"EGP", estimated_days:0, labor_cost:0, materials_cost:0,
    overhead_pct:15, profit_margin_pct:10, notes:"", prepared_by:"amr@triangleblack.com"
  });
  const [boqItems, setBoqItems] = useState([]);
  const [newItem, setNewItem] = useState({...EMPTY_BOQ});
  const createMut = useMutation(
    (payload) => authFetch("/api/v1/scope-of-work/", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    }).then(r=>r.json()),
    { onSuccess: (data) => { if (!data.error) router.push("/supply-chain/scope-of-work/"+data.id); }}
  );
  const boqSubtotal = boqItems.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.unit_rate||0),0);
  const overhead = boqSubtotal * (Number(form.overhead_pct||0)/100);
  const profit = (boqSubtotal+overhead) * (Number(form.profit_margin_pct||0)/100);
  const grandTotal = boqSubtotal + overhead + profit + Number(form.labor_cost||0);
  const addItem = () => {
    if (!newItem.description) return;
    setBoqItems([...boqItems,{...newItem,item_number:boqItems.length+1}]);
    setNewItem({...EMPTY_BOQ});
  };
  const handleSubmit = () => {
    createMut.mutate({...form, total_cost: grandTotal, boq_items: boqItems});
  };
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#0F172A 0%,#0D1A12 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-4 mb-4">
            <button onClick={()=>router.push("/supply-chain/scope-of-work")} className="tb-btn-secondary">← SOW List</button>
          </div>
          <div className="text-label-upper text-emerald-400 mb-1">Create New</div>
          <h1 className="tb-hero-title">Scope of Work</h1>
          <div className="tb-grid-4 mt-4">
            {[
              {label:"BOQ Items",value:boqItems.length,color:"#60A5FA"},
              {label:"BOQ Total",value:fmtEGP(boqSubtotal),color:"#FBBF24"},
              {label:"Grand Total",value:fmtEGP(grandTotal),color:"#34D399"},
              {label:"Est. Days",value:`${form.estimated_days||0}d`,color:"#A78BFA"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas space-y-4">
        <div className="tb-section space-y-4">
          <div className="tb-section-title">Basic Information</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-tertiary block mb-1">Title *</label>
              <input className="tb-input w-full" placeholder="e.g. HVAC Maintenance - Tower A" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Type</label>
              <select className="tb-input w-full" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                {["service","maintenance","installation","repair","inspection"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Currency</label>
              <select className="tb-input w-full" value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>
                {["EGP","USD","EUR","GBP","SAR","AED"].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Client Name</label>
              <input className="tb-input w-full" value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})}/>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Estimated Days</label>
              <input type="number" className="tb-input w-full" value={form.estimated_days} onChange={e=>setForm({...form,estimated_days:e.target.value})} min="0"/>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Labor Cost ({form.currency})</label>
              <input type="number" className="tb-input w-full" value={form.labor_cost} onChange={e=>setForm({...form,labor_cost:e.target.value})} min="0"/>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Overhead %</label>
              <input type="number" className="tb-input w-full" value={form.overhead_pct} onChange={e=>setForm({...form,overhead_pct:e.target.value})} min="0" max="100"/>
            </div>
            <div>
              <label className="text-xs text-tertiary block mb-1">Profit Margin %</label>
              <input type="number" className="tb-input w-full" value={form.profit_margin_pct} onChange={e=>setForm({...form,profit_margin_pct:e.target.value})} min="0" max="100"/>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-tertiary block mb-1">Description</label>
              <textarea className="tb-input w-full h-20 resize-none" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            </div>
          </div>
        </div>
        <div className="tb-section space-y-3">
          <div className="tb-section-title">Bill of Quantities</div>
          <div className="p-4 rounded-xl bg-base-alt border border-border space-y-3">
            <div className="text-xs font-bold text-brand mb-2">Add BOQ Item</div>
            <div className="grid grid-cols-5 gap-2">
              <input className="tb-input col-span-2" placeholder="Description *" value={newItem.description} onChange={e=>setNewItem({...newItem,description:e.target.value})}/>
              <select className="tb-input" value={newItem.unit} onChange={e=>setNewItem({...newItem,unit:e.target.value})}>
                {["unit","m","m2","m3","hr","lot","kg","set"].map(u=><option key={u} value={u}>{u}</option>)}
              </select>
              <input type="number" className="tb-input" placeholder="Qty" value={newItem.quantity} onChange={e=>setNewItem({...newItem,quantity:e.target.value})} min="0.001" step="0.001"/>
              <input type="number" className="tb-input" placeholder="Unit Rate" value={newItem.unit_rate} onChange={e=>setNewItem({...newItem,unit_rate:e.target.value})} min="0"/>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-400 font-bold">{fmtEGP(Number(newItem.quantity||0)*Number(newItem.unit_rate||0))}</span>
              <button onClick={addItem} disabled={!newItem.description} className="tb-btn-primary" style={{fontSize:"0.75rem",padding:"6px 14px"}}>+ Add</button>
            </div>
          </div>
          {boqItems.length>0 && (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"40px 1fr 70px 70px 100px 110px 40px"}}>
                {["#","Description","Unit","Qty","Rate","Total",""].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>1?"center":"left"}}>{h}</div>
                ))}
              </div>
              {boqItems.map((item,i)=>(
                <div key={i} className="tb-table-row" style={{gridTemplateColumns:"40px 1fr 70px 70px 100px 110px 40px"}}>
                  <div className="text-xs text-tertiary">{i+1}</div>
                  <div className="text-sm text-primary">{item.description}</div>
                  <div className="text-center text-xs text-secondary">{item.unit}</div>
                  <div className="text-center text-sm text-secondary">{item.quantity}</div>
                  <div className="text-center text-sm text-secondary">{Number(item.unit_rate||0).toLocaleString()}</div>
                  <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(Number(item.quantity||0)*Number(item.unit_rate||0))}</div>
                  <button onClick={()=>setBoqItems(boqItems.filter((_,j)=>j!==i))} className="text-xs text-red-400 hover:text-red-300">✕</button>
                </div>
              ))}
              <div className="tb-table-row" style={{gridTemplateColumns:"40px 1fr 70px 70px 100px 110px 40px",background:"rgba(255,255,255,0.03)"}}>
                <div/><div className="text-xs font-bold text-secondary col-span-4 text-right pr-2">Grand Total</div>
                <div className="text-center text-sm font-black text-emerald-400">{fmtEGP(grandTotal)}</div><div/>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end pb-8">
          <button onClick={()=>router.back()} className="tb-btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={!form.title||createMut.isLoading} className="tb-btn-primary">
            {createMut.isLoading?"Saving…":"Create SOW →"}
          </button>
        </div>
      </div>
    </div>
  );
}
