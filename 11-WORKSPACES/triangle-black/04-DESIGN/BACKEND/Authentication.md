# Authentication — JWT

Triangle Black uses stateless **JWT access tokens** with signed **refresh tokens**. Passwords are hashed with **bcrypt** (cost factor 12).

## Auth Flow

```
Client                    Server
  │                         │
  ├── POST /auth/login ────►│ Validate credentials
  │                         │ Generate access + refresh tokens
  │◄──── tokens ────────────┤
  │                         │
  ├── Request + Bearer JWT ►│ JwtAuthGuard validates
  │                         │
  ├── POST /auth/refresh ──►│ Validate refresh token
  │◄──── new access token ──┤
```

## Token Configuration

```typescript
// config/jwt.config.ts
export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  accessExpiresIn: '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: '7d',
}));
```

## Login Controller

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthTokenResponse> {
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthTokenResponse> {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<AccessTokenResponse> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: AuthUser) {
    await this.authService.logout(user.id);
  }
}
```

## Auth Service

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async refresh(token: string): Promise<AccessTokenResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.refreshSecret'),
      });
      const user = await this.userRepository.findById(payload.sub);
      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const accessToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: this.configService.get('jwt.accessExpiresIn') },
      );
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokenResponse> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: this.configService.get('jwt.accessExpiresIn') }),
      this.jwtService.signAsync(payload, { secret: this.configService.get('jwt.refreshSecret'), expiresIn: this.configService.get('jwt.refreshExpiresIn') }),
    ]);
    await this.userRepository.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}
```

## Guards

```typescript
// common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Open routes are decorated with @Public()
@SetMetadata('isPublic', true)
export const Public = () => SetMetadata('isPublic', true);
```

## Password Hashing

```typescript
// In UserService during registration
const passwordHash = await bcrypt.hash(password, 12);
```

## Security Notes

- Access tokens expire in **15 minutes**; refresh tokens in **7 days**
- Refresh tokens are stored as hashed values in the database for rotation/revocation
- Rate limiting is applied to `/auth/login` (5 attempts per minute per IP)
- JWT secrets must be rotated periodically via environment variable updates
