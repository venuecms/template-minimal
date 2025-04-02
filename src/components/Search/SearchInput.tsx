import { SearchIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "../ui/Input";
import { useSearch } from "./provider";

export const SearchInput = ({
  className,
  active = false,
  setActive,
}: {
  className?: string;
  active: boolean;
  setActive?: (setSearchActive: boolean) => void;
}) => {
  const { query, setQuery } = useSearch();

  const reset = () => {
    setActive?.(false);
  };

  return (
    <div
      className={cn(
        "flex h-6 justify-end",
        className,
        active && "absolute left-0 w-full gap-4",
      )}
    >
      <SearchIcon className="size-6" onClick={() => setActive?.(true)} />
      <div
        className={cn(
          "grid grid-cols-[1fr,auto] items-center gap-4 overflow-hidden transition-[width] duration-300 ease-in-out",
          active ? "w-full" : "w-0",
        )}
      >
        <Input value={query} onChange={setQuery} />
        <X onClick={reset} className="size-5" />
      </div>
    </div>
  );
};
