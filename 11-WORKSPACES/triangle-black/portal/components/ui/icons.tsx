/**
 * Triangle Black — Professional Icon System
 * Built on Lucide React — Clean, minimal, precise
 * Version: 2.0 — UX-001
 *
 * Usage: import { TBIcon } from '@/components/ui/icons'
 * <TBIcon name="work-order" size={18} className="text-[var(--color-brand)]" />
 */
'use client'

import {
  // Operations
  ClipboardList, Wrench, Settings, CheckCircle2, Circle,
  AlertCircle, AlertTriangle, Clock, Timer, Hourglass,
  // Assets
  Building2, Package, Layers, Server, Cpu, Zap, Droplets,
  Wind, Thermometer, Shield, Lock, Key,
  // Procurement
  ShoppingCart, ShoppingBag, Truck, Archive, Box,
  BarChart3, TrendingUp, TrendingDown, PieChart, Activity,
  // People
  User, Users, UserCheck, UserCog, UserPlus, Briefcase,
  // Communication
  Bell, BellRing, Mail, MessageSquare, Send,
  // Navigation
  Home, LayoutDashboard, Menu, ChevronRight, ChevronDown,
  ChevronLeft, ChevronUp, ArrowRight, ArrowLeft, ArrowUp,
  // Actions
  Plus, Minus, Edit3, Trash2, Eye, EyeOff, Copy, Download,
  Upload, RefreshCw, RotateCcw, Search, Filter, SlidersHorizontal,
  // Finance
  DollarSign, CreditCard, Receipt, Wallet, Banknote, Calculator,
  // Files & Docs
  FileText, File, Folder, FolderOpen, Paperclip, Link,
  // Status & Signals
  CheckCheck, X, XCircle, Info, Sparkles, Star, StarOff,
  // Workflow
  GitBranch, Workflow, Milestone, Flag, BookOpen, Hash,
  // AI & Digital
  Brain, Bot, Cpu as AiCpu, Scan, QrCode, Globe,
  // Time & Calendar
  Calendar, CalendarCheck, CalendarClock, CalendarX,
  // Map & Location
  MapPin, Map, Navigation, Compass,
  // Misc
  MoreHorizontal, MoreVertical, ExternalLink, LogOut,
  type LucideIcon
} from 'lucide-react'

