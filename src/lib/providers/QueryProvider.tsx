"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

/**
 * QueryProvider component sets up the React Query client and provider.
 * It ensures that a single QueryClient instance is created and reused across renders.
 * Includes React Query Devtools for debugging (only in development).
 */
export const QueryProvider = ({ children }: { children: ReactNode }) => {
  // useState ensures the QueryClient is only created once per component instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 1000 * 60 * 15, // 15 minutes
          },
        },
      }),
  );

  return (
    // Provide the client to the rest of the app
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Optional: Add React Query DevTools for easy debugging */}
      {/* These devtools are only included in development builds */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
