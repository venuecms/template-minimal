"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { LocalizedContent, MediaItem } from "@venuecms/sdk";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDebounce } from "use-debounce";

export type SearchAllType = "event" | "page" | "profile" | "product";

export type SearchAllRecord = {
  id: string;
  type: SearchAllType;
  slug: string;
  siteId: string;
  image?: MediaItem | null;
  localizedContent: Array<LocalizedContent>;
  similarity: number;
};

export type SearchAllResponse = {
  records: Array<SearchAllRecord>;
};

interface SearchQueryContextType {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  reset: () => void;
  isActive: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
  siteKey: string;
}

const SearchQueryContext = createContext<SearchQueryContextType | undefined>(
  undefined,
);

export const emptyResults: SearchAllResponse = {
  records: [],
};

export const SearchProvider = ({
  siteKey,
  children,
}: PropsWithChildren<{ siteKey: string }>) => {
  const [query, setQuery] = useState<string>("");
  const [isActive, setActive] = useState<boolean>(false);

  const reset = () => {
    setActive(false);
    setQuery("");
  };

  const handleEsc = useCallback((event: KeyboardEvent) => {
    if (event?.key === "Escape") {
      reset();
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      document.addEventListener("keydown", handleEsc);
    } else {
      document.removeEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isActive]);

  const contextValue = useMemo(
    () => ({ query, setQuery, isActive, setActive, reset, siteKey }),
    [query, isActive, siteKey],
  );

  return (
    <SearchQueryContext.Provider value={contextValue}>
      {children}
    </SearchQueryContext.Provider>
  );
};

export const useSearchQuery = (): SearchQueryContextType => {
  const context = useContext(SearchQueryContext);
  if (context === undefined) {
    throw new Error("useSearchQuery must be used within a SearchProvider");
  }
  return context;
};

const fetchSearchAll = async (
  siteKey: string,
  query: string,
): Promise<SearchAllResponse> => {
  const url = `/api/v2/${encodeURIComponent(siteKey)}/public/search/all?query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }
  return (await response.json()) as SearchAllResponse;
};

export const useSearchResults = (
  debounceMs: number = 500,
  minQueryLength: number = 2,
) => {
  const { query, siteKey } = useSearchQuery();
  const [debouncedQuery] = useDebounce(query, debounceMs);

  const isQueryEnabled = debouncedQuery.trim().length >= minQueryLength;

  const {
    data: results,
    isFetching,
    isError,
    error,
  } = useSuspenseQuery<SearchAllResponse, Error>({
    queryKey: ["siteSearchAll", siteKey, debouncedQuery],
    queryFn: async (): Promise<SearchAllResponse> => {
      if (!isQueryEnabled) {
        return emptyResults;
      }
      return fetchSearchAll(siteKey, debouncedQuery);
    },
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 15,
  });

  return {
    debouncedQuery,
    results: results as SearchAllResponse,
    isFetching,
    isError,
    error,
    isQueryEnabled,
  };
};

export default SearchQueryContext;
