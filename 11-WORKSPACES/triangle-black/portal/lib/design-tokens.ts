// @ts-nocheck
/**
 * TRIANGLE BLACK DESIGN LANGUAGE — TBDL 1.0
 * "Luxury Engineering. Quiet Confidence. Operational Excellence."
 *
 * Configured via: lib/platform-config.ts
 * Single source of truth for all visual tokens.
 *
 * Philosophy:
 * - Matte materials, not glossy effects
 * - Warm neutrals, not cold blues
 * - Champagne bronze, not saturated yellow
 * - Soft depth, not glowing shadows
 * - Data-first — visual refinement supports productivity
 */

export const tokens = {
  color: {
    // Brand — Champagne Bronze
    primary:     '#B9924C',
    primaryHov:  '#A88446',
    primaryLight:'rgba(185,146,76,0.10)',
    primaryMid:  '#CFA058',
    primaryBorder:'rgba(185,146,76,0.28)',

    // Surfaces — Matte Espresso hierarchy
    bg:          '#181614',
    bgAlt:       '#221E1B',
    surface:     '#2D2723',
    surfaceAlt:  '#332C27',
    surfaceRaised:'#3D352F',

    // Text — Warm Ivory hierarchy
    text1:       '#F3EFE8',   // Warm ivory — primary
    text2:       '#B29F8B',   // Warm stone — secondary
    text3:       '#6D5F53',   // Dark stone — tertiary

    // Status — Calm, architectural
    success:     '#547C4D',   // Olive
    warning:     '#B07A2A',   // Warm amber
    error:       '#A84A3D',   // Deep terracotta
    info:        '#5B7C8C',   // Muted bronze-blue
    ai:          '#8D7443',   // Bronze — AI is operations

    // Topbar
    topbar:      '#D9C3A9',   // Sandy warm
    topbarText:  '#221D1A',   // Dark warm on sand
  },

  // Status badges — muted and calm
  status: {
    active:      { bg:'bg-olive-50',    text:'text-olive-700',    border:'border-olive-200',    dot:'bg-olive-500' },
    inactive:    { bg:'bg-stone-50',    text:'text-stone-600',    border:'border-stone-200',    dot:'bg-stone-400' },
    pending:     { bg:'bg-amber-50',    text:'text-amber-800',    border:'border-amber-200',    dot:'bg-amber-600' },
    critical:    { bg:'bg-red-50',      text:'text-red-800',      border:'border-red-200',      dot:'bg-red-600' },
    warning:     { bg:'bg-orange-50',   text:'text-orange-800',   border:'border-orange-200',   dot:'bg-orange-500' },
    completed:   { bg:'bg-stone-50',    text:'text-stone-700',    border:'border-stone-200',    dot:'bg-stone-500' },
    draft:       { bg:'bg-stone-50',    text:'text-stone-600',    border:'border-stone-200',    dot:'bg-stone-300' },
    approved:    { bg:'bg-stone-50',    text:'text-stone-700',    border:'border-stone-200',    dot:'bg-stone-500' },
    rejected:    { bg:'bg-red-50',      text:'text-red-700',      border:'border-red-200',      dot:'bg-red-500' },
    paid:        { bg:'bg-stone-50',    text:'text-stone-700',    border:'border-stone-200',    dot:'bg-stone-500' },
    overdue:     { bg:'bg-red-50',      text:'text-red-700',      border:'border-red-200',      dot:'bg-red-500' },
    open:        { bg:'bg-stone-50',    text:'text-stone-700',    border:'border-stone-200',    dot:'bg-stone-500' },
    in_progress: { bg:'bg-amber-50',    text:'text-amber-800',    border:'border-amber-200',    dot:'bg-amber-500' },
    closed:      { bg:'bg-stone-50',    text:'text-stone-600',    border:'border-stone-200',    dot:'bg-stone-400' },
    delivered:   { bg:'bg-stone-50',    text:'text-stone-700',    border:'border-stone-200',    dot:'bg-stone-500' },
    cancelled:   { bg:'bg-stone-50',    text:'text-stone-500',    border:'border-stone-200',    dot:'bg-stone-300' },
  },

  priority: {
    critical: { bg:'bg-red-50',    text:'text-red-800',    border:'border-red-200' },
    high:     { bg:'bg-orange-50', text:'text-orange-800', border:'border-orange-200' },
    medium:   { bg:'bg-amber-50',  text:'text-amber-800',  border:'border-amber-200' },
    low:      { bg:'bg-stone-50',  text:'text-stone-600',  border:'border-stone-200' },
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
  if (n >= 1_000_000) return `${currency} ${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${currency} ${(n/1_000).toFixed(0)}K`;
  return `${currency} ${n.toLocaleString()}`;
}
export function fmtDate(d: any) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}); }
  catch { return String(d); }
}
export function fmtDateShort(d: any) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB', {day:'2-digit', month:'short'}); }
  catch { return String(d); }
}
export function timeAgo(d: any) {
  if (!d) return '—';
  try {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff/60_000);
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  } catch { return '—'; }
}
