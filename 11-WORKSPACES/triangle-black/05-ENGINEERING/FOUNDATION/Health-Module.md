# APP-010 — Health Module

## `apps/api/src/modules/health/health.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

## `apps/api/src/modules/health/health.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const start = Date.now();
    let dbStatus = 'ok';
    let dbLatency = '0ms';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = `${Date.now() - start}ms`;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latency: dbLatency },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    };
  }
}
```
