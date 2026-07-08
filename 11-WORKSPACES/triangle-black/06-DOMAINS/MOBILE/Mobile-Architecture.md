# Phase 06 — Mobile Architecture

> PWA mobile application for field operations with offline support.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRIANGLE BLACK PWA                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 CORE APP LAYER                           │    │
│  │  ├─ Site Survey (photo capture, form, offline)          │    │
│  │  ├─ Daily Report (progress, photos, issues)             │    │
│  │  ├─ NCR Creation (photo, description, classification)   │    │
│  │  ├─ Stock Lookup (real-time availability)               │    │
│  │  └─ Service Request (create, update, resolve)          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  OFFLINE LAYER                           │    │
│  │  ├─ Service Worker (cache-first strategy)               │    │
│  │  ├─ IndexedDB (offline data store)                      │    │
│  │  └─ Sync Queue (deferred API calls)                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  FIELD CAPABILITIES                      │    │
│  │  ├─ Camera (photo capture for surveys, NCRs, reports)   │    │
│  │  ├─ GPS (location tagging)                              │    │
│  │  ├─ Signature Capture (handover, approvals)             │    │
│  │  └─ QR/Barcode Scanner (stock, assets)                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Key Screens

| Screen | Purpose | Offline |
|--------|---------|---------|
| Site Survey | Field inspection with photo capture | ✅ |
| Daily Report | Daily progress report with photos | ✅ |
| NCR Creation | Non-conformance documentation | ✅ |
| Stock Lookup | Real-time inventory check | Partial |
| Service Request | Maintenance request management | ✅ |
| Asset Scanner | QR/barcode asset identification | ✅ |

## Technology

| Feature | Implementation |
|---------|---------------|
| Framework | Next.js PWA (same codebase as web) |
| Offline | Service Worker + IndexedDB (idb library) |
| Sync | Background sync API with conflict resolution |
| Photos | Camera API → compress → upload queue |
| PWA Manifest | Web App Manifest with install prompt |

## Location

`12-MOBILE/` — 20 files following the standard template.
