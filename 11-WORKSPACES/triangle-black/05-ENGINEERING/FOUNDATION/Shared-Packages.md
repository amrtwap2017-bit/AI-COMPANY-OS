# ENG-004 — Shared Packages

## `packages/types/package.json`

```json
{
  "name": "@tb/types",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

## `packages/types/tsconfig.json`

```json
{
  "extends": "@tb/config/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

## `packages/types/src/index.ts`

```typescript
// Shared type definitions across all apps

// ===== API Envelope =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ValidationDetail[];
  };
}

export interface ValidationDetail {
  field: string;
  message: string;
  code: string;
}

// ===== Pagination =====
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextCursor?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  cursor?: string;
}

// ===== Common Entity Fields =====
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
}

// ===== User =====
export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'sales_rep'
  | 'engineer'
  | 'viewer'
  | 'client_admin'
  | 'client_user';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

// ===== Tenant =====
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  currency: string;
  timezone: string;
}

// ===== Auth =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

// ===== Quotation =====
export interface Quotation {
  id: string;
  number: string;
  companyId: string;
  status: QuotationStatus;
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  validUntil: string;
}

export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired';

// ===== Project =====
export interface Project {
  id: string;
  code: string;
  name: string;
  companyId: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  completionPercent: number;
}

export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

// ===== Notification =====
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}
```

## `packages/utils/package.json`

```json
{
  "name": "@tb/utils",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@tb/types": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

## `packages/utils/src/index.ts`

```typescript
export function generateNumber(prefix: string, seq: number, year?: number): string {
  const y = year ?? new Date().getFullYear();
  return `${prefix}-${y}-${String(seq).padStart(5, '0')}`;
}

export function calculateTotal(quantity: number, unitPrice: number, discountPercent = 0): number {
  const subtotal = quantity * unitPrice;
  const discount = subtotal * (discountPercent / 100);
  return subtotal - discount;
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

export function calculateGrandTotal(subtotal: number, taxTotal: number): number {
  return subtotal + taxTotal;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function formatCurrency(amount: number, currency = 'EGP'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
```
