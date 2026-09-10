/**
 * The seam between the locale list and the dictionaries behind it.
 *
 * `request.ts` resolves a dictionary by name — `./dictionaries/${locale}.json` —
 * so a locale listed with no file behind it is a runtime import failure on the
 * first request in that language, not a compile error. Pinned in both
 * directions: a dictionary nobody lists is dead weight that drifts out of date
 * unnoticed, which is how a locale ends up shipping with half a year of missing
 * copy the day somebody finally enables it.
 *
 * Key parity is the other half. A missing key is not a crash — next-intl falls
 * back to rendering the key path itself, so a Danish reader gets the literal
 * text `events.cancelled` on the page. That is the failure this file exists to
 * catch, since it survives typecheck, tests and review by looking like nothing
 * at all until someone switches language.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { i18nConfig } from "./config";

const dictionariesDir = fileURLToPath(
  new URL("./dictionaries", import.meta.url),
);

const dictionaryFiles = readdirSync(dictionariesDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.replace(/\.json$/, ""))
  .sort();

const read = (locale: string): Record<string, unknown> =>
  JSON.parse(readFileSync(`${dictionariesDir}/${locale}.json`, "utf8"));

/** Dotted paths, so a key nested one level down is comparable across files. */
const keyPaths = (value: unknown, prefix = ""): string[] =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.entries(value).flatMap(([key, nested]) =>
        keyPaths(nested, prefix ? `${prefix}.${key}` : key),
      )
    : [prefix];

describe("the locale list", () => {
  it("names only locales that have a dictionary", () => {
    const missing = i18nConfig.locales.filter(
      (locale) => !dictionaryFiles.includes(locale),
    );

    expect(missing).toEqual([]);
  });

  it("names every dictionary that exists", () => {
    // The reverse direction: a translated file nobody can reach is worse than
    // no file, because it looks done.
    expect([...i18nConfig.locales].sort()).toEqual(dictionaryFiles);
  });

  it("falls back to a locale it actually lists", () => {
    // request.ts hands an unrecognised locale to defaultLocale, so a default
    // outside the list would fail the same import it exists to avoid.
    expect(i18nConfig.locales).toContain(i18nConfig.defaultLocale);
  });
});

describe("the dictionaries", () => {
  const expected = keyPaths(read(i18nConfig.defaultLocale)).sort();

  it.each(
    i18nConfig.locales.filter((locale) => locale !== i18nConfig.defaultLocale),
  )("carry every key %s", (locale) => {
    expect(keyPaths(read(locale)).sort()).toEqual(expected);
  });

  it.each([...i18nConfig.locales])("leave no key blank in %s", (locale) => {
    const dictionary = read(locale);
    const blank = keyPaths(dictionary).filter((path) => {
      const value = path
        .split(".")
        .reduce<any>((node, key) => node?.[key], dictionary);
      return typeof value !== "string" || value.trim() === "";
    });

    expect(blank).toEqual([]);
  });
});
