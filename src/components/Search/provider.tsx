"use client";

import { SearchSiteResponse, searchSite } from "@venuecms/sdk";
import { PropsWithChildren, useEffect, useState } from "react";
import { createContext, useContext, useReducer } from "react";
import { useDebounce } from "use-debounce";

type StateContext = {
  query?: string;
  isPending: boolean;
  results: SearchSiteResponse;
};

export const emptyContext: StateContext = {
  isPending: false,
  results: {
    events: [],
    profiles: [],
    pages: [],
    products: [],
  },
};

const StateContext = createContext(emptyContext);
const DispatchContext = createContext({});

export const SearchProvider = ({ children }: PropsWithChildren) => {
  // TODO: not necessary for this anymore. switch to a simpler implementation
  const [state, dispatch] = useReducer((state, action) => {
    return { ...state, ...action.payload };
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export const useSearchState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    console.log("no context yet");
  }

  return context;
};

export const useDispatch = () => {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error("useDispatch must be used within a DispatchProvider");
  }

  const actions = {
    setIsPending: (isPending: boolean) =>
      //@ts-expect-error
      context({
        payload: { isPending },
      }),
    setQuery: (query: string) =>
      //@ts-expect-error
      context({
        payload: { query },
      }),
    setResults: (results: StateContext["results"]) =>
      //@ts-expect-error
      context({
        payload: { results },
      }),
  };

  return actions;
};

export default StateContext;

export const useSearch = () => {
  const { query, results, isPending } = useSearchState();
  const { setResults, setQuery, setIsPending } = useDispatch();
  const [debouncedQuery] = useDebounce<string | undefined>(query, 500);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(emptyContext.results);
      return;
    }

    setIsPending(true);
    const search = async () => {
      setResults(emptyContext.results);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { data } = await searchSite({
        query: debouncedQuery,
      });

      setIsPending(false);

      setResults(data ?? emptyContext.results);
    };

    search();
  }, [debouncedQuery]);

  return { setQuery, query, results, isPending };
};
