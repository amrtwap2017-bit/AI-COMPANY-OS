const BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001") + "/api/v1/ai";

export async function hubGet<T = unknown>(
  path: string,
  fallback?: T
): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 404 && fallback !== undefined) return fallback;
    if (!res.ok) {
      throw new Error(`hubGet ${path} → ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export async function hubPost<T = unknown>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`hubPost ${path} → ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
