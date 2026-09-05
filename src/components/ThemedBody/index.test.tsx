import type { Site } from "@venuecms/sdk-next";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSite = vi.fn();

vi.mock("@venuecms/sdk-next", () => ({ getSite: () => getSite() }));

// next/font/google is a compiler transform with no runtime outside a Next
// build, and next-themes only contributes the <html> class, which lives above
// the subtree rendered here.
vi.mock("next/font/google", () => {
  const font = () => ({ style: { fontFamily: "stub" } });

  return Object.fromEntries(
    [
      "Abel",
      "Courier_Prime",
      "EB_Garamond",
      "Gothic_A1",
      "Hanken_Grotesk",
      "IBM_Plex_Mono",
      "Inter",
      "Jost",
      "Karla",
      "Kosugi_Maru",
      "Open_Sans",
      "Oswald",
      "Outfit",
      "Schibsted_Grotesk",
      "Special_Elite",
      "Work_Sans",
      "Young_Serif",
    ].map((name) => [name, font]),
  );
});
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

const { ThemedBody } = await import("./index");

const siteWithConfig = (config: Record<string, unknown>) =>
  ({
    id: "site-id",
    settings: { publicSite: { template: { config } } },
  }) as unknown as Site;

const render = async () => {
  const stream = await renderToReadableStream(<ThemedBody>{null}</ThemedBody>);
  await stream.allReady;

  return new Response(stream).text();
};

const renderWithConfig = async (config: Record<string, unknown>) => {
  getSite.mockResolvedValue({ data: siteWithConfig(config) });

  return render();
};

describe("ThemedBody", () => {
  beforeEach(() => {
    getSite.mockReset();
  });

  it("emits the site's color overrides as a stylesheet", async () => {
    const html = await renderWithConfig({
      themeId: "space",
      colorBackground: "#ffffff",
      colorPrimary: "#000000",
    });

    expect(html).toContain("--background: 0, 0%, 100%, 1;");
    expect(html).toContain("--primary: 0, 0%, 0%, 1;");
  });

  it("overrides the theme rather than replacing it", async () => {
    // Only the chosen variable is emitted, so every other color the theme
    // sets keeps applying.
    const html = await renderWithConfig({
      themeId: "space",
      colorNav: "#ff0000",
    });

    expect(html).toContain("--nav: 0, 100%, 50%, 1;");
    expect(html).not.toContain("--background");
    expect(html).not.toContain("--secondary");
  });

  it("renders no stylesheet when the site chose no colors", async () => {
    // An empty rule is still a rule; with nothing overridden the theme has to
    // be the only source of color.
    const html = await renderWithConfig({ themeId: "space" });

    expect(html).not.toContain("<style");
    expect(html).not.toContain(":root:root");
  });

  it("renders when the site has no template config at all", async () => {
    getSite.mockResolvedValue({ data: undefined });

    expect(await render()).not.toContain("<style");
  });
});
