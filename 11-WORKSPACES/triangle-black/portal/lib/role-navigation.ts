export const PRIMARY_BY_ROLE: Record<string, string[]> = {
  admin: [
    "workspace","executive","operations","engineering","maintenance",
    "projects-center","supply-chain","financial","analytics",
    "commercial","administration","settings","portals"
  ],
  manager: [
    "workspace","executive","operations","projects-center",
    "supply-chain","analytics","financial","portals"
  ],
  engineer: [
    "workspace","operations","engineering","maintenance","projects-center"
  ],
  agent: [
    "workspace","operations","engineering","maintenance","projects-center"
  ],
  finance: [
    "workspace","financial","commercial","analytics","supply-chain"
  ],
  viewer: [
    "workspace","executive","analytics","reports","maintenance","portals"
  ],
};

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  manager: "Operations Manager",
  engineer: "Field Engineer",
  agent: "Field Engineer",
  finance: "Finance Manager",
  viewer: "Viewer",
};

export const START_HERE_BY_ROLE: Record<string, {label:string; href:string}[]> = {
  admin: [
    {label:"User Management", href:"/settings/users"},
    {label:"Audit Trail", href:"/administration/audit"},
    {label:"Platform Health", href:"/administration/platform"},
  ],
  manager: [
    {label:"My Day", href:"/workspace/my-day"},
    {label:"Dispatch Board", href:"/operations/dispatch"},
    {label:"Approvals", href:"/approvals"},
  ],
  engineer: [
    {label:"My Work Orders", href:"/operations/work-orders"},
    {label:"Log Time", href:"/operations/time-tracking"},
    {label:"Scan Asset QR", href:"/operations/assets/qr"},
  ],
  agent: [
    {label:"My Work Orders", href:"/operations/work-orders"},
    {label:"Log Time", href:"/operations/time-tracking"},
    {label:"Scan Asset QR", href:"/operations/assets/qr"},
  ],
  finance: [
    {label:"Invoices", href:"/commercial/invoices"},
    {label:"Payment History", href:"/commercial/payment-history"},
    {label:"P&L Dashboard", href:"/financial"},
  ],
  viewer: [
    {label:"Executive Dashboard", href:"/executive/dashboard"},
    {label:"Analytics", href:"/analytics"},
    {label:"Reports", href:"/reports"},
  ],
};
