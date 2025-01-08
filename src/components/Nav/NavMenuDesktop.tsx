import { SearchIcon } from "lucide-react";
import { ReactNode } from "react";

export const NavMenuDesktop = async ({ children }: { children: ReactNode }) => {
  return (
    <nav className="hidden w-full items-center justify-between sm:flex">
      <ol className="flex items-center gap-8 text-sm text-nav">{children}</ol>
      <div className="gap-8">{/* <SearchIcon className="size-6" /> */}</div>
    </nav>
  );
};
