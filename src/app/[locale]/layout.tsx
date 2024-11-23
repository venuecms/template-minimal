import { Jost } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { initClient } from "@venuecms/sdk";
import { routing } from "@/lib/i18n";
import { notFound } from "next/navigation";

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});

// TODO: generate metadata

// Initialize the Venue SDK with your API key and siteKey
initClient({
  siteKey: process.env.VENUE_SITE_KEY as string,
  apiKey: process.env.VENUE_API_KEY as string,
});

const RootLayout = async ({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) => {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang="en">
      <body
        className={`${jost.variable} antialiased bg-background text-black px-12`}
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
