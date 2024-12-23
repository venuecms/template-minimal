import { getSite } from "@venuecms/sdk";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { IBM_Plex_Mono, Jost } from "next/font/google";
import { notFound } from "next/navigation";

import { routing } from "@/lib/i18n";

import { SiteHeader } from "@/components/SiteHeader";

import "../globals.css";

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});
const IBMPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "300",
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

// Initialize the Venue SDK with your API key and siteKey
console.log(
  "INIT CLIENT",
  process.env.VENUE_SITE_KEY,
  process.env.VENUE_API_KEY,
);

// TODO: generate metadata
export const generateMetadata = async () => {
  const { data: site } = await getSite();

  const { name } = site ?? {};

  return {
    title: name,
  };
};

const RootLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) => {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jost.variable} ${IBMPlexMono.variable} antialiased bg-background text-primary px-6 sm:px-12 font-base`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" forcedTheme="darkGold">
            <SiteHeader />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
