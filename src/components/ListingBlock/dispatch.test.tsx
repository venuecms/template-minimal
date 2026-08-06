import { type LocalizedContent, VenueContent } from "@venuecms/sdk-next";
import { renderToReadableStream, renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseEventListingAttributes } from "./params";

/**
 * Pins the contract this feature rests on: that the SDK renderer routes a node
 * type it does not know to the matching entry in `components`, handing it the
 * node with its attributes intact. Without that, every listing block would be
 * dropped from the content with only a console warning.
 */
const contentWith = (node: Record<string, unknown>) =>
  ({
    contentJSON: { type: "doc", content: [node] },
  }) as unknown as LocalizedContent;

describe("VenueContent block dispatch", () => {
  it("routes a listing node to its handler with attributes intact", () => {
    const html = renderToStaticMarkup(
      <VenueContent
        content={contentWith({
          type: "eventListing",
          attrs: { listingType: "past", limit: 3 },
        })}
        components={{
          eventListing: ({ node }) => {
            const attrs = parseEventListingAttributes(node.attrs ?? {});
            return <p>{`${attrs.listingType}:${String(attrs.limit)}`}</p>;
          },
        }}
      />,
    );

    expect(html).toContain("past:3");
  });

  it("awaits the fetching component a handler returns", async () => {
    // Handlers are synchronous, so a block fetches from a server component the
    // handler returns rather than in the handler itself.
    const FetchingBlock = async () => {
      const records = await Promise.resolve(["First event"]);
      return <p>{records[0]}</p>;
    };

    const stream = await renderToReadableStream(
      <VenueContent
        content={contentWith({ type: "eventListing" })}
        components={{ eventListing: () => <FetchingBlock /> }}
      />,
    );
    await stream.allReady;

    await expect(new Response(stream).text()).resolves.toContain("First event");
  });

  it("drops a listing node when no handler is registered", () => {
    const html = renderToStaticMarkup(
      <VenueContent
        content={contentWith({ type: "eventListing", attrs: { limit: 3 } })}
      />,
    );

    expect(html).not.toContain("3");
  });
});
