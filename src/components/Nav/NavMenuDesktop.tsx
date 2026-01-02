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
        <ul className="mr-8 flex-row items-center gap-8">
          {children}
        </ul>
      ) : null}
     {/*</nav> {showSearch ? <SearchInput /> : null}</div>*/}
    </nav>
  );
};
