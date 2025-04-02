import { ReactNode } from "react";

import { SearchInput } from "../Search/SearchInput";

export const NavMenuDesktop = async ({ children }: { children: ReactNode }) => {
  return (
    <nav className="relative hidden w-full items-center justify-between sm:flex">
      <ol className="flex items-center gap-8 text-sm text-nav">{children}</ol>
      <SearchInput />
    </nav>
  );
};
