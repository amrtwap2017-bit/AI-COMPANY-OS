import { NextResponse } from "next/server";

export async function GET() {
  const API_URL = process.env.API_URL || "http://localhost:8030";
  let api_reachable = false;
  try {
    const r = await fetch(API_URL + "/health", { cache: "no-store" });
    api_reachable = r.ok;
  } catch { api_reachable = false; }
  return NextResponse.json({
    status:        "ok",
    version:       "3.1.0",
    env:           process.env.NODE_ENV,
    timestamp:     new Date().toISOString(),
    api_reachable: api_reachable,
  });
}
