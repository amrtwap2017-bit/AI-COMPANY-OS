import { chromium, FullConfig } from "@playwright/test";

const API_URL = "http://localhost:8030";
const ADMIN_EMAIL = "amr@triangleblack.com";
const ADMIN_PASSWORD = "admin123";

async function globalSetup(_config: FullConfig) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${ADMIN_EMAIL}&password=${ADMIN_PASSWORD}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Global setup login failed: ${JSON.stringify(data)}`);
  process.env.E2E_TOKEN = data.access_token;
}

export default globalSetup;
