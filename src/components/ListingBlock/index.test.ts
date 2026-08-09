/**
 * The wiring the whole feature hangs off.
 *
 * The SDK owns parsing a listing node, validating its attributes, querying the
 * endpoint and wrapping the result in boundaries; that is covered by its own
 * suite rather than re-pinned here. What this template owns is the map it hands
 * over — and both ways that map can be wrong are quiet ones: a listing type
 * missing from it is dropped from the published page with nothing but a console
 * warning, and a class name the renderer does not read is simply never applied.
 *
 * So these run the real SDK against the real map, with nothing mocked.
 */
import {
  LISTING_BLOCK_NODE_TYPES,
  splitContentEntries,
} from "@venuecms/sdk-next";
import { describe, expect, it } from "vitest";

import { renderedStyles } from "@/components/utils/styles";

import { contentComponents } from "./index";

describe("contentComponents", () => {
  it("carries a component for every listing node type", () => {
    // Keyed off the SDK's own list, so a listing the platform adds fails here
    // until this template can draw it.
    for (const nodeType of LISTING_BLOCK_NODE_TYPES) {
      expect(contentComponents[nodeType]).toBeTypeOf("function");
    }
  });

  it("keeps the prose class names", () => {
    expect(contentComponents).toMatchObject(renderedStyles);
  });

  it("adds nothing beyond the prose styles and the listing blocks", () => {
    // A stray key is either a typo that silently does nothing or a node type
    // being overridden without anyone meaning to.
    expect(Object.keys(contentComponents).sort()).toEqual(
      [...Object.keys(renderedStyles), ...LISTING_BLOCK_NODE_TYPES].sort(),
    );
  });
});

/**
 * Class names and listing components now ride one prop, which the SDK sorts by
 * value. Running the real splitter is what proves the map survives that trip:
 * a listing left unregistered, or a class dropped because the map also holds
 * functions, each show up here rather than as an unstyled published page.
 */
describe("as the SDK sorts the map", () => {
  const { classes, handlers } = splitContentEntries(contentComponents);

  it("registers a handler for every listing node type", () => {
    expect(Object.keys(handlers).sort()).toEqual(
      [...LISTING_BLOCK_NODE_TYPES].sort(),
    );
  });

  it("still hands over every prose class name", () => {
    expect(classes).toEqual(renderedStyles);
  });
});
