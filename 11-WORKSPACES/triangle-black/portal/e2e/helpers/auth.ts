import { Page } from '@playwright/test';

export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8030';

export function getSharedToken(): string {
  return process.env.E2E_TOKEN || '';
}

export async function injectAuth(page: Page): Promise<void> {
  const token = getSharedToken();

  try {
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await page.waitForTimeout(500);
  } catch {
    try {
      await page.goto(BASE_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
    } catch {
      // Portal may still be starting — continue with token injection only
    }
  }

  if (token) {
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
  await page.goto(`${BASE_URL}/login`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  const emailSel = 'input[type="email"], input[name="email"], input[name="username"]';
  const pwSel = 'input[type="password"], input[name="password"]';
  await page.fill(emailSel, 'amr@triangleblack.com');
  await page.fill(pwSel, 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|workspace|operations/, { timeout: 30000 });
}
