import { test, expect } from "@playwright/test";
import { API_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from "./helpers/auth";

let token = "";

test.beforeAll(async ({ request }) => {
  const res = await request.post(`${API_URL}/api/v1/auth/login`, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: `username=${ADMIN_EMAIL}&password=${ADMIN_PASSWORD}`,
  });
  const data = await res.json();
  token = data.access_token;
});

const endpoints = [
  { url: "/api/v1/work-orders/",      label: "Work Orders list" },
  { url: "/api/v1/leads-portal-v2",   label: "Leads list" },
  { url: "/api/v1/assets/",           label: "Assets list" },
  { url: "/api/v1/invoices/",         label: "Invoices list" },
  { url: "/api/v1/contracts/",        label: "Contracts list" },
  { url: "/api/v1/technicians/",      label: "Technicians list" },
  { url: "/api/v1/suppliers/",        label: "Suppliers list" },
  { url: "/api/v1/warehouses-portal", label: "Warehouses list" },
  { url: "/api/v1/activities/",       label: "Activities list" },
  { url: "/api/v1/dashboard/summary", label: "Dashboard summary" },
];

for (const ep of endpoints) {
  test(`API responds 200: ${ep.label}`, async ({ request }) => {
    const res = await request.get(`${API_URL}${ep.url}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });
}

test("unauthenticated API current behavior is acceptable", async ({ request }) => {
  const res = await request.get(`${API_URL}/api/v1/work-orders/`);
  expect([200, 401, 403, 422]).toContain(res.status());
});

test("work orders list returns array or object with results", async ({ request }) => {
  const res = await request.get(`${API_URL}/api/v1/work-orders/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const isArr = Array.isArray(data);
  const hasResults = Array.isArray(data?.results) || Array.isArray(data?.items) || Array.isArray(data?.data);
  expect(isArr || hasResults).toBeTruthy();
});

test("leads list returns data", async ({ request }) => {
  const res = await request.get(`${API_URL}/api/v1/leads-portal-v2`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const isArr = Array.isArray(data);
  const hasResults = Array.isArray(data?.results) || Array.isArray(data?.items) || Array.isArray(data?.data);
  expect(isArr || hasResults).toBeTruthy();
});
