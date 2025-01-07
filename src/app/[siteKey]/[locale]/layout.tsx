import { Params } from "@/types";
import { setConfig } from "@venuecms/sdk";
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
});

const IBMPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "500"],
  display: "swap",
});

const THEME: keyof typeof ThemeFonts | undefined = undefined;
const ThemeFonts = {
  hojden: jost.style,
  default: IBMPlexMono.style,
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
  setConfig({
    siteKey,
    options: { next: { revalidate: 60 } },
  });

  const fontVar = (THEME && ThemeFonts[THEME]) ?? ThemeFonts.default;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>

      <body
        className={`antialiased bg-background text-primary px-6 sm:px-12 font-base sm:max-w-[96rem] m-auto font-regular`}
        style={fontVar}
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
