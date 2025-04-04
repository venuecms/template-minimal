"use client";

import { ReactNode } from "react";

import { SearchInput } from "../Search/SearchInput";
import { useSearchQuery } from "../Search/provider";

export const NavMenuDesktop = ({ children }: { children: ReactNode }) => {
  const { isActive } = useSearchQuery();

  return (
    <nav className="relative hidden w-full items-center justify-between sm:flex">
      {!isActive ? (
        <ol className="flex items-center gap-8 text-sm text-nav">{children}</ol>
      ) : null}
      <SearchInput />
    </nav>
  );
};
