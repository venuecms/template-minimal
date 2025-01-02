import { getSite } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { Nav } from "../Nav";
import { SiteLogo } from "../SiteLogo";
import { SiteHeaderDesktop } from "./SiteHeaderDesktop";
import { SiteHeaderMobile } from "./SiteHeaderMobile";

export const SiteHeader = async () => {
  const { data: site } = await getSite();

  if (!site) {
    return notFound();
  }

  const logo = <SiteLogo site={site} />;
  const nav = <Nav logo={logo} site={site} />;

  return (
    <>
      <SiteHeaderDesktop logo={logo} nav={nav} />
      <SiteHeaderMobile logo={logo} nav={nav} />
    </>
  );
};
