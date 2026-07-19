import { NextRequest, NextResponse } from "next/server";

const HUB = process.env.NEXT_PUBLIC_HUB_API_BASE_URL || "http://127.0.0.1:8010";

export async function POST(req: NextRequest) {
  const { task_id, workspace_id, actor_id } = await req.json();
  const res = await fetch(`${HUB}/tasks/${task_id}/execute_code`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ workspace_id, actor_id: actor_id || "portal" }),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data);
}
