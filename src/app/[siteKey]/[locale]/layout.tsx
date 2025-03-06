import { Params } from "@/types";
import { getSite } from "@venuecms/sdk";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import {
  Abel,
  EB_Garamond,
  Gothic_A1,
  Hanken_Grotesk,
  IBM_Plex_Mono,
  Jost,
  Karla,
  Outfit,
  Schibsted_Grotesk,
  Young_Serif,
  Courier_Prime,
  Kosugi_Maru,
  Special_Elite,
  Inter,
  Oswald,
  Work_Sans,
} from "next/font/google";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/SiteHeader";
import { setupSSR } from "@/components/utils";

import "../../globals.css";

export const runtime = "edge";

const WorkSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const KosugiMaru = Kosugi_Maru({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const SpecialElite = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["500", "800"],
  display: "swap",
});

const abel = Abel({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

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
  Work_Sans: WorkSans.style,
  oswald: oswald.style,
  Courier: courierPrime.style,
  Kosugi_Maru: KosugiMaru.style,
  Special_Elite: SpecialElite.style,
  Inter: inter.style,
  Karla: karla.style,
  EB_Garamond: ebGaramond.style,
  abel: abel.style,
  outfit: outfit.style,
  Schibsted_Grotesk: SchibstedGrotesk.style,
  Hanken_Grotesk: HankenGrotesk.style,
  Young_Serif: YoungSerif.style,
  Gothic_A1: GothicA1.style,
  jost: jost.style,
  IBM_Plex_Mono: IBMPlexMono.style,
  default: SchibstedGrotesk.style,
  custom: { fontFamily: "custom" },
};

const RootLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Params>;
}>) => {
  const { locale } = await params;
  await setupSSR({ params });

  const { data: site } = await getSite();
  if (!site) {
    notFound();
  }

  const t = await getTranslations("events");

  const templateSettings = (site?.settings?.publicSite?.template?.config ??
    {}) as { themeId: string; fontName: string }; // These ar defined by users so the type is unkown so we define the type here

  const { themeId = "default", fontName = "default" } = templateSettings;

  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {fontName === "custom" && (
          <link
            rel="alternate"
            type="application/rss+xml"
            href={`/${locale}/rss.xml`}
            title={t("events")}
          />
        )}
        <link
          rel="preload"
          href={`/media/sites/${site.id}/fonts/custom.woff2`}
          as="font"
          type="font/woff2"
        />

        {fontName === "custom" && (
          <style>
            {`
              @font-face {
                font-family: 'custom';
                src: url('/media/sites/${site.id}/fonts/custom.woff2') format('woff2');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
            }
              .
            `}
          </style>
        )}
      </head>

      <body
        className="font-base m-auto bg-background px-6 font-regular text-primary antialiased sm:max-w-[96rem] sm:px-12"
        style={
          ThemeFonts[fontName as keyof typeof ThemeFonts] ?? ThemeFonts.default
        }
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
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
