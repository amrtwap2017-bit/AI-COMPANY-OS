/**
 * TRIANGLE BLACK — ENTERPRISE PLATFORM CONFIGURATION
 *
 * This is the SINGLE FILE that controls the entire platform identity.
 * Change values here → entire platform reconfigures.
 *
 * Industry Packages:
 *   engineering   → Triangle Black (current)
 *   hospitality   → Hotel OS
 *   manufacturing → Factory OS
 *   healthcare    → Care OS
 *   construction  → Build OS
 */

export type IndustryPackage =
  | 'engineering'
  | 'hospitality'
  | 'manufacturing'
  | 'healthcare'
  | 'construction'
  | 'retail'
  | 'energy';

export type ThemePreset =
  | 'obsidian'     // Obsidian Command — luxury dark
  | 'ivory'        // Ivory Operations — warm light
  | 'warm-dark'    // LEGACY: maps to obsidian
  | 'light'        // LEGACY: maps to ivory
  | 'cool-dark'    // LEGACY: maps to obsidian
  | 'corporate';   // LEGACY: maps to ivory

export interface PlatformConfig {
  // ── Identity ─────────────────────────────────────────────────────────
  name:          string;   // Platform display name
  shortName:     string;   // Short name / initials
  tagline:       string;   // Subtitle on login and topbar
  logo:          string;   // Emoji or image path
  domain:        string;   // Customer domain
  industry:      IndustryPackage;

  // ── Theme ─────────────────────────────────────────────────────────────
  theme:         ThemePreset;
  accentColor:   string;   // PRIMARY brand color — one color rules all
  accentHover:   string;   // Darker shade of accent
  accentMuted:   string;   // Very subtle tint of accent (5-8% opacity bg)
  accentText:    string;   // Text on accent background

  // ── Typography ────────────────────────────────────────────────────────
  fontSans:      string;
  fontMono:      string;

  // ── Modules enabled ──────────────────────────────────────────────────
  modules: {
    operations:    boolean;
    engineering:   boolean;
    assets:        boolean;
    procurement:   boolean;
    financial:     boolean;
    projects:      boolean;
    analytics:     boolean;
    commercial:    boolean;
    portals:       boolean;
    administration:boolean;
  };

  // ── Locale ───────────────────────────────────────────────────────────
  currency:      string;   // Default currency
  locale:        string;   // en-GB, ar-EG, fr-FR
  timezone:      string;   // Africa/Cairo
  dateFormat:    string;   // DD/MM/YYYY
}

// ════════════════════════════════════════════════════════════════════════
// ACTIVE CONFIGURATION — Change this to reconfigure the entire platform
// ════════════════════════════════════════════════════════════════════════

export const PLATFORM: PlatformConfig = {
  // Identity
  name:        'Triangle Black',
  shortName:   'TB',
  tagline:     'Engineering Operations Platform',
  logo:        '🔺',
  domain:      'triangleblack.com',
  industry:    'engineering',

  // Theme — warm-dark = Desert Premium
  theme:       'warm-dark',
  accentColor: '#C9A84C',   // Warm gold — ONE color
  accentHover: '#A8893A',   // Darker gold
  accentMuted: '#C9A84C14', // Gold at 8% opacity
  accentText:  '#0D0C0B',   // Dark on gold

  // Typography
  fontSans:    '"Inter", system-ui, sans-serif',
  fontMono:    '"JetBrains Mono", monospace',

  // Modules
  modules: {
    operations:     true,
    engineering:    true,
    assets:         true,
    procurement:    true,
    financial:      true,
    projects:       true,
    analytics:      true,
    commercial:     true,
    portals:        true,
    administration: true,
  },

  // Locale
  currency:   'EGP',
  locale:     'en-GB',
  timezone:   'Africa/Cairo',
  dateFormat: 'DD/MM/YYYY',
};

// ════════════════════════════════════════════════════════════════════════
// THEME PRESETS — Reference for different industries
// ════════════════════════════════════════════════════════════════════════

export const THEME_PRESETS: Record<ThemePreset, Partial<PlatformConfig>> = {
  'warm-dark': {
    accentColor: '#C9A84C',
    accentHover: '#A8893A',
    accentMuted: '#C9A84C14',
    accentText:  '#0D0C0B',
  },
  'cool-dark': {
    accentColor: '#3B82F6',
    accentHover: '#2563EB',
    accentMuted: '#3B82F614',
    accentText:  '#FFFFFF',
  },
  'light': {
    accentColor: '#B45309',
    accentHover: '#92400E',
    accentMuted: '#B4530914',
    accentText:  '#FFFFFF',
  },
  'corporate': {
    accentColor: '#1E40AF',
    accentHover: '#1E3A8A',
    accentMuted: '#1E40AF14',
    accentText:  '#FFFFFF',
  },
};

// ════════════════════════════════════════════════════════════════════════
// INDUSTRY PACKAGES — Reference configurations
// ════════════════════════════════════════════════════════════════════════

export const INDUSTRY_PACKAGES: Record<IndustryPackage, Partial<PlatformConfig>> = {
  engineering: {
    name: 'Triangle Black', tagline: 'Engineering Operations Platform', logo: '🔺',
    theme: 'warm-dark', accentColor: '#C9A84C',
  },
  hospitality: {
    name: 'Hospitality OS', tagline: 'Hotel Operations Platform', logo: '🏨',
    theme: 'warm-dark', accentColor: '#C9A84C',
  },
  manufacturing: {
    name: 'Factory OS', tagline: 'Manufacturing Operations Platform', logo: '🏭',
    theme: 'cool-dark', accentColor: '#3B82F6',
  },
  healthcare: {
    name: 'Care OS', tagline: 'Healthcare Operations Platform', logo: '🏥',
    theme: 'cool-dark', accentColor: '#10B981',
  },
  construction: {
    name: 'Build OS', tagline: 'Construction Operations Platform', logo: '🏗️',
    theme: 'warm-dark', accentColor: '#F59E0B',
  },
  retail: {
    name: 'Retail OS', tagline: 'Retail Operations Platform', logo: '🛍️',
    theme: 'light', accentColor: '#8B5CF6',
  },
  energy: {
    name: 'Energy OS', tagline: 'Energy Operations Platform', logo: '⚡',
    theme: 'cool-dark', accentColor: '#F59E0B',
  },
};

// ════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════

export function getPlatformName()    { return PLATFORM.name; }
export function getPlatformAccent()  { return PLATFORM.accentColor; }
export function getPlatformCurrency(){ return PLATFORM.currency; }
export function isModuleEnabled(mod: keyof PlatformConfig['modules']) {
  return PLATFORM.modules[mod] ?? false;
}
