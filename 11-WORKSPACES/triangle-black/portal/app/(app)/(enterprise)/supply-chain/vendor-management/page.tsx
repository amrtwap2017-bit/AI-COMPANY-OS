"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const STARS = (r) => { const s=Math.round(r||0); return "★".repeat(s)+"☆".repeat(5-s); };
const handleExport = (url) => {
  const token = localStorage.getItem("tb_token")||localStorage.getItem("tb_access_token")||"";
  fetch("http://localhost:8030"+url,{headers:{"Authorization":"Bearer "+token}})
    .then(r=>r.blob()).then(blob=>{const dl=document.createElement("a");dl.href=URL.createObjectURL(blob);dl.download=url.split("/").pop()+"_"+new Date().toISOString().slice(0,10)+".csv";dl.click();});
};

export default function VendorManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [newV, setNewV] = useState({company_name:"",category:"General",contact_person:"",email:"",phone:"",city:"Cairo"});
  const [vErrors, setVErrors] = useState({});
  const qc = useQueryClient();

  const createVendor = useMutation(
    (payload)=>authFetch("/api/v1/vendors/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r=>r.json()),
    {onSuccess:(data)=>{if(data.id){toast.success("Vendor created successfully");setShowNewVendor(false);setNewV({company_name:"",category:"General",contact_person:"",email:"",phone:"",city:"Cairo"});qc.invalidateQueries(["vendors-list"]);}else{toast.error(data.detail||data.error||"Failed");}},onError:()=>toast.error("Connection error")}
  );

  const handleCreateVendor = () => {
    const errors = {};
    if (!newV.company_name?.trim()) errors.company_name = "Company name is required";
    if (Object.keys(errors).length) { setVErrors(errors); return; }
    setVErrors({});
    createVendor.mutate({...newV, vendor_code:"VND-"+Date.now().toString().slice(-6), hotel_id:"tb-default-hotel-000000000001", is_approved:false, rating:0});
  };

  const { data: raw, isLoading } = useQuery(["vendors-list"], ()=>authFetch("/api/v1/vendors/").then(r=>r.json()), {staleTime:60000});
  const vendors = toArr(raw);
  const cats = [...new Set(vendors.map(v=>v.category).filter(Boolean))];
  const filtered = vendors.filter(v=>(filterCat==="all"||v.category===filterCat)&&(!search||(v.company_name||"").toLowerCase().includes(search.toLowerCase())||(v.category||"").toLowerCase().includes(search.toLowerCase())));
  const totalPages = Math.ceil(filtered.length/pageSize);
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain · Procurement</div>
              <h1 className="tb-hero-title">Vendor Management</h1>
              <p className="tb-hero-description">{vendors.length} vendors · {vendors.filter(v=>v.is_approved).length} approved</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/supply-chain/procurement")} className="tb-btn tb-btn-secondary">← Back</button>
              <button onClick={()=>setShowNewVendor(true)} className="tb-btn tb-btn-primary">+ New Vendor</button>
              <button onClick={()=>handleExport("/api/v1/export/vendors")} className="tb-btn tb-btn-secondary tb-btn-sm">⬇ CSV</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total",value:vendors.length},{label:"Approved",value:vendors.filter(v=>v.is_approved).length,good:true},{label:"Categories",value:cats.length},{label:"Avg Rating",value:vendors.length>0?(vendors.reduce((s,v)=>s+(v.rating||0),0)/vendors.length).toFixed(1):0}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.good?"var(--color-success)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex gap-2.5 flex-wrap items-center mb-4">
            <input className="tb-input flex-1" style={{minWidth:"200px"}} placeholder="Search vendors…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
            <div className="tb-tabs border-0 mb-0">
              <button onClick={()=>{setFilterCat("all");setPage(1);}} className={`tb-tab ${filterCat==="all"?"active":""}`}>All</button>
              {cats.map(c=><button key={c} onClick={()=>{setFilterCat(c);setPage(1);}} className={`tb-tab ${filterCat===c?"active":""}`}>{c}</button>)}
            </div>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-3">{[1,2,3].map(i=><div key={i} className="tb-shimmer tb-shimmer-block" style={{height:64}} />)}</div>
          ) : filtered.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon">🏭</div><div className="tb-empty-title">No vendors found</div></div>
          ) : (
            <>
              <div className="tb-grid-2">
                {paged.map((v,i)=>(
                  <button key={i} onClick={()=>router.push("/supply-chain/vendor-management/"+v.id)}
                    className="tb-section text-left tb-hover-lift cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center text-sm font-black text-secondary flex-shrink-0">
                        {(v.company_name||"?").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-primary truncate">{v.company_name}</div>
                        <div className="text-xs text-tertiary">{v.category} · {v.city||"—"}</div>
                        <div className="text-xs text-warning">{STARS(v.rating)} {Number(v.rating||0).toFixed(1)}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className={`tb-badge ${v.is_approved?"tb-badge-success":"tb-badge-neutral"}`} style={{fontSize:"9px"}}>{v.is_approved?"Approved":"Pending"}</span>
                        <div className="text-xs text-tertiary mt-1">{v.vendor_code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-default">
                      <span className="text-xs text-secondary">{v.contact_person||"—"}</span>
                      <span className="text-xs text-tertiary">{v.email||"—"}</span>
                      <span className="text-xs text-brand ml-auto">View →</span>
                    </div>
                  </button>
                ))}
              </div>
              {filtered.length>pageSize&&<div className="mt-5 pt-4 border-t border-default"><Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={pageSize} onPageSize={(s)=>{setPageSize(s);setPage(1);}} pageSizes={[10,25,50]} /></div>}
            </>
          )}
        </div>
      </div>

      {showNewVendor && (
        <div onClick={()=>setShowNewVendor(false)} className="fixed inset-0 z-modal bg-overlay flex items-center justify-center p-5" style={{backdropFilter:"blur(4px)"}}>
          <div onClick={e=>e.stopPropagation()} className="tb-section w-full shadow-xl" style={{maxWidth:"500px"}}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-primary">Add New Vendor</h2>
              <button onClick={()=>setShowNewVendor(false)} className="tb-btn-ghost text-xl px-2">×</button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="tb-form-group">
                <label className="tb-label">Company Name <span className="text-danger">*</span></label>
                <input value={newV.company_name} onChange={e=>setNewV({...newV,company_name:e.target.value})} placeholder="e.g. Arctic HVAC Systems" className="tb-input" style={vErrors.company_name?{borderColor:"var(--color-danger)"}:{}} />
                {vErrors.company_name&&<div className="text-xs text-danger mt-1">{vErrors.company_name}</div>}
              </div>
              <div className="tb-form-grid">
                <div className="tb-form-group">
                  <label className="tb-label">Category</label>
                  <select value={newV.category} onChange={e=>setNewV({...newV,category:e.target.value})} className="tb-select">
                    {["HVAC","Electrical","Plumbing","Fire","Civil","IT","General","Elevator","Other"].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="tb-form-group">
                  <label className="tb-label">City</label>
                  <input value={newV.city} onChange={e=>setNewV({...newV,city:e.target.value})} placeholder="Cairo" className="tb-input" />
                </div>
              </div>
              <div className="tb-form-group">
                <label className="tb-label">Contact Person</label>
                <input value={newV.contact_person} onChange={e=>setNewV({...newV,contact_person:e.target.value})} placeholder="Full name" className="tb-input" />
              </div>
              <div className="tb-form-grid">
                <div className="tb-form-group">
                  <label className="tb-label">Email</label>
                  <input value={newV.email} onChange={e=>setNewV({...newV,email:e.target.value})} placeholder="vendor@company.com" type="email" className="tb-input" />
                </div>
                <div className="tb-form-group">
                  <label className="tb-label">Phone</label>
                  <input value={newV.phone} onChange={e=>setNewV({...newV,phone:e.target.value})} placeholder="+20-10-..." className="tb-input" />
                </div>
              </div>
              <div className="tb-action-bar mt-1">
                <button onClick={handleCreateVendor} disabled={createVendor.isLoading} className="tb-btn tb-btn-primary flex-1 justify-center">
                  {createVendor.isLoading?"Adding...":"Add Vendor"}
                </button>
                <button onClick={()=>setShowNewVendor(false)} className="tb-btn tb-btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
