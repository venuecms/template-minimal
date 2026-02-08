import { SearchIcon, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { Input } from "../ui/Input";
import { useSearchQuery } from "./provider";

export const SearchInput = ({ className }: { className?: string }) => {
  const { query, setQuery, reset, isActive, setActive } = useSearchQuery();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isActive]);

  return (
    <div
      className={cn(
        "flex h-6 justify-end",
        className,
        isActive && "absolute left-0 w-full gap-4",
      )}
    >
      <SearchIcon className="size-6" onClick={() => setActive(true)} />
      <div
        className={cn(
          "grid grid-cols-[1fr,auto] items-center gap-4 overflow-hidden transition-[width] duration-300 ease-in-out",
          isActive ? "w-full" : "w-0",
        )}
      >
        <label className="sr-only" htmlFor="nav-search">
          Search
        </label>
        <Input
          id="nav-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputRef}
        />
        <X onClick={reset} className="size-5" />
      </div>
    </div>
  );
};
