# 07 — SDK

> Software development kit for ecosystem developers.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Public-API.md | API specifications |
| Phase 10 — Developer-Portal.md | Developer experience |

## SDK Languages

| Language | Coverage | Status | H1 Target |
|----------|----------|--------|-----------|
| TypeScript/JavaScript | Full API | Planned | ✅ |
| Python | Full API | Planned | ✅ |
| PHP | Full API | Planned | ✅ |
| .NET | Core API | Backlog | — |
| Java | Core API | Backlog | — |
| Ruby | Core API | Backlog | — |
| Go | Core API | Backlog | — |

## SDK Features

| Feature | TypeScript | Python | PHP |
|---------|-----------|--------|-----|
| Full API coverage | ✅ | ✅ | ✅ |
| Type definitions | ✅ | ✅ | — |
| Rate limit handling | ✅ | ✅ | ✅ |
| Error handling | ✅ | ✅ | ✅ |
| Retry logic | ✅ | ✅ | ✅ |
| Webhook validation | ✅ | ✅ | ✅ |
| OAuth 2.0 flow | ✅ | ✅ | ✅ |
| Pagination helpers | ✅ | ✅ | ✅ |
| Request/response logging | ✅ | ✅ | ✅ |

## SDK Generation

| Method | Tool | Source of Truth |
|--------|------|-----------------|
| Code generation | openapi-generator | OpenAPI spec |
| Manual wrappers | Custom | Generated base + manual |
| Documentation | TypeDoc, Sphinx, PHPDoc | Generated + manual |

## SDK Quickstart

```typescript
// TypeScript example
import { TriangleBlack } from '@triangleblack/sdk';

const tb = new TriangleBlack({ apiKey: 'YOUR_API_KEY' });

// List hotels
const hotels = await tb.hotels.list({ page: 1, perPage: 10 });

// Create booking
const booking = await tb.bookings.create({
  hotelId: 'hotel_123',
  roomId: 'room_456',
  guestId: 'guest_789',
  checkIn: '2026-08-01',
  checkOut: '2026-08-05',
});
```

## SDK Distribution

| Language | Registry | Package Name |
|----------|----------|-------------|
| TypeScript | npm | @triangleblack/sdk |
| Python | PyPI | triangleblack-sdk |
| PHP | Packagist | triangleblack/sdk |

## SDK Maintenance

| Activity | Frequency | Owner |
|----------|-----------|-------|
| API alignment | On API change | Engineering |
| Security updates | On vulnerability | Engineering |
| Deprecation | 6 months before | Product |
| Documentation | On change | Product |
| Test suite | Continuous | Engineering |
