import { getRequestConfig } from "next-intl/server";

import { isSupportedLocale } from "./config";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !isSupportedLocale(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./dictionaries/${locale}.json`)).default,
  };
});
