import { SiteLogo } from "../SiteLogo";
import { Nav } from "../Nav";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-50 h-20 flex items-center gap-32">
      <SiteLogo className="min-w-[32rem]">Trade School</SiteLogo>
      <Nav />
    </header>
  );
};
