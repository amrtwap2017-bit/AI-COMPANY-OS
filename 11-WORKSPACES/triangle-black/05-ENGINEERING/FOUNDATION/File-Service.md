# PLT-001 — File Service

## `apps/api/src/modules/documents/documents.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
      },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.xlsx', '.dwg', '.jpg', '.jpeg', '.png'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${ext} not allowed`), false);
        }
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
```

## `apps/api/src/modules/documents/documents.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    tenantId: string;
    companyId?: string;
    projectId?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: params.tenantId };
    if (params.companyId) where.companyId = params.companyId;
    if (params.projectId) where.projectId = params.projectId;
    if (params.category) where.category = params.category;

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async create(dto: {
    tenantId: string;
    companyId: string;
    name: string;
    storagePath: string;
    fileType: string;
    fileSize: number;
    category: string;
    projectId?: string;
    uploadedBy: string;
  }) {
    return this.prisma.document.create({ data: dto });
  }

  async delete(id: string) {
    const doc = await this.findById(id);
    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Document deleted' };
  }
}
```

## `apps/api/src/modules/documents/documents.controller.ts`

```typescript
import {
  Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
    @CurrentUser('tenantId') tenantId?: string,
  ) {
    return this.documentsService.findAll({
      tenantId: tenantId ?? '',
      companyId,
      projectId,
      category,
      page: page || 1,
      limit: limit || 20,
    });
  }

  @Post('upload')
  @Roles('admin', 'manager', 'engineer', 'sales_rep')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('companyId') companyId: string,
    @Body('category') category: string,
    @Body('projectId') projectId: string,
    @CurrentUser() user: { tenantId: string; sub: string },
  ) {
    if (!file) throw new BadRequestException('File is required');
    if (!companyId) throw new BadRequestException('companyId is required');
    if (!category) throw new BadRequestException('category is required');

    return this.documentsService.create({
      tenantId: user.tenantId,
      companyId,
      name: file.originalname,
      storagePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      category,
      projectId: projectId || undefined,
      uploadedBy: user.sub,
    });
  }

  @Get(':id/download')
  async download(@Param('id') id: string) {
    const doc = await this.documentsService.findById(id);
    return { data: doc };
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }
}
```
