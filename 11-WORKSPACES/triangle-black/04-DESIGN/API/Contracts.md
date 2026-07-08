# Contracts — Data Contracts Between Frontend & Backend

Data contracts define the shape of data exchanged between the Next.js frontend and the NestJS backend. These contracts are the source of truth for both teams.

## Contract Location

- **Shared types** — 	ypes/api.ts in the frontend project
- **DTOs** — *.dto.ts files in the backend project
- **OpenAPI spec** — canonical reference maintained in openapi/

## Base Types

`	ypescript
// Common API response envelope
interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string; // ISO 8601
  };
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    requestId: string;
    timestamp: string;
  };
}

interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
  meta: {
    requestId: string;
    timestamp: string;
  };
}
`

## Entity Contracts

### User

`	ypescript
interface User {
  id: string;             // UUID
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: User['role'];
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: User['role'];
  isActive?: boolean;
}
`

### Property

`	ypescript
type PropertyType = 'HOTEL' | 'APARTMENT' | 'VILLA' | 'RESORT' | 'ROOM';
type PropertyStatus = 'ACTIVE' | 'MAINTENANCE' | 'ARCHIVED';
type Amenity = 'POOL' | 'WIFI' | 'PARKING' | 'GYM' | 'SPA' | 'RESTAURANT' | 'BREAKFAST' | 'AIRPORT_SHUTTLE';

interface Property {
  id: string;
  name: string;
  description: string;
  type: PropertyType;
  address: {
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
  };
  maxGuests: number;
  baseRate: number;
  currency: string;
  status: PropertyStatus;
  amenities: Amenity[];
  images: PropertyImage[];
  createdAt: string;
  updatedAt: string;
}

interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface CreatePropertyDto {
  name: string;
  type: PropertyType;
  address: Property['address'];
  maxGuests: number;
  baseRate: number;
  currency: string;
  amenities: Amenity[];
}

interface UpdatePropertyDto {
  name?: string;
  type?: PropertyType;
  baseRate?: number;
  status?: PropertyStatus;
  amenities?: Amenity[];
}
`

### Booking

`	ypescript
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'FAILED';
type BookingSource = 'DIRECT' | 'BOOKING_COM' | 'EXPEDIA' | 'AGODA' | 'AIRBNB' | 'PHONE' | 'WALK_IN';

interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  guestId: string;
  guestName: string;
  checkIn: string;    // YYYY-MM-DD
  checkOut: string;   // YYYY-MM-DD
  adults: number;
  children: number;
  status: BookingStatus;
  addons: BookingAddon[];
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  source: BookingSource;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingAddon {
  name: string;
  price: number;
  quantity: number;
}

interface CreateBookingDto {
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  addons?: string[];
  notes?: string;
  source?: BookingSource;
}

interface UpdateBookingDto {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  addons?: string[];
  notes?: string;
}
`

### Guest

`	ypescript
interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  idDocument?: {
    type: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE';
    number: string;
  };
  preferences?: Record<string, string>;
  totalStays: number;
  totalSpent: number;
  lastStay: string | null;
  createdAt: string;
}

interface CreateGuestDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  idDocument?: Guest['idDocument'];
}

interface UpdateGuestDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  idDocument?: Guest['idDocument'];
  preferences?: Record<string, string>;
}
`

### Housekeeping Task

`	ypescript
type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
type TaskType = 'CLEANING' | 'DEEP_CLEAN' | 'INSPECTION' | 'MAINTENANCE' | 'TURNOVER' | 'LOST_AND_FOUND';

interface HousekeepingTask {
  id: string;
  propertyId: string;
  propertyName: string;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: { id: string; name: string } | null;
  scheduledAt: string;
  completedAt: string | null;
  notes: string;
  createdAt: string;
}

interface CreateTaskDto {
  propertyId: string;
  taskType: TaskType;
  priority: TaskPriority;
  assignedTo?: string;
  scheduledAt: string;
  notes?: string;
}

interface UpdateTaskDto {
  status?: TaskStatus;
  assignedTo?: string;
  priority?: TaskPriority;
  scheduledAt?: string;
  notes?: string;
  completedAt?: string;
}
`

### Finance

`	ypescript
type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'APPLE_PAY' | 'STC_PAY';
type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

interface Payment {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface ProcessPaymentDto {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  paymentToken: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  guestName: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
  lineItems: InvoiceLineItem[];
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
`

## Enums (Shared)

`	ypescript
// These are shared between frontend and backend
export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export const PaymentStatus = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  FAILED: 'FAILED',
} as const;

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  GUEST: 'GUEST',
} as const;
`

## Contract Change Process

1. OpenAPI spec is the source of truth
2. Any contract change starts with an OpenAPI spec update PR
3. Frontend types are regenerated from the spec
4. Backend DTOs are updated to match
5. E2E tests validate contract adherence
