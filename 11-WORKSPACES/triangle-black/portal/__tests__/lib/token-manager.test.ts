import { tokenManager } from '@/lib/auth/token-manager';

describe('tokenManager', () => {
  beforeEach(() => {
    tokenManager.clearAll();
  });

  it('stores and retrieves token from sessionStorage', () => {
    tokenManager.setToken('test-token-123');
    expect(tokenManager.getToken()).toBe('test-token-123');
  });

  it('returns null when no token set', () => {
    expect(tokenManager.getToken()).toBeNull();
  });

  it('clears token on clearAll', () => {
    tokenManager.setToken('test-token-123');
    tokenManager.clearAll();
    expect(tokenManager.getToken()).toBeNull();
  });

  it('stores and retrieves user', () => {
    const user = { id: 1, name: 'Test User', email: 'test@tb.com', role: 'admin', is_active: true };
    tokenManager.setUser(user);
    expect(tokenManager.getUser()).toEqual(user);
  });

  it('returns authenticated when AUTH_BYPASS is true', () => {
    process.env.NEXT_PUBLIC_AUTH_BYPASS = 'true';
    expect(tokenManager.isAuthenticated()).toBe(true);
  });
});
