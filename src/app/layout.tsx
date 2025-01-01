import { Params } from "@/types";
import { setConfig } from "@venuecms/sdk";

const RootLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) => {
  const { siteKey } = await params;
  setConfig({ siteKey });

  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
