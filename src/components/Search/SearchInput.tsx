"use client";

import { SearchIcon, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Input } from "../ui/Input";
import { useSearch } from "./provider";

export const SearchInput = ({ className }: { className?: string }) => {
  const [searchActive, setSearchActive] = useState(false);
  const { query, setQuery } = useSearch();

  const reset = () => {
    setSearchActive(false);
  };

  return (
    <div
      className={cn(
        "flex h-6 justify-end",
        className,
        searchActive && "w-full gap-8",
      )}
    >
      <SearchIcon className="size-6" onClick={() => setSearchActive(true)} />
      <div
        className={cn(
          "flex size-6 gap-8 overflow-hidden transition-[width] duration-300 ease-in-out",
          searchActive ? "w-full" : "w-0",
        )}
      >
        <Input value={query} onChange={setQuery} />
        <X onClick={reset} className="size-5" />
      </div>
    </div>
  );
};
