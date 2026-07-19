export const HUB_BASE =
  process.env.NEXT_PUBLIC_HUB_API_BASE_URL || "http://127.0.0.1:8010";

export async function hubGet<T>(path: string, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${HUB_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback as T;
    return (await res.json()) as T;
  } catch {
    return fallback as T;
  }
}

export async function hubPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${HUB_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Hub POST ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}
