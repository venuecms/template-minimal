// Collects some common SSR setup functions that should be set on all pages
import { Params } from "@/types";
import { setConfig } from "@venuecms/sdk-next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { isSupportedLocale } from "@/lib/i18n";

export const setupSSR = async ({ params }: { params: Promise<Params> }) => {
  const { siteKey, locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  // Set VenueCMS config. No fetch options: the SDK pins `revalidate: 60` on
  // its own fetches, and since 2.0 the lifetime that actually governs a render
  // is the `cacheLife` on its "use cache" reads, not anything passed here.
  setConfig({ siteKey });

  // Set server-side next-intl locale
  setRequestLocale(locale);
};
