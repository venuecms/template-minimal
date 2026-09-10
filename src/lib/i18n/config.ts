export const i18nConfig = {
  defaultLocale: "en",
  // Every locale here needs a matching dictionary in ./dictionaries, since
  // request.ts resolves one by name. `config.test.ts` pins that both ways.
  locales: ["en", "da", "de", "es", "sk", "sv"],
  // `as const` so `locales` is a tuple of literals rather than `string[]`, which
  // is what gives `Locale` below any meaning — without it the type is just
  // `string` and every consumer of it is unchecked. The cost is that a plain
  // `string` no longer flows into `locales.includes`, which is what
  // `isSupportedLocale` is for.
} as const;

/** The locales this template serves. */
export type Locale = (typeof i18nConfig)["locales"][number];

/** Kept as the older name for {@link Locale}; the two are the same type. */
export type SupportedLocale = Locale;

/**
 * Narrows a locale that arrived as an unchecked string — a route param, an
 * `Accept-Language` header — to one this template has a dictionary for.
 *
 * The widening cast is confined to this one line on purpose: `includes` on a
 * literal tuple refuses a plain `string`, and every caller doing that cast for
 * itself is how `as any` ends up scattered across the routing code.
 */
export const isSupportedLocale = (value: string): value is Locale =>
  (i18nConfig.locales as readonly string[]).includes(value);
