import { Jost } from "next/font/google";
import "./globals.css";
import { getGenerateMetadata } from "@/lib";
import { getSite } from "@venuecms/sdk";
import { Nav } from "@/components";
import { SiteLogo } from "@/components/SiteLogo";

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
});

// export const generateMetadata = async () => {
// const site = await getSite({ pathParams: { siteKey: "fylkingen"} });

// const title = site?.records.name;

// return {
// title,
// };
// };

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`${jost.variable} antialiased bg-background text-black`}>
        <header className="sticky top-0 z-50 px-12 h-20 flex items-center justify-between">
          <SiteLogo>Trade School</SiteLogo>
          <Nav />
        </header>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
