import { describe, expect, it } from "vitest";

import { hasRenderableContent } from "./pageContent";

const localized = (fields: {
  content?: string | null;
  contentJSON?: { [key: string]: unknown } | null;
}) => ({ siteId: "s1", locale: "en", ...fields });

describe("hasRenderableContent", () => {
  it("is false without localized content", () => {
    expect(hasRenderableContent(undefined)).toBe(false);
  });

  it("is true for a markdown body", () => {
    expect(hasRenderableContent(localized({ content: "## Notes" }))).toBe(true);
  });

  it.each([
    ["an empty markdown body", ""],
    ["a whitespace-only markdown body", "   \n "],
  ])("is false for %s", (_label, content) => {
    expect(hasRenderableContent(localized({ content }))).toBe(false);
  });

  it("is true for a doc with nodes", () => {
    expect(
      hasRenderableContent(
        localized({
          contentJSON: {
            type: "doc",
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Hi" }] },
            ],
          },
        }),
      ),
    ).toBe(true);
  });

  // The editor saves a doc either way, so the guard reads the nodes, not the key.
  it.each([
    ["no nodes", { type: "doc", content: [] }],
    [
      "one emptied paragraph",
      { type: "doc", content: [{ type: "paragraph" }] },
    ],
    // Also the shape a doc the editor left serialized presents.
    ["no node array", { type: "doc" }],
  ])("is false for a doc with %s", (_label, contentJSON) => {
    expect(hasRenderableContent(localized({ contentJSON }))).toBe(false);
  });

  // A node the reader can see, even with no text of its own, is content.
  it("is true for a doc holding only an image", () => {
    expect(
      hasRenderableContent(
        localized({
          contentJSON: { type: "doc", content: [{ type: "image" }] },
        }),
      ),
    ).toBe(true);
  });
});
