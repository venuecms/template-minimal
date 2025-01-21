import { ReactNode } from "react";

export const SiteHeaderMobile = async ({
  logo,
  nav,
}: {
  logo: ReactNode;
  nav: ReactNode;
}) => {
  return (
    <header className="top-0 flex w-full items-center justify-between py-6 text-nav sm:hidden">
      {logo}
      {nav}
    </header>
  );
};
