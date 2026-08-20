/**
 * The pager's dictionary entries, across every locale the template ships.
 *
 * The rest of the suite renders `en` and `sv`, which leaves the other three
 * shipped locales unexercised — and both ways they can break are silent.
 *
 * A missing key does not throw: next-intl returns the key path, so dropping
 * `pagination.products` from `de.json` still typechecks, still passes every
 * other test, and announces "pagination.products" to a German screen reader.
 *
 * A stray apostrophe does not throw either. ICU MessageFormat reads `'` as an
 * escape, so the natural French phrasing "Pagination d'{name}" renders as
 * "Pagination d{name}" — quote eaten, placeholder left standing. Nothing about
 * writing that message looks wrong, which is why it is worth a test rather than
 * a comment.
 *
 * So this renders every message in every locale through the real translator and
 * checks the output is a finished string.
 */
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import da from "@/lib/i18n/dictionaries/da.json";
import de from "@/lib/i18n/dictionaries/de.json";
import en from "@/lib/i18n/dictionaries/en.json";
import es from "@/lib/i18n/dictionaries/es.json";
import sv from "@/lib/i18n/dictionaries/sv.json";

const dictionaries = { en, sv, de, da, es };

/** The arguments each message takes, so every one can actually be rendered. */
const ARGUMENTS: Record<string, Record<string, string>> = {
  listing_name: { listing: "Events", id: "evt_1k3f9q" },
  listing_label: { name: "Events evt_1k3f9q" },
  previous_page_in: { name: "Events evt_1k3f9q" },
  next_page_in: { name: "Events evt_1k3f9q" },
};

const Rendered = ({ locale }: { locale: keyof typeof dictionaries }) => {
  const t = useTranslations("pagination");

  return (
    <>
      {Object.keys(dictionaries[locale].pagination).map((key) => (
        <p key={key} data-key={key}>
          {t(key, ARGUMENTS[key])}
        </p>
      ))}
    </>
  );
};

const render = async (locale: keyof typeof dictionaries) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale={locale} messages={dictionaries[locale]}>
      <Rendered locale={locale} />
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

describe("the pager's dictionary entries", () => {
  const locales = Object.keys(dictionaries) as (keyof typeof dictionaries)[];

  it.each(locales)("%s carries the same keys as en", (locale) => {
    // English is the default, so it is what a component is written against.
    expect(Object.keys(dictionaries[locale].pagination).sort()).toEqual(
      Object.keys(en.pagination).sort(),
    );
  });

  it.each(locales)(
    "%s resolves every message to a finished string",
    async (locale) => {
      const html = await render(locale);

      // A key path in the output is next-intl reporting a message it could not
      // find; a surviving brace is ICU having failed to substitute one.
      expect(html).not.toContain("pagination.");
      expect(html).not.toMatch(/[{}]/);
    },
  );

  it.each(locales)("%s spells no message with an ICU escape", (locale) => {
    // The straight apostrophe is the escape character. Any locale needing one
    // in prose should use the typographic ’ (U+2019), which ICU passes through
    // and which is the correct character for the languages here anyway.
    for (const [key, message] of Object.entries(
      dictionaries[locale].pagination,
    )) {
      expect(`${locale}.${key}: ${message}`).not.toContain("'");
    }
  });
});
