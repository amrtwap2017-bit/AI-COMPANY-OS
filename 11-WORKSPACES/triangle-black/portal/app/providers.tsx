"use client"; // @ts-nocheck
/**
 * Providers - Client component that wraps app with QueryClientProvider
 * This is the SINGLE place QueryClient is created.
 */
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create QueryClient OUTSIDE component to avoid recreation
let clientQueryClientSingleton: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always new instance
    return new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60000, retry: 1, refetchOnWindowFocus: false },
      },
    });
  }
  // Browser: singleton
  if (!clientQueryClientSingleton) {
    clientQueryClientSingleton = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60000, retry: 1, refetchOnWindowFocus: false },
      },
    });
  }
  return clientQueryClientSingleton;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default Providers;
