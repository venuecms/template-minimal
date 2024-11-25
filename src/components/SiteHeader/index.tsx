import { getSite } from "@venuecms/sdk";
import { SiteLogo, Nav } from "@/components";
import { notFound } from "next/navigation";

export const SiteHeader = async () => {
  const { data: site } = await getSite();

  if (!site?.records) {
    return notFound();
  }

  return (
    <header className="sticky top-0 h-20 flex items-center gap-40 text-nav">
      <SiteLogo site={site.records} className="w-[32rem]" />
      <Nav />
    </header>
  );
};
