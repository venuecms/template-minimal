import { ReactNode } from "react";

export const SiteHeaderMobile = async ({
  logo,
  nav,
}: {
  logo: ReactNode;
  nav: ReactNode;
}) => {
  return (
    <header className="top-0 flex w-full items-center justify-between gap-4 px-4 py-4 text-nav">
      {logo}
      {nav}
    </header>
  );
};
