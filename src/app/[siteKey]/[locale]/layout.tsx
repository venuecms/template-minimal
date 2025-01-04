import { Params } from "@/types";
import { getSite, setConfig } from "@venuecms/sdk";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { IBM_Plex_Mono, Jost } from "next/font/google";
import { notFound } from "next/navigation";

import { routing } from "@/lib/i18n";

import { SiteHeader } from "@/components/SiteHeader";

import "../../globals.css";

export const runtime = "edge";

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});
const IBMPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "500"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

// const THEME = "darkGold";
const THEME: string | undefined = undefined;

// TODO: generate metadata
export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}) => {
  const { siteKey } = await params;
  setConfig({ siteKey, options: { cache: "force-cache" } });

  const { data: site } = await getSite();

  const { name } = site ?? {};

  return {
    title: name,
  };
};

// export const generateStaticParams = async () => {
// const { data: site, error } = await getSite();

// if (error) {
// notFound();
// }
// // @ts-ignore
// const supportedLocales = site.settings.locale.supported as Array<string>;

// return supportedLocales.map((locale) => ({ locale }));
// };

const RootLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Params>;
}>) => {
  const { locale, siteKey } = await params;
  setConfig({ siteKey });

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${jost.variable} ${IBMPlexMono.variable} antialiased bg-background text-primary px-6 sm:px-12 font-base sm:max-w-[96rem] m-auto font-regular`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" forcedTheme={THEME}>
            <SiteHeader />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
