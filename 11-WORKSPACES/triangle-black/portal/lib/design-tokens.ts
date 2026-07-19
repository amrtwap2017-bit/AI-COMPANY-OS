// Triangle Black Enterprise Design System
// Single source of truth for all visual tokens

export const tokens = {
  color: {
    primary:    '#B45309',
    primaryHov: '#92400E',
    primaryLight:'#FEF3C7',
    primaryMid: '#F59E0B',
    surface:    '#FFFFFF',
    bg:         '#F8FAFC',
    bgAlt:      '#F1F5F9',
    border:     '#E2E8F0',
    borderHov:  '#CBD5E1',
    text1:      '#0F172A',
    text2:      '#475569',
    text3:      '#94A3B8',
    success:    '#059669',
    successBg:  '#ECFDF5',
    warning:    '#D97706',
    warningBg:  '#FFFBEB',
    error:      '#DC2626',
    errorBg:    '#FEF2F2',
    info:       '#2563EB',
    infoBg:     '#EFF6FF',
  },
  status: {
    active:      { bg:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200', dot:'bg-emerald-500' },
    inactive:    { bg:'bg-gray-50',    text:'text-gray-600',    border:'border-gray-200',    dot:'bg-gray-400' },
    pending:     { bg:'bg-amber-50',   text:'text-amber-700',   border:'border-amber-200',   dot:'bg-amber-500' },
    critical:    { bg:'bg-red-50',     text:'text-red-700',     border:'border-red-200',     dot:'bg-red-500' },
    warning:     { bg:'bg-orange-50',  text:'text-orange-700',  border:'border-orange-200',  dot:'bg-orange-500' },
    completed:   { bg:'bg-blue-50',    text:'text-blue-700',    border:'border-blue-200',    dot:'bg-blue-500' },
    draft:       { bg:'bg-gray-50',    text:'text-gray-600',    border:'border-gray-200',    dot:'bg-gray-300' },
    approved:    { bg:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200', dot:'bg-emerald-500' },
    rejected:    { bg:'bg-red-50',     text:'text-red-700',     border:'border-red-200',     dot:'bg-red-500' },
    paid:        { bg:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200', dot:'bg-emerald-500' },
    overdue:     { bg:'bg-red-50',     text:'text-red-700',     border:'border-red-200',     dot:'bg-red-500' },
    open:        { bg:'bg-blue-50',    text:'text-blue-700',    border:'border-blue-200',    dot:'bg-blue-500' },
    in_progress: { bg:'bg-indigo-50',  text:'text-indigo-700',  border:'border-indigo-200',  dot:'bg-indigo-500' },
    closed:      { bg:'bg-gray-50',    text:'text-gray-600',    border:'border-gray-200',    dot:'bg-gray-400' },
    delivered:   { bg:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200', dot:'bg-emerald-500' },
    cancelled:   { bg:'bg-gray-50',    text:'text-gray-500',    border:'border-gray-200',    dot:'bg-gray-300' },
  },
  priority: {
    critical: { bg:'bg-red-50',    text:'text-red-700',    border:'border-red-200' },
    high:     { bg:'bg-orange-50', text:'text-orange-700', border:'border-orange-200' },
    medium:   { bg:'bg-amber-50',  text:'text-amber-700',  border:'border-amber-200' },
    low:      { bg:'bg-gray-50',   text:'text-gray-600',   border:'border-gray-200' },
  },
} as const;

export function getStatus(status: string) {
  return tokens.status[status as keyof typeof tokens.status] || tokens.status.inactive;
}
export function getPriority(priority: string) {
  return tokens.priority[priority as keyof typeof tokens.priority] || tokens.priority.low;
}
export function fmtCurrency(n: number, currency = 'EGP') {
  if (!n && n !== 0) return '—';
  if (n >= 1000000) return `${currency} ${(n/1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${currency} ${(n/1000).toFixed(0)}K`;
  return `${currency} ${n.toLocaleString()}`;
}
export function fmtDate(d: any) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
  catch { return String(d); }
}
export function fmtDateShort(d: any) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}); }
  catch { return String(d); }
}
export function timeAgo(d: any) {
  if (!d) return '—';
  try {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff/60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  } catch { return '—'; }
}
