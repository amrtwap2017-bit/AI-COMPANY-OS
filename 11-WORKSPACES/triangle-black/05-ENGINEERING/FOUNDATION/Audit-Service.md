# PLT-006 — Audit Service

## `apps/api/src/modules/audit/audit.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
```

## `apps/api/src/modules/audit/audit.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async record(params: {
    tenantId?: string;
    tableName: string;
    recordId: string;
    action: 'create' | 'update' | 'delete';
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    changedBy: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const log = await this.prisma.auditLog.create({ data: params });

    this.eventEmitter.emit('audit.recorded', {
      tableName: params.tableName,
      recordId: params.recordId,
      action: params.action,
      changedBy: params.changedBy,
    });

    return log;
  }

  async findAll(params: {
    tenantId?: string;
    tableName?: string;
    recordId?: string;
    changedBy?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.tableName) where.tableName = params.tableName;
    if (params.recordId) where.recordId = params.recordId;
    if (params.changedBy) where.changedBy = params.changedBy;
    if (params.from || params.to) {
      where.changedAt = {};
      if (params.from) (where.changedAt as Record<string, unknown>).gte = new Date(params.from);
      if (params.to) (where.changedAt as Record<string, unknown>).lte = new Date(params.to);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { changedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByResource(tableName: string, recordId: string) {
    return this.prisma.auditLog.findMany({
      where: { tableName, recordId },
      orderBy: { changedAt: 'desc' },
      take: 50,
    });
  }
}
```

## `apps/api/src/modules/audit/audit.controller.ts`

```typescript
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/audit-logs')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles('admin', 'super_admin')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tableName') tableName?: string,
    @Query('recordId') recordId?: string,
    @Query('changedBy') changedBy?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditService.findAll({
      tableName,
      recordId,
      changedBy,
      from,
      to,
      page: page || 1,
      limit: limit || 20,
    });
  }

  @Get('resource/:tableName/:recordId')
  @Roles('admin', 'super_admin')
  async findByResource(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
  ) {
    return this.auditService.findByResource(tableName, recordId);
  }
}
```
