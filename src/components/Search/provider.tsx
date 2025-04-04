"use client";

import { useQuery } from "@tanstack/react-query";
import { SearchSiteResponse, searchSite } from "@venuecms/sdk";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { useDebounce } from "use-debounce";

// Define the shape of the context value
interface SearchQueryContextType {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  reset: () => void;
  isActive: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
}

// Create the context with a default value (or throw error in hook if not provided)
const SearchQueryContext = createContext<SearchQueryContextType | undefined>(
  undefined,
);

// Define the structure for empty results, useful as initialData for useQuery
export const emptyResults: SearchSiteResponse = {
  events: [],
  profiles: [],
  pages: [],
  products: [],
};

/**
 * Provides the search query state (query string and setter) to its children.
 */
export const SearchProvider = ({ children }: PropsWithChildren) => {
  const [query, setQuery] = useState<string>("");
  const [isActive, setActive] = useState<boolean>(false);

  const reset = () => {
    setActive(false);
    setQuery("");
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ query, setQuery, isActive, setActive, reset }),
    [query, isActive],
  );

  return (
    <SearchQueryContext.Provider value={contextValue}>
      {children}
    </SearchQueryContext.Provider>
  );
};

/**
 * Hook to access the search query and its setter function.
 * Throws an error if used outside of a SearchProvider.
 */
export const useSearchQuery = (): SearchQueryContextType => {
  const context = useContext(SearchQueryContext);
  if (context === undefined) {
    throw new Error("useSearchQuery must be used within a SearchProvider");
  }
  return context;
};

/**
 * Hook to perform the search operation using React Query and Suspense.
 * Consumes the query from SearchQueryContext, handles debouncing,
 * fetching, caching, and provides results and status.
 * Designed to be used in components that will display search results.
 * @param debounceMs - Debounce delay in milliseconds (default: 500).
 * @param minQueryLength - Minimum query length to trigger search (default: 2).
 */
export const useSearchResults = (
  debounceMs: number = 500,
  minQueryLength: number = 2,
) => {
  // Get the raw query from the context
  const { query } = useSearchQuery();
  // Debounce the query value
  const [debouncedQuery] = useDebounce(query, debounceMs);

  // Determine if the debounced query is valid for searching
  const isQueryEnabled = debouncedQuery.trim().length >= minQueryLength;

  const {
    data: results, // Rename data to results for clarity
    // isLoading is less relevant with Suspense, but isFetching is useful
    isFetching,
    isError,
    error,
  } = useQuery<SearchSiteResponse, Error>({
    // Use the debounced query in the key
    queryKey: ["siteSearch", debouncedQuery],
    queryFn: async () => {
      // Double-check enablement inside queryFn for safety, though 'enabled' handles this
      if (!isQueryEnabled) {
        // Should not happen if 'enabled' is working correctly, but good practice
        return emptyResults;
      }
      console.log("Fetching search results for:", debouncedQuery); // Added log
      const { data, error } = await searchSite({ query: debouncedQuery });
      if (error) {
        // Throw error to let React Query handle the error state
        console.error("Search failed:", error); // Log error
        throw new Error(error.message || "Search failed");
      }
      return data ?? emptyResults;
    },
    // Only run the query if the debounced query is long enough
    enabled: isQueryEnabled,
    // Keep data fresh for a short time, cache longer
    staleTime: 1000 * 60 * 1, // 1 minute (adjusted staleTime slightly for clarity)
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
    // Enable Suspense mode
    suspense: true,
    // Use initialData to prevent Suspense triggering on mount with empty query
    // and provide a stable empty structure when disabled
    // Keep previous data while fetching new results for smoother UX
    keepPreviousData: true,
  });

  return {
    // The debounced query value used for the search
    debouncedQuery,
    // The search results, guaranteed to be defined due to initialData
    results: results,
    // Indicates background fetching (useful even with Suspense)
    isFetching,
    // Error status and object
    isError,
    error,
    // Expose whether the current debounced query is long enough to trigger a search
    isQueryEnabled,
  };
};

export default SearchQueryContext;