// ── Icon Map ─────────────────────────────────────────────────────────────────
export const TB_ICONS: Record<string, LucideIcon> = {
  // Operations domain
  'work-order':        ClipboardList,
  'service-request':   ClipboardList,
  'maintenance':       Wrench,
  'settings':          Settings,
  'complete':          CheckCircle2,
  'pending':           Circle,
  'alert':             AlertCircle,
  'warning':           AlertTriangle,
  'clock':             Clock,
  'timer':             Timer,
  'overdue':           Hourglass,
  'sla':               Timer,

  // Assets domain
  'asset':             Building2,
  'building':          Building2,
  'inventory':         Package,
  'layers':            Layers,
  'server':            Server,
  'electrical':        Zap,
  'plumbing':          Droplets,
  'hvac':              Wind,
  'temperature':       Thermometer,
  'security':          Shield,
  'access':            Lock,
  'key':               Key,

  // Procurement domain
  'purchase-order':    ShoppingCart,
  'purchase-request':  ShoppingBag,
  'delivery':          Truck,
  'warehouse':         Archive,
  'stock':             Box,

  // Analytics
  'analytics':         BarChart3,
  'trend-up':          TrendingUp,
  'trend-down':        TrendingDown,
  'chart':             PieChart,
  'activity':          Activity,
  'kpi':               BarChart3,

  // People & HR
  'user':              User,
  'users':             Users,
  'technician':        UserCheck,
  'admin':             UserCog,
  'add-user':          UserPlus,
  'employee':          Briefcase,

  // Notifications
  'notification':      Bell,
  'alert-bell':        BellRing,
  'email':             Mail,
  'message':           MessageSquare,
  'send':              Send,

  // Navigation
  'home':              Home,
  'dashboard':         LayoutDashboard,
  'menu':              Menu,
  'next':              ChevronRight,
  'expand':            ChevronDown,
  'back':              ChevronLeft,
  'collapse':          ChevronUp,
  'arrow-right':       ArrowRight,
  'arrow-left':        ArrowLeft,
  'arrow-up':          ArrowUp,

  // Actions
  'add':               Plus,
  'remove':            Minus,
  'edit':              Edit3,
  'delete':            Trash2,
  'view':              Eye,
  'hide':              EyeOff,
  'copy':              Copy,
  'download':          Download,
  'upload':            Upload,
  'refresh':           RefreshCw,
  'undo':              RotateCcw,
  'search':            Search,
  'filter':            Filter,
  'sliders':           SlidersHorizontal,

  // Finance
  'invoice':           Receipt,
  'payment':           CreditCard,
  'cost':              DollarSign,
  'wallet':            Wallet,
  'cash':              Banknote,
  'calculator':        Calculator,

  // Documents
  'document':          FileText,
  'file':              File,
  'folder':            Folder,
  'folder-open':       FolderOpen,
  'attachment':        Paperclip,
  'link':              Link,

  // Status signals
  'check-all':         CheckCheck,
  'close':             X,
  'error':             XCircle,
  'info':              Info,
  'ai':                Sparkles,
  'star':              Star,
  'unstar':            StarOff,

  // Workflow
  'workflow':          Workflow,
  'branch':            GitBranch,
  'milestone':         Milestone,
  'flag':              Flag,
  'knowledge':         BookOpen,
  'tag':               Hash,

  // AI & Digital
  'brain':             Brain,
  'bot':               Bot,
  'scan':              Scan,
  'qr':                QrCode,
  'globe':             Globe,

  // Time
  'calendar':          Calendar,
  'calendar-done':     CalendarCheck,
  'calendar-time':     CalendarClock,
  'calendar-cancel':   CalendarX,

  // Location
  'location':          MapPin,
  'map':               Map,
  'navigate':          Navigation,
  'compass':           Compass,

  // Misc
  'more':              MoreHorizontal,
  'more-v':            MoreVertical,
  'external':          ExternalLink,
  'logout':            LogOut,
}

// ── TBIcon Component ─────────────────────────────────────────────────────────
interface TBIconProps {
  name: string
  size?: number
  className?: string
  strokeWidth?: number
}

export function TBIcon({
  name,
  size = 18,
  className = '',
  strokeWidth = 1.75
}: TBIconProps) {
  const Icon = TB_ICONS[name]
  if (!Icon) {
    // Fallback to circle for unknown icons
    return <Circle size={size} className={className} strokeWidth={strokeWidth} />
  }
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />
}

// ── Domain Icon Sets ─────────────────────────────────────────────────────────
export const DOMAIN_ICONS = {
  operations:    'work-order',
  maintenance:   'maintenance',
  assets:        'asset',
  procurement:   'purchase-order',
  inventory:     'inventory',
  finance:       'invoice',
  hr:            'employee',
  analytics:     'analytics',
  ai:            'ai',
  admin:         'settings',
  notifications: 'notification',
  documents:     'document',
} as const

// Re-
export individual icons for direct useexport {
  ClipboardList, Wrench, Settings, CheckCircle2, AlertCircle,
  AlertTriangle, Clock, Timer, Building2, Package, BarChart3,
  User, Users, Bell, Search, Filter, Plus, Edit3, Trash2,
  Download, Upload, RefreshCw, FileText, ChevronRight,
  ChevronDown, ChevronLeft, LayoutDashboard, Home, Sparkles,
  Brain, Calendar, MapPin, Receipt, DollarSign, Truck,
  UserCheck, Shield, Workflow, Flag, Activity, TrendingUp,
  Eye, EyeOff, X, XCircle, Info, CheckCheck, MoreHorizontal,
  ExternalLink, LogOut, SlidersHorizontal, GitBranch
}
