import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter:   () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/workspace',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter-mock' }),
}));

// Mock environment
process.env.NEXT_PUBLIC_API_URL      = 'http://localhost:8030';
process.env.NEXT_PUBLIC_AUTH_BYPASS  = 'true';
process.env.NEXT_PUBLIC_APP_ENV      = 'test';
