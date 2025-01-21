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
    <header className="top-0 hidden min-h-20 items-center text-nav sm:flex lg:gap-40">
      <TwoColumnLayout className="py-0 pt-7 md:py-7 lg:items-center lg:py-7">
        <ColumnLeft>{logo}</ColumnLeft>
        <ColumnRight className="items-center">{nav}</ColumnRight>
      </TwoColumnLayout>
    </header>
  );
};
