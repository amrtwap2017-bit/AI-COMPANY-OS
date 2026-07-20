// @ts-nocheck
// React Query global configuration
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 30_000,       // 30 seconds
      gcTime:    5 * 60_000,   // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Global error handler
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "observerResultsUpdated") {
    const query = event.query;
    if (query.state.status === "error") {
      const error = query.state.error as any;
      if (error?.status === 401) {
        // Silent — handled by individual components
        return;
      }
    }
  }
});
