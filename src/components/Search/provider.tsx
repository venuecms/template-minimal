"use client";

import { searchSite } from "@venuecms/sdk";
import { PropsWithChildren, useEffect, useState } from "react";
import { createContext, useContext, useReducer } from "react";
import { useDebounce } from "use-debounce";

type StateContext = {
  results: {
    events: any[];
    profiles: any[];
    pages: any[];
    products: any[];
  };
};

export const emptyContext: StateContext = {
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
    setResults: (results: Partial<StateContext>) =>
      //@ts-ignore
      context({
        payload: results,
      }),
  };

  return actions;
};

export default StateContext;

export const useSearch = () => {
  const [isPending, setIsPending] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce<string>(query, 500);
  const { results } = useSearchState();
  const { setResults } = useDispatch();

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(emptyContext);
      return;
    }

    const search = async () => {
      setIsPending(true);
      setResults(emptyContext);

      const { data } = await searchSite({
        query: debouncedQuery,
      });

      setResults(data ? { results: data } : emptyContext);
    };

    search();
  }, [debouncedQuery]);

  return { setQuery, query, results, isPending };
};
