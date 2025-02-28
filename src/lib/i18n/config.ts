export const i18nConfig = {
  defaultLocale: "en",
  locales: ["en", "sv"],
};

export type Locale = (typeof i18nConfig)["locales"][number];

export type SupportedLocale = (typeof i18nConfig.locales)[number];
