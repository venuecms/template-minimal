import { ReactNode } from "react";

export const SiteHeaderMobile = async ({
  logo,
  nav,
}: {
  logo: ReactNode;
  nav: ReactNode;
}) => {
  return (
    <header className="sm:hidden flex w-full justify-between top-0 items-center text-nav py-6">
      {logo}
      {nav}
    </header>
  );
};
