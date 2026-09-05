import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_THEME_LIGHT_COLORS,
  THEME_COLOR_VARIABLES,
  buildThemeColorOverrideCss,
  hexToHslaComponents,
} from "./colors";

const readRepoFile = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

describe("hexToHslaComponents", () => {
  it.each([
    ["#ffffff", "0, 0%, 100%, 1"],
    ["#000000", "0, 0%, 0%, 1"],
    ["#ff0000", "0, 100%, 50%, 1"],
    ["#00ff00", "120, 100%, 50%, 1"],
    ["#0000ff", "240, 100%, 50%, 1"],
    // Hue wraps negative on this branch — without the wrap it reads as -60.
    ["#ff00ff", "300, 100%, 50%, 1"],
    // A muted mid-tone, where saturation and lightness are both in play.
    ["#336699", "210, 50%, 40%, 1"],
  ])("converts %s to the theme's component form", (hex, expected) => {
    expect(hexToHslaComponents(hex)).toBe(expected);
  });

  it("expands shorthand hex", () => {
    expect(hexToHslaComponents("#f00")).toBe(hexToHslaComponents("#ff0000"));
  });

  it("carries alpha through from an 8-digit hex", () => {
    // --muted is translucent in most themes, so an override that dropped alpha
    // would render muted text at full strength against its background.
    expect(hexToHslaComponents("#00000080")).toBe("0, 0%, 0%, 0.5");
  });

  it("keeps enough precision to reproduce the chosen color", () => {
    // Whole-percent lightness would round this to 50%, i.e. #808080 — the site
    // would not get back the gray it picked.
    expect(hexToHslaComponents("#7f7f7f")).toBe("0, 0%, 49.8%, 1");
  });

  it("is case insensitive", () => {
    expect(hexToHslaComponents("#AABBCC")).toBe(hexToHslaComponents("#aabbcc"));
  });

  it.each(["red", "hsl(0, 0%, 0%)", "#12345", "", "#ff00zz", "0, 0%, 0%, 1"])(
    "rejects %o rather than emitting a declaration the browser drops",
    (value) => {
      expect(hexToHslaComponents(value)).toBeNull();
    },
  );
});

describe("buildThemeColorOverrideCss", () => {
  it("returns null when the site set no colors, leaving the theme alone", () => {
    expect(buildThemeColorOverrideCss({}, "space")).toBeNull();
    expect(
      buildThemeColorOverrideCss(
        { themeId: "space", fontName: "jost" },
        "space",
      ),
    ).toBeNull();
  });

  it("emits only the variables the site actually chose", () => {
    const css = buildThemeColorOverrideCss(
      { colorBackground: "#ffffff" },
      "space",
    );

    expect(css).toBe(":root:root { --background: 0, 0%, 100%, 1; }");
    // An unset color must not be emitted at all — an empty declaration would
    // still shadow the theme.
    expect(css).not.toContain("--primary");
  });

  it("emits every chosen variable", () => {
    const css = buildThemeColorOverrideCss(
      Object.fromEntries(
        Object.keys(THEME_COLOR_VARIABLES).map((key) => [key, "#123456"]),
      ),
      "space",
    );

    for (const variable of Object.values(THEME_COLOR_VARIABLES)) {
      expect(css).toContain(`${variable}: `);
    }
  });

  it("outranks the theme's own `html.<themeId>` rule", () => {
    // Themes score (0,1,1); the doubled :root scores (0,2,0) and so wins
    // wherever the stylesheet ends up in the document. Weakening this
    // selector silently reverts every override to the theme's color.
    expect(
      buildThemeColorOverrideCss({ colorNav: "#123456" }, "space"),
    ).toMatch(/^:root:root /);
  });

  it("skips values that are not strings", () => {
    expect(
      buildThemeColorOverrideCss({ colorBackground: 16711680 }, "space"),
    ).toBeNull();
    expect(
      buildThemeColorOverrideCss({ colorBackground: null }, "space"),
    ).toBeNull();
  });

  it("tolerates surrounding whitespace", () => {
    expect(
      buildThemeColorOverrideCss({ colorBackground: " #ffffff " }, "space"),
    ).toBe(":root:root { --background: 0, 0%, 100%, 1; }");
  });

  it("never lets a config value reach the stylesheet verbatim", () => {
    // This string is interpolated into a <style> element, whose text React does
    // not escape, so a value that escaped validation could close the tag.
    const css = buildThemeColorOverrideCss(
      {
        colorBackground: "#fff</style><script>alert(1)</script>",
        colorPrimary: "red; } :root:root { --background: #000",
      },
      "space",
    );

    expect(css).toBeNull();
  });
});

