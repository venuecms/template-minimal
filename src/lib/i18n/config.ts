export const config = {
  defaultLocale: "en",
  locales: ["en"],
};

export type Locale = (typeof config)["locales"][number];

export type SupportedLocale = (typeof config.locales)[number];
