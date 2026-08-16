// Triangle Black — Feature Flags Hook (Sprint-201)
// Reads feature flags from the backend API.
// Defaults to enabled=true for all flags when API is unavailable.
"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

export interface FeatureFlags {
  [feature: string]: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  ai_assistant:    true,
  analytics:       true,
  client_portal:   true,
  commercial:      true,
  maintenance:     true,
  operations:      true,
  projects:        true,
  supplier_portal: true,
  supply_chain:    true,
};

async function fetchFeatureFlags(): Promise<FeatureFlags> {
  if (typeof window === "undefined") return DEFAULT_FLAGS;
  try {
    const res = await authFetch("/api/v1/features/");
    if (!res.ok) return DEFAULT_FLAGS;
    const data = await res.json();
    return data?.flags || DEFAULT_FLAGS;
  } catch {
    return DEFAULT_FLAGS;
  }
}

export function useFeatureFlags(): {
  flags: FeatureFlags;
  isEnabled: (feature: string) => boolean;
  isLoading: boolean;
} {
  const { data: flags, isLoading } = useQuery<FeatureFlags>({
    queryKey: ["feature-flags"],
    queryFn:  fetchFeatureFlags,
    staleTime: 5 * 60 * 1000,   // 5 minutes — matches backend TTL
    gcTime:    10 * 60 * 1000,  // 10 minutes
    retry: 1,
  });

  const resolvedFlags = flags || DEFAULT_FLAGS;

  const isEnabled = (feature: string): boolean => {
    return resolvedFlags[feature] ?? true; // default true for unknown features
  };

  return { flags: resolvedFlags, isEnabled, isLoading };
}

// Convenience: use outside React components (sync, from cache or defaults)
export function isFeatureEnabledSync(
  flags: FeatureFlags,
  feature: string
): boolean {
  return flags[feature] ?? true;
}
