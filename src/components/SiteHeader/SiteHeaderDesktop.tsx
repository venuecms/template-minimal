import { ReactNode } from "react";

import { ColumnLeft, ColumnRight, TwoColumnLayout } from "../layout";

export const SiteHeaderDesktop = async ({
  logo,
  nav,
}: {
  logo: ReactNode;
  nav: ReactNode;
}) => {
  return (
    <header className="hidden top-0 min-h-20 sm:flex items-center lg:gap-40 text-nav">
      <TwoColumnLayout className="py-0 md:py-7 lg:items-center lg:py-7 pt-7">
        <ColumnLeft>{logo}</ColumnLeft>
        <ColumnRight className="items-center">{nav}</ColumnRight>
      </TwoColumnLayout>
    </header>
  );
};
