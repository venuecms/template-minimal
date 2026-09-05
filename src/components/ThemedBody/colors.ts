/**
 * The theme color variables from globals.css that a site can override through
 * its template config.
 *
 * The venue backend renders its settings UI from
 * `public/_venue/config.schema.json` and writes the chosen values back into the
 * site's template config, so the keys here are the contract with that schema —
 * `colors.test.ts` pins the two together.
 *
 * Only variables this template actually renders with belong here. `--overlay`
 * is deliberately absent: every theme declares it, but no component consumes
 * it (the hero overlay is a hardcoded color in FeaturedEventsContent), so a
 * picker for it would be a control that does nothing.
 */
export const THEME_COLOR_VARIABLES = {
  colorBackground: "--background",
  colorPrimary: "--primary",
  colorSecondary: "--secondary",
  colorMuted: "--muted",
  colorNav: "--nav",
} as const;

export type ThemeColorKey = keyof typeof THEME_COLOR_VARIABLES;

/** #rgb, #rgba, #rrggbb and #rrggbbaa — what a color input produces. */
const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const channel = (digits: string) =>
  parseInt(digits.length === 1 ? digits.repeat(2) : digits, 16);

const splitHex = (hex: string): [string, string, string, string] => {
  const digits = hex.slice(1);
  const size = digits.length <= 4 ? 1 : 2;
  const at = (index: number) => digits.slice(index * size, (index + 1) * size);

  return [at(0), at(1), at(2), digits.length % 4 === 0 ? at(3) : "ff"];
};

/**
 * Convert a hex color to the bare `H, S%, L%, A` component list the theme
 * variables hold — globals.css wraps them in `hsla(var(--name))`, so a
 * full color function here would not parse.
 *
 * Returns null for anything that is not a hex color, which leaves the theme's
 * own value in place rather than emitting a declaration the browser drops.
 */
export const hexToHslaComponents = (hex: string): string | null => {
  if (!HEX_COLOR.test(hex)) {
    return null;
  }

  const [rHex, gHex, bHex, aHex] = splitHex(hex);
  const r = channel(rHex) / 255;
  const g = channel(gHex) / 255;
  const b = channel(bHex) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }

    hue = (hue * 60 + 360) % 360;
  }

  // Two decimals, trailing zeros dropped. Rounding to whole percents the way
  // globals.css writes them would shift the chosen color by up to a full 8-bit
  // step — #7f7f7f would come back out as #808080.
  const trim = (value: number) => Number(value.toFixed(2));
  const alpha = Math.round((channel(aHex) / 255) * 100) / 100;

  return `${trim(hue)}, ${trim(saturation * 100)}%, ${trim(
    lightness * 100,
  )}%, ${alpha}`;
};

/**
 * Build the stylesheet that layers a site's chosen colors over its theme.
 *
 * Themes declare their variables as `html.<themeId>`, so an override has to
 * outrank that: `:root:root` scores two pseudo-classes against the theme's one
 * class plus one type, which wins regardless of where the stylesheet lands in
 * the document. Only keys the site actually set are emitted — everything else
 * keeps falling through to the theme.
 *
 * That includes outranking the `prefers-color-scheme: dark` block nested in
 * `html.default`, so an override holds in both schemes while the colors left
 * unset still flip with the OS. Overriding only part of the default theme's
 * palette can therefore pair a chosen color with the opposite scheme's; the
 * schema says as much on every field.
 *
 * Values are hex-validated above and variable names come from a fixed map, so
 * nothing author-controlled reaches the CSS text verbatim.
 */
export const buildThemeColorOverrideCss = (
  config: Record<string, unknown>,
): string | null => {
  const declarations = Object.entries(THEME_COLOR_VARIABLES).flatMap(
    ([key, variable]) => {
      const value = config[key];

      if (typeof value !== "string") {
        return [];
      }

      const components = hexToHslaComponents(value.trim());

      return components ? [`${variable}: ${components};`] : [];
    },
  );

  return declarations.length
    ? `:root:root { ${declarations.join(" ")} }`
    : null;
};
