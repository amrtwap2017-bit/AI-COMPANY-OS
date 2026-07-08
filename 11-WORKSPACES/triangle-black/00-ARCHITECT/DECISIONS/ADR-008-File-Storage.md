# ADR-008: File Storage

**Status:** Accepted

**Context:** Triangle Black needs to store property images, guest documents, invoices, and exported reports. In V1 (single VPS, < 100 tenants), simplicity and cost-effectiveness are priorities. The storage solution must support upload, retrieval, and thumbnail generation, with a clear migration path to S3-compatible object storage when the application scales.

**Decision:**

We will use **local disk storage (V1)** with an abstraction layer that supports S3-compatible storage (V2+).

Architecture:
```
V1 (Local disk):
  Uploads stored at: /data/uploads/{tenant_id}/{entity_type}/{entity_id}/{filename}
  Served via: Nginx (static file serving) or Next.js API routes
  Example: /data/uploads/tenant_abc/property_images/prop_123/main.jpg

V2+ (S3-compatible):
  Uploads stored in: s3://triangle-black/{tenant_id}/{entity_type}/{entity_id}/{filename}
  S3-compatible services: MinIO (self-hosted), AWS S3, DigitalOcean Spaces, Backblaze B2
```

Storage abstraction interface (shared kernel):
```typescript
interface FileStorageService {
  upload(file: Buffer, path: string): Promise<FileUploadResult>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getUrl(path: string): Promise<string>;  // signed URL or direct URL
}
```

**Consequences:**

*Positive:*
- Local storage is free and simple — no external dependencies for V1
- Nginx serves static files efficiently with Sendfile, caching, and compression
- The abstraction layer means switching to S3 requires only a new implementation
- Full control over file organization and naming
- No egress costs (important for image-heavy hospitality properties)

*Negative:*
- Local storage does not scale to multiple app servers (each server has its own disk)
- Backup includes file data — larger backup sizes
- No built-in redundancy (single disk failure = data loss)
- Thumbnail generation requires processing on the same server
- No CDN integration without additional configuration

**Future Evolution:**
- **V2:** Add MinIO container (S3-compatible, self-hosted) alongside existing services
- **V3:** Migrate to managed S3 (AWS S3 or DigitalOcean Spaces) with CDN (CloudFront)
- **V4:** Add image transformation pipeline (resize, crop, WebP conversion) via CDN

**Alternatives:**
- **AWS S3 from day one** — rejected: adds complexity, cost, and internet dependency; overkill for V1
- **Cloudinary** — rejected: expensive at scale, vendor lock-in for image-heavy use
- **Supabase Storage** — rejected: vendor lock-in, less control over data
- **Database BLOB storage** — rejected: poor performance, bloats database backups, no streaming
- **Git LFS** — rejected: not designed for application file management

**Related ADRs:** ADR-001 (Tech Stack), ADR-009 (Deployment)
