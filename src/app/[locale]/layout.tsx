import { Jost } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});

// TODO: generate metadata

// const messages = await getMessages();

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body
        className={`${jost.variable} antialiased bg-background text-black px-12`}
      >
        {/* <NextIntlClientProvider messages={messages}> */}
        <SiteHeader />
        {children}
        {/* </NextIntlClientProvider> */}
      </body>
    </html>
  );
};

export default RootLayout;
