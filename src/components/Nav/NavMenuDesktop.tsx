"use client";

import { ReactNode } from "react";

import { AccountButton } from "../Account/AccountButton";
import { SearchInput } from "../Search/SearchInput";
import { useSearchQuery } from "../Search/provider";

export const NavMenuDesktop = ({
  showSearch,
  showLogin,
  children,
}: {
  showSearch: boolean;
  showLogin: boolean;
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
      <div className="flex items-center gap-6">
        {showSearch ? <SearchInput /> : null}
        {showLogin && !isActive ? <AccountButton /> : null}
      </div>
    </nav>
  );
};
