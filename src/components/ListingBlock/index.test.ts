import { describe, expect, it } from "vitest";

import { LISTING_BLOCK_NODE_TYPES } from "@/lib/listingBlocks/params";

import { renderedStyles } from "@/components/utils/styles";

import { contentComponents } from "./index";

/**
 * The wiring the whole feature hangs off: the map every content render is given
 * has to carry a component for each listing node type, or an author's block is
 * dropped with nothing but a console warning. Nothing else asserts this — the
 * tests in @/lib/listingBlocks build their own maps by hand.
 */
describe("contentComponents", () => {
  it("carries a component for every listing node type", () => {
    for (const nodeType of LISTING_BLOCK_NODE_TYPES) {
      expect(contentComponents[nodeType]).toBeTypeOf("function");
    }
  });

  it("keeps the prose class names", () => {
    for (const [nodeType, className] of Object.entries(renderedStyles)) {
      expect(contentComponents[nodeType]).toBe(className);
    }
  });

  it("adds nothing beyond the prose styles and the listing blocks", () => {
    // A stray key is either a typo that silently does nothing or a node type
    // being overridden without anyone meaning to.
    expect(Object.keys(contentComponents).sort()).toEqual(
      [...Object.keys(renderedStyles), ...LISTING_BLOCK_NODE_TYPES].sort(),
    );
  });
});
