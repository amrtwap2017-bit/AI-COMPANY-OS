# API-002 — Validation

## DTO Pattern

```typescript
// apps/api/src/modules/crm/dto/create-lead.dto.ts
import {
  IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Hassan' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: 'ahmed@hotel.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+201234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Pyramids Resort' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @ApiProperty({ enum: ['website', 'referral', 'event', 'cold_outreach', 'other'] })
  @IsEnum(['website', 'referral', 'event', 'cold_outreach', 'other'])
  source: 'website' | 'referral' | 'event' | 'cold_outreach' | 'other';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
```

## Query DTO Pattern

```typescript
// apps/api/src/modules/crm/dto/query-lead.dto.ts
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryLeadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['new', 'contacted', 'qualified', 'disqualified', 'converted'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
```

## Validation Pipe Configuration

```typescript
// In main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,          // Strip unknown properties
    forbidNonWhitelisted: true, // Throw on unknown properties
    transform: true,           // Auto-transform types
    transformOptions: {
      enableImplicitConversion: true, // Convert query strings to numbers
    },
  }),
);
```
