import { Params } from "@/types";
import { getSite } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Suspense } from "react";

import { QueryProvider } from "@/lib/providers/QueryProvider";
import { VenueProvider } from "@/lib/utils/VenueProvider";

import { AccountProvider } from "@/components/Account/provider";
import { NavigationProgress } from "@/components/NavigationProgress";
import { SearchProvider } from "@/components/Search/provider";
import { SearchResultsLayout } from "@/components/SearchResults";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemedBody } from "@/components/ThemedBody";
import { setupSSR } from "@/components/utils";

import "../../globals.css";
import Loading from "./loading";

const LayoutContent = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) => {
  const { locale, siteKey } = await params;
  await setupSSR({ params });
  const messages = await getMessages();

  // Sites that do not offer accounts should not pay for the session lookup on
  // every page view. `getSite` is the same cached call `SiteHeader` makes.
  const { data: site } = await getSite();
  const showLogin = !!site?.settings?.publicSite?.template?.config?.showLogin;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryProvider>
        <VenueProvider siteKey={siteKey}>
          <SearchProvider>
            <AccountProvider siteKey={siteKey} enabled={showLogin}>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <Suspense fallback={<Loading />}>
                <ThemedBody>
                  <SiteHeader />
                  <SearchResultsLayout>{children}</SearchResultsLayout>
                </ThemedBody>
              </Suspense>
            </AccountProvider>
          </SearchProvider>
        </VenueProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
};

const RootLayout = ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Params>;
}>) => {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-base m-auto bg-background px-6 font-regular text-primary antialiased sm:max-w-[96rem] sm:px-12">
        <Suspense fallback={<Loading />}>
          <LayoutContent params={params}>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
