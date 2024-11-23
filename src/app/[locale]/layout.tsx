import { Jost, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { getSite, initClient } from "@venuecms/sdk";
import { routing } from "@/lib/i18n";
import { notFound } from "next/navigation";

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
initClient({
  siteKey: process.env.VENUE_SITE_KEY as string,
  apiKey: process.env.VENUE_API_KEY as string,
});

// TODO: generate metadata
export const generateMetadata = async () => {
  const { data: site } = await getSite({
    path: { siteKey: "fylkingen" },
  });

  const { name, image } = site?.records ?? {};

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
    <html lang="en">
      <body
        className={`${jost.variable} ${IBMPlexMono.variable} antialiased bg-background text-black px-12 font-base`}
      >
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
