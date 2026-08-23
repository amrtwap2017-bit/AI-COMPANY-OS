import { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8030';

export function getSharedToken(): string {
  return process.env.E2E_TOKEN || '';
}

export async function injectAuth(page: Page): Promise<void> {
  const token = getSharedToken();

  // Always navigate to login page first (ensures cookies domain is set)
  try {
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(500);
  } catch {
    // If login page times out, try root
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  if (token) {
    // Inject token into all storage mechanisms
    await page.context().addCookies([
      {
        name: 'tb_access_token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.evaluate((t: string) => {
      try { localStorage.setItem('tb_access_token', t); } catch {}
      try { sessionStorage.setItem('tb_access_token', t); } catch {}
      try { localStorage.setItem('auth_token', t); } catch {}
    }, token);
  }

  await page.waitForTimeout(300);
}

export async function loginViaUI(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.fill('input[type="email"], input[name="email"], input[name="username"]', 'amr@triangleblack.com');
  await page.fill('input[type="password"], input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|workspace|operations/, { timeout: 30000 });
}
