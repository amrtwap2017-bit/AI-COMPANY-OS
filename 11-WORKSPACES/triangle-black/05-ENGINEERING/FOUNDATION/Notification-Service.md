# PLT-002 — Notification Service

## `apps/api/src/modules/notifications/notifications.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

## `apps/api/src/modules/notifications/notifications.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(userId: string, params: { page?: number; limit?: number; isRead?: boolean }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (params.isRead !== undefined) where.isRead = params.isRead;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: {
    userId: string;
    type: string;
    title: string;
    body: string;
    link?: string;
  }) {
    const notification = await this.prisma.notification.create({ data: dto });

    this.eventEmitter.emit('notification.created', notification);

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { count: result.count };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // Notification type helpers
  async notifyLeadAssigned(leadId: string, assignedTo: string, assignedBy: string) {
    await this.create({
      userId: assignedTo,
      type: 'lead_assigned',
      title: 'New lead assigned',
      body: 'A new lead has been assigned to you.',
      link: `/crm/leads/${leadId}`,
    });
  }

  async notifyQuotationStatus(quotationId: string, userId: string, status: string) {
    await this.create({
      userId,
      type: 'quotation_status',
      title: `Quotation ${status}`,
      body: `Your quotation has been ${status}.`,
      link: `/quotations/${quotationId}`,
    });
  }

  async notifyMilestoneCompleted(milestoneId: string, projectId: string, managerId: string) {
    await this.create({
      userId: managerId,
      type: 'milestone_completed',
      title: 'Milestone completed',
      body: 'A milestone is ready for your approval.',
      link: `/projects/${projectId}/milestones/${milestoneId}`,
    });
  }

  async notifyServiceRequestUpdate(requestId: string, userId: string, status: string) {
    await this.create({
      userId,
      type: 'service_request',
      title: `Request ${status}`,
      body: `Your service request has been ${status}.`,
      link: `/portal/service-requests/${requestId}`,
    });
  }
}
```

## `apps/api/src/modules/notifications/notifications.controller.ts`

```typescript
import {
  Controller, Get, Patch, Post, Query, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isRead') isRead?: string,
  ) {
    return this.notificationsService.findAll(userId, {
      page: page || 1,
      limit: limit || 20,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
    });
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { data: { count } };
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
```
