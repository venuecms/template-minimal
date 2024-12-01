import { Nav, SiteLogo } from "@/components";
import { getSite } from "@venuecms/sdk";
import { notFound } from "next/navigation";

import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";

export const SiteHeader = async () => {
  const { data: site } = await getSite();

  if (!site) {
    return notFound();
  }

  return (
    <header className="top-0 h-20 flex items-center lg:gap-40 text-nav">
      <TwoColumnLayout className="py-0 md:py-0 lg:items-center">
        <ColumnLeft>
          <SiteLogo site={site} />
        </ColumnLeft>
        <ColumnRight>
          <Nav />
        </ColumnRight>
      </TwoColumnLayout>
    </header>
  );
};
