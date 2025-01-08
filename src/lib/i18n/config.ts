export const i18nConfig = {
  defaultLocale: "en",
  locales: ["en", "sv", "da", "es", "de"],
};

export type Locale = (typeof i18nConfig)["locales"][number];

export type SupportedLocale = (typeof i18nConfig.locales)[number];
