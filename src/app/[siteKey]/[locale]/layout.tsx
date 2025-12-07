import { Params } from "@/types";
import { listSiteDomains } from "@venuecms/sdk";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Suspense } from "react";

import { i18nConfig } from "@/lib/i18n/config";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { VenueProvider } from "@/lib/utils/VenueProvider";

import { NavigationProgress } from "@/components/NavigationProgress";
import { SearchProvider } from "@/components/Search/provider";
import { SearchResultsLayout } from "@/components/SearchResults";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemedBody } from "@/components/ThemedBody";
import { setupSSR } from "@/components/utils";

import "../../globals.css";
import Loading from "./loading";

export const generateStaticParams = async () => {
  const { data } = await listSiteDomains();
  const siteKeys = data?.records?.map((record) => record.siteKey) ?? [];

  // Generate params for each siteKey + locale combination
  return siteKeys.flatMap((siteKey) =>
    i18nConfig.locales.map((locale) => ({
      siteKey,
      locale,
    })),
  );
};

// Allow dynamic params for sites not in generateStaticParams
export const dynamicParams = true;

const RootLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Params>;
}>) => {
  const { locale, siteKey } = await params;
  await setupSSR({ params });

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>

      <body className="font-base m-auto bg-background px-6 font-regular text-primary antialiased sm:max-w-[96rem] sm:px-12">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <VenueProvider siteKey={siteKey}>
              <SearchProvider>
                <Suspense fallback={null}>
                  <NavigationProgress />
                </Suspense>
                <Suspense fallback={<Loading />}>
                  <ThemedBody>
                    <SiteHeader />
                    <SearchResultsLayout>{children}</SearchResultsLayout>
                  </ThemedBody>
                </Suspense>
              </SearchProvider>
            </VenueProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
