const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8030/api/v1";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("tb_token") || "";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tb_token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
