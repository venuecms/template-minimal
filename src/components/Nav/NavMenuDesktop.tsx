"use client";

import { ReactNode } from "react";

import { SearchInput } from "../Search/SearchInput";
import { useSearchQuery } from "../Search/provider";

export const NavMenuDesktop = ({
  showSearch,
  children,
}: {
  showSearch: boolean;
  children: ReactNode;
}) => {
  const { isActive } = useSearchQuery();

  return (
    <nav className="relative hidden w-full items-center justify-between sm:flex">
      {!isActive ? (
        <ol className="mr-8 flex items-center gap-8 text-sm text-nav">
          {children}
        </ol>
      ) : null}
      {showSearch ? <SearchInput /> : null}
    </nav>
  );
};