describe("buildThemeColorOverrideCss on the default theme", () => {
  it("fills in the colors the site left alone", () => {
    // `default` is the only theme whose palette flips with the OS, and the
    // override outranks both branches. Emitting the chosen background on its
    // own would leave a dark-mode visitor reading the dark branch's near-white
    // text against it.
    const css = buildThemeColorOverrideCss(
      { colorBackground: "#ffffff" },
      "default",
    );

    expect(css).toContain("--background: 0, 0%, 100%, 1;");

    for (const [variable, components] of Object.entries(
      DEFAULT_THEME_LIGHT_COLORS,
    )) {
      if (variable !== "--background") {
        expect(css).toContain(`${variable}: ${components};`);
      }
    }
  });

  it("pins the header logo's inversion along with the scheme", () => {
    // globals.css inverts it under `prefers-color-scheme: light` only, so the
    // pinned-light page would otherwise hand a dark-mode visitor an uninverted
    // logo against a light background.
    expect(
      buildThemeColorOverrideCss({ colorBackground: "#ffffff" }, "default"),
    ).toContain(":root:root header img { filter: invert(1); }");
  });

  it("still defers entirely to the theme when no color was chosen", () => {
    // Pinning is a consequence of overriding something; on its own it would
    // freeze the scheme for every default-theme site.
    expect(buildThemeColorOverrideCss({}, "default")).toBeNull();
  });

  it("leaves the fixed-palette themes alone", () => {
    // Every other theme declares one palette for both schemes, so there is
    // nothing to pin and the unset colors keep coming from the theme.
    const css = buildThemeColorOverrideCss(
      { colorBackground: "#ffffff" },
      "space",
    );

    expect(css).not.toContain("--primary");
    expect(css).not.toContain("invert");
  });
});

describe("the config schema and the theme variables", () => {
  const schema = JSON.parse(
    readRepoFile("../../../public/_venue/config.schema.json"),
  ) as {
    properties: Record<
      string,
      { type: string; format?: string; pattern?: string }
    >;
  };
  const globalsCss = readRepoFile("../../app/globals.css");

  it("exposes exactly the color keys the template applies", () => {
    // The backend builds its color pickers from this schema and writes the
    // result back into the template config, so a key present on one side only
    // is either a picker that does nothing or a color no one can choose.
    const schemaColorKeys = Object.keys(schema.properties).filter((key) =>
      key.startsWith("color"),
    );

    expect(schemaColorKeys.sort()).toEqual(
      Object.keys(THEME_COLOR_VARIABLES).sort(),
    );
  });

  it("declares each color key as a color-picker string", () => {
    for (const key of Object.keys(THEME_COLOR_VARIABLES)) {
      expect(schema.properties[key]).toMatchObject({
        type: "string",
        format: "color",
      });
    }
  });

  it("leaves every color unset by default so the theme still wins", () => {
    for (const key of Object.keys(THEME_COLOR_VARIABLES)) {
      expect(schema.properties[key]).not.toHaveProperty("default");
    }
  });

  it("accepts a hex color and an empty value, and nothing else", () => {
    // Every description offers "leave empty to keep the theme's own color", so
    // a pattern that rejected "" would make clearing a color a backend
    // validation error.
    for (const key of Object.keys(THEME_COLOR_VARIABLES)) {
      const pattern = new RegExp(schema.properties[key].pattern ?? "");

      expect(pattern.test("")).toBe(true);
      expect(pattern.test("#ffffff")).toBe(true);
      expect(pattern.test("#FFF")).toBe(true);
      expect(pattern.test("#00000080")).toBe(true);
      expect(pattern.test("red")).toBe(false);
      expect(pattern.test("#12345")).toBe(false);
    }
  });

  it("mirrors the default theme's light palette exactly", () => {
    // These values are a copy of globals.css. If the theme is restyled and the
    // map is not, a default-theme site that overrides one color silently gets
    // the old palette for the rest.
    const block = globalsCss.slice(globalsCss.indexOf("html.default {"));
    const lightBranch = block.slice(0, block.indexOf("@media"));
    const declared = Object.fromEntries(
      [...lightBranch.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(
        ([, name, value]) => [name, value.trim()],
      ),
    );

    for (const [variable, components] of Object.entries(
      DEFAULT_THEME_LIGHT_COLORS,
    )) {
      expect(declared[variable]).toBe(components);
    }
  });

  it("only overrides variables the themes actually define", () => {
    for (const variable of Object.values(THEME_COLOR_VARIABLES)) {
      expect(globalsCss).toContain(`${variable}:`);
    }
  });

  it("only overrides variables this template renders with", () => {
    // `--overlay` is declared by every theme but consumed by nothing, so a
    // picker for it would sit in the settings UI doing nothing. Adding a
    // variable here means wiring it into a component too.
    const componentSource = readdirSync(
      fileURLToPath(new URL("../..", import.meta.url)),
      { recursive: true, encoding: "utf8" },
    )
      .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
      .map((file) => readRepoFile(`../../${file}`))
      .join("\n");

    for (const variable of Object.values(THEME_COLOR_VARIABLES)) {
      // A word character before the dash, so this matches the Tailwind
      // utility (`bg-background`) and not the `--background` declaration in
      // the map above, which is in this same directory.
      const utility = new RegExp(`\\w-${variable.slice(2)}\\b`);

      expect(componentSource).toMatch(utility);
    }
  });
});
