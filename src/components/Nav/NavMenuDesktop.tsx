"use client";

import { ReactNode, useState } from "react";

import { SearchInput } from "../Search/SearchInput";

export const NavMenuDesktop = ({ children }: { children: ReactNode }) => {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <nav className="relative hidden w-full items-center justify-between sm:flex">
      {!searchActive ? (
        <ol className="flex items-center gap-8 text-sm text-nav">{children}</ol>
      ) : null}
      <SearchInput active={searchActive} setActive={setSearchActive} />
    </nav>
  );
};
