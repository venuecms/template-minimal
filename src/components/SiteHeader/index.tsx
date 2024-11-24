import { getSite } from "@venuecms/sdk";
import { SiteLogo, Nav } from "@/components";

export const SiteHeader = async () => {
  const { data: site } = await getSite();

  const { name } = site?.records ?? {};

  return (
    <header className="sticky top-0 h-20 flex items-center gap-32 text-nav">
      <SiteLogo className="min-w-[32rem]">{name}</SiteLogo>
      <Nav />
    </header>
  );
};
