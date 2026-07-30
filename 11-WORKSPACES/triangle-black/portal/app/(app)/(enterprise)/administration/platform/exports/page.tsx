"use client";
// @ts-nocheck
import { useRouter } from "next/navigation";
const handleExport = (url) => {
  const token = localStorage.getItem("tb_token") || localStorage.getItem("tb_access_token") || "";
  fetch("http://localhost:8030" + url, {headers: {"Authorization": "Bearer " + token}})
    .then(r => r.blob())
    .then(blob => { const dl = document.createElement("a"); dl.href = URL.createObjectURL(blob); dl.download = url.split("/").pop() + "_" + new Date().toISOString().slice(0,10) + ".csv"; dl.click(); });
};
export default function PlatformExportsPage() {
  const router = useRouter();
  const exports = [
    {label:"Work Orders",desc:"All WOs with status and priority",url:"/api/v1/export/work-orders",icon:"🔧"},
    {label:"Technicians",desc:"Team roster and specializations",url:"/api/v1/export/technicians",icon:"👷"},
    {label:"Assets",desc:"Full asset registry",url:"/api/v1/export/assets",icon:"🏭"},
    {label:"Vendors",desc:"Approved vendor list",url:"/api/v1/export/vendors",icon:"🏪"},
    {label:"Supplier Invoices",desc:"All invoices with amounts",url:"/api/v1/export/supplier-invoices",icon:"📄"},
    {label:"Time Entries",desc:"Labor hours and costs",url:"/api/v1/export/time-entries",icon:"⏱"},
    {label:"Purchase Orders",desc:"POs with vendor details",url:"/api/v1/export/purchase-orders",icon:"📦"},
    {label:"Scope of Work",desc:"SOW documents and values",url:"/api/v1/export/scope-of-work",icon:"📋"},
  ];
  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero"><div className="tb-hero-inner">
        <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Administration</div>
        <h1 className="tb-hero-title">Data Exports</h1>
        <p className="tb-hero-description">{exports.length} export types · CSV format</p>
      </div></div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {exports.map((e,i)=>(
          <button key={i} onClick={()=>handleExport(e.url)}
            style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24,textAlign:"left",cursor:"pointer",transition:"all 160ms ease"}}
            onMouseEnter={ev=>ev.currentTarget.style.borderColor="rgba(185,146,76,0.3)"}
            onMouseLeave={ev=>ev.currentTarget.style.borderColor="var(--color-border)"}>
            <span style={{fontSize:"1.5rem"}}>{e.icon}</span>
            <div style={{fontSize:"0.9375rem",fontWeight:700,color:"var(--color-text-1)",marginTop:8}}>{e.label}</div>
            <div style={{fontSize:"0.8125rem",color:"var(--color-text-3)",marginTop:4}}>{e.desc}</div>
            <div style={{fontSize:"0.75rem",fontWeight:600,color:"#B9924C",marginTop:8}}>⬇ Download CSV</div>
          </button>
        ))}
      </div>
    </div>
  );
}
