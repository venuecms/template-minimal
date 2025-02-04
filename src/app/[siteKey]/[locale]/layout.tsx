import { Params } from "@/types";
import { getSite, setConfig } from "@venuecms/sdk";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Gothic_A1, IBM_Plex_Mono, Jost, Young_Serif, Hanken_Grotesk, Outfit, Schibsted_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";

import { routing } from "@/lib/i18n";

import { SiteHeader } from "@/components/SiteHeader";

import "../../globals.css";

export const runtime = "edge";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const SchibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const HankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["600", "800"],
  display: "swap",
});

const YoungSerif = Young_Serif({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

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
  outfit: outfit.style,
  Schibsted_Grotesk: SchibstedGrotesk.style,
  Hanken_Grotesk: HankenGrotesk.style,
  Young_Serif: YoungSerif.style,
  Gothic_A1: GothicA1.style,
  jost: jost.style,
  IBM_Plex_Mono: IBMPlexMono.style,
  default: SchibstedGrotesk.style,
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
