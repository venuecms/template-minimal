import { getSite } from "@venuecms/sdk";
import { SiteLogo } from "../SiteLogo";
import { Nav } from "../Nav";

export const SiteHeader = async () => {
  const { data: site } = await getSite({
    path: { siteKey: "fylkingen" },
  });

  const { name, image } = site?.records ?? {};

  return (
    <header className="sticky top-0 z-50 h-20 flex items-center gap-32">
      <SiteLogo className="min-w-[32rem]">{name}</SiteLogo>
      <Nav />
    </header>
  );
};
