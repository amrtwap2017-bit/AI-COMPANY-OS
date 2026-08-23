import { chromium, FullConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8030';
const MAX_WAIT_MS = 120000;
const POLL_INTERVAL_MS = 3000;

async function waitForUrl(url: string, label: string): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.status < 500) {
        console.log(`✅ ${label} is ready (HTTP ${res.status})`);
        return;
      }
    } catch {
      // not ready yet
    }
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`⏳ Waiting for ${label}... (${elapsed}s)`);
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`❌ ${label} did not become ready within ${MAX_WAIT_MS / 1000}s`);
}

async function getSharedAuthToken(): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'amr@triangleblack.com',
        password: 'admin123',
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      // Try form-based login as fallback
      const form = new URLSearchParams();
      form.append('username', 'amr@triangleblack.com');
      form.append('password', 'admin123');
      const res2 = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        signal: AbortSignal.timeout(10000),
      });
      if (!res2.ok) throw new Error(`Auth failed: ${res2.status}`);
      const data2 = await res2.json();
      return data2.access_token;
    }

    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.warn('⚠️  Auth token fetch failed — E2E tests will use unauthenticated mode');
    return '';
  }
}

export default async function globalSetup(config: FullConfig) {
  console.log('\n🚀 Triangle Black E2E Global Setup\n');

  // 1. Wait for backend
  await waitForUrl(`${BACKEND_URL}/api/v1/health/live`, 'Backend API');

  // 2. Wait for portal
  await waitForUrl(`${BASE_URL}/login`, 'Next.js Portal');

  // 3. Get shared auth token
  const token = await getSharedAuthToken();
  if (token) {
    process.env.E2E_TOKEN = token;
    console.log('✅ Shared auth token acquired');
  }

  console.log('\n✅ Global setup complete — starting tests\n');
}
