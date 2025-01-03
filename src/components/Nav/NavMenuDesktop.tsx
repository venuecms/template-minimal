import { SearchIcon } from "lucide-react";
import { ReactNode } from "react";

export const NavMenuDesktop = async ({ children }: { children: ReactNode }) => {
  return (
    <nav className="hidden sm:flex w-full items-center justify-between">
      <ol className="flex items-center gap-8 text-nav text-sm">{children}</ol>
      <div className="gap-8">{/* <SearchIcon className="size-6" /> */}</div>
    </nav>
  );
};
