# IDN-007 — Users Module

## `apps/api/src/modules/users/users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## `apps/api/src/modules/users/users.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    tenantId: string;
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: params.tenantId };
    if (params.role) where.role = params.role;
    if (params.isActive !== undefined) where.isActive = params.isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
    createdBy: string;
  }) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as any,
        tenantId: dto.tenantId,
        createdBy: dto.createdBy,
        updatedBy: dto.createdBy,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: { firstName?: string; lastName?: string; role?: string; isActive?: boolean; updatedBy: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.role && { role: dto.role as any }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        updatedBy: dto.updatedBy,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
  }

  async deactivate(id: string, updatedBy: string) {
    return this.update(id, { isActive: false, updatedBy });
  }
}
```

## `apps/api/src/modules/users/users.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('admin', 'super_admin')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.usersService.findAll({
      tenantId,
      page: page || 1,
      limit: limit || 20,
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @Roles('admin', 'super_admin', 'manager')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('admin', 'super_admin')
  async create(
    @Body() dto: { email: string; password: string; firstName: string; lastName: string; role: string },
    @CurrentUser() user: { tenantId: string; sub: string },
  ) {
    return this.usersService.create({
      ...dto,
      tenantId: user.tenantId,
      createdBy: user.sub,
    });
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  async update(
    @Param('id') id: string,
    @Body() dto: { firstName?: string; lastName?: string; role?: string; isActive?: boolean },
    @CurrentUser('sub') updatedBy: string,
  ) {
    return this.usersService.update(id, { ...dto, updatedBy });
  }

  @Delete(':id')
  @Roles('super_admin')
  async deactivate(
    @Param('id') id: string,
    @CurrentUser('sub') updatedBy: string,
  ) {
    await this.usersService.deactivate(id, updatedBy);
    return { message: 'User deactivated' };
  }
}
```
