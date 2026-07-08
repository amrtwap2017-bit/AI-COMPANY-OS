# Localization — i18n & Arabic RTL

Triangle Black supports **English (LTR)** and **Arabic (RTL)** using 
ext-intl.

## Setup

`	ypescript
// next-intl.config.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(./src/locales//common.json)).default,
}));
`

`	ypescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();
export default withNextIntl({
  // other next config
});
`

## Translation Files

`
src/locales/
├── en/
│   ├── common.json        — Navigation, buttons, labels, errors
│   ├── auth.json          — Login, register, password
│   ├── dashboard.json     — Dashboard widget titles, KPI labels
│   ├── bookings.json      — Booking CRUD, status, form labels
│   ├── properties.json    — Property CRUD, types, amenities
│   ├── guests.json        — Guest profile, registration
│   └── housekeeping.json  — Task status, room types
└── ar/
    ├── common.json
    ├── auth.json
    ├── dashboard.json
    ├── bookings.json
    ├── properties.json
    ├── guests.json
    └── housekeeping.json
`

## Usage in Components

### Server Component

`	ypescript
import { getTranslations } from 'next-intl/server';

export default async function BookingsPage() {
  const t = await getTranslations('bookings');
  return <h1>{t('title')}</h1>;
}
`

### Client Component

`	ypescript
'use client';
import { useTranslations } from 'next-intl';

export function BookingForm() {
  const t = useTranslations('bookings.form');
  return <label>{t('checkIn')}</label>;
}
`

## Arabic RTL Support

### HTML Direction

`	ypescript
// Root layout
export default function RootLayout({ children, params: { locale } }) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
`

### Tailwind RTL Classes

`	sx
<div className="flex gap-2 rtl:flex-row-reverse">
  <Button>{t('save')}</Button>
  <Button variant="outline">{t('cancel')}</Button>
</div>
`

Use Tailwind's tl: / ltr: modifiers for bidirectional styles:

| Utility          | LTR               | RTL               |
| ---------------- | ----------------- | ----------------- |
| 	ext-start     | left-aligned      | right-aligned     |
| 	ext-end       | right-aligned     | left-aligned      |
| ps-4           | padding-left: 1rem| padding-right: 1rem|
| pe-4           | padding-right: 1rem| padding-left: 1rem |
| lex-row       | LTR order         | lex-row-reverse |

### Arabic Font

A dedicated Arabic font (Tajawal) is loaded for Arabic locale:

`	ypescript
// src/app/layout.tsx
import localFont from 'next/font/local';
const tajawal = localFont({ src: '../../public/fonts/tajawal/Tajawal-Regular.woff2', variable: '--font-arabic' });
`

## Locale Detection

- Default: browser Accept-Language header
- Override: /ar/dashboard path prefix or user preference in settings
- Saved: user's locale field in database

## Translation Key Conventions

| Convention          | Example                          |
| ------------------- | -------------------------------- |
| CamelCase paths     | ookings.form.checkIn          |
| Placeholders        | {name} created successfully    |
| Pluralization       | {count} booking(s)             |
| Status labels       | status.confirmed               |
| Error messages      | errors.validation.required     |
