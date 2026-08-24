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

  /**
   * The fields disagree, and the renderer's answer is the one that counts:
   * `VenueContent` draws `contentJSON` whenever it is present and only reads
   * the markdown when it is not. A record whose editor doc was cleared while a
   * stale markdown mirror stayed behind therefore renders nothing, so judging
   * the markdown first would space the listing around an empty body.
   */
  it("is false for an emptied doc still carrying stale markdown", () => {
    expect(
      hasRenderableContent(
        localized({
          content: "## Notes from a previous edit",
          contentJSON: { type: "doc", content: [{ type: "paragraph" }] },
        }),
      ),
    ).toBe(false);
  });

  // And the mirror is still what a body with no doc at all is judged by.
  it("is true for markdown with no doc beside it", () => {
    expect(
      hasRenderableContent(
        localized({ content: "## Notes", contentJSON: null }),
      ),
    ).toBe(true);
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
