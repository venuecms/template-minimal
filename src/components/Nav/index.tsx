import { getPages } from "@venuecms/sdk";
import { SearchIcon } from "lucide-react";

export const Nav = async () => {
  const { data: pages } = await getPages();

  return (
    <nav className="flex w-full items-center justify-between">
      <ol className="flex items-center gap-8 text-text-nav text-sm font-light">
        <li>upcoming events</li>
        <li>archive</li>
        <li>info</li>
        <li>records & books</li>
      </ol>
      <div className="gap-8">
        <SearchIcon className="w-6 h-6" />
      </div>
    </nav>
  );
};
