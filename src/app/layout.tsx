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
      <body
        className={`${jost.variable} antialiased bg-background text-black px-12`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
