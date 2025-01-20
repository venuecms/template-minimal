import { Params } from "@/types";
import { getSite, setConfig } from "@venuecms/sdk";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { IBM_Plex_Mono, Jost, Gothic_A1 } from "next/font/google";
import { notFound } from "next/navigation";

import { routing } from "@/lib/i18n";

import { SiteHeader } from "@/components/SiteHeader";

import "../../globals.css";

export const runtime = "edge";

const GothicA1 = Gothic_A1({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
});

const IBMPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "500"],
  display: "swap",
});

const ThemeFonts = {
  gothic: GothicA1.style,
  jost: jost.style,
  default: IBMPlexMono.style,
};

const RootLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Params>;
}>) => {
  const { locale, siteKey } = await params;
  setConfig({
    siteKey,
    options: { next: { revalidate: 60 } },
  });

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const { data: site } = await getSite();
  const templateSettings = site?.settings?.publicSite?.template?.config ?? {};

  const { themeId = "default", fontName = "default" } = templateSettings;
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="alternate"
          type="application/rss+xml"
          href={`/${locale}/rss.xml`}
          title="Events"
        />
      </head>

      <body
        className="font-base m-auto bg-background px-6 font-regular text-primary antialiased sm:max-w-[96rem] sm:px-12"
        style={
          ThemeFonts[fontName as keyof typeof ThemeFonts] ?? ThemeFonts.default
        }
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" forcedTheme={themeId}>
            <SiteHeader />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
