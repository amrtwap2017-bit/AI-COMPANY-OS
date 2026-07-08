# QA-001 — Unit Tests

## Jest Config

```typescript
// apps/api/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/main.ts', '!src/**/*.module.ts'],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@tb/(.*)$': '<rootDir>/../../packages/$1/src',
  },
};

export default config;
```

## Example Service Test

```typescript
// apps/api/src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: '$2b$12$hashed',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        tenantId: 'tenant-1',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        updatedBy: 'admin',
        deletedAt: null,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      const bcrypt = await import('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login('test@test.com', 'password123');
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw for invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login('wrong@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw for inactive user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as any);
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });
  });
});
```
