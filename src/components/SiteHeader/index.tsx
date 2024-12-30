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
    <header className="top-0 min-h-20 flex items-center lg:gap-40 text-nav">
      <TwoColumnLayout className="py-0 md:py-0 lg:items-center pt-7 md:pt-7 lg:pt-7">
        <ColumnLeft>
          <SiteLogo site={site} />
        </ColumnLeft>
        <ColumnRight className="items-center">
          <Nav />
        </ColumnRight>
      </TwoColumnLayout>
    </header>
  );
};
