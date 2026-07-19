"use server";
import { redirect } from "next/navigation";

const HUB = process.env.NEXT_PUBLIC_HUB_API_BASE_URL || "http://127.0.0.1:8010";

export async function createAndOrchestrateTask(formData: FormData) {
  const wsId = formData.get("workspace_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const taskType = formData.get("type") as string;
  const priority = formData.get("priority") as string;
  const criteriaRaw = formData.get("acceptance_criteria") as string;
  const criteria = criteriaRaw.split("\n").map((s) => s.trim()).filter(Boolean);

  const taskRes = await fetch(`${HUB}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      workspace_id: wsId, title, description,
      type: taskType, priority,
      acceptance_criteria: criteria,
    }),
    cache: "no-store",
  });

  if (!taskRes.ok) throw new Error("Failed to create task");
  const task = await taskRes.json();
  const taskId = task.id;

  if (["epic","feature","story"].includes(taskType)) {
    await fetch(`${HUB}/tasks/${taskId}/orchestrate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspace_id: wsId }),
      cache: "no-store",
    });
  }

  redirect(`/tasks?ws=${wsId}`);
}
