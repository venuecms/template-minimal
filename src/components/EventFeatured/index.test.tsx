import type { Site, Event as VenueEvent } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EventFeatured } from "./index";

/**
 * The nested-anchor guard, pinned where it lives.
 *
 * This excerpt is wrapped in a `<Link>` to the event, and every list component
 * a listing block draws renders links of its own — so resolving a listing here
 * would put an `<a>` inside an `<a>`. That is invalid HTML the browser
 * reparses and React reports as a hydration mismatch, and it would also cost an
 * extra endpoint read on the home page for records nobody could page through.
 * The guard is one identifier at two call sites (`renderedStyles`, not
 * `contentComponents`), and switching it to match the sibling components would
 * type-check.
 *
 * Observable the same way ProfileCompact's is: resolving a listing is a
 * request, and the SDK's handler calls `connection()` before fetching, which
 * throws outside a Next request scope. A render that reports no error is a
 * render in which no listing handler was ever entered.
 */
const siteId = "site-id";

const site: Site = {
  id: siteId,
  timeZone: "Europe/Berlin",
  settings: {},
};

const eventWithListingInBody = (): VenueEvent =>
  ({
    id: "event-id",
    siteId,
    slug: "a-gig",
    startDate: "2026-09-01T20:00:00.000Z",
    endDate: "2026-09-01T23:00:00.000Z",
    hasTime: true,
    publishState: "PUBLISHED",
    image: null,
    artists: [],
    localizedContent: [
      {
        siteId,
        locale: "en",
        title: "A Featured Gig",
        contentJSON: {
          type: "doc",
          content: [{ type: "eventListing", attrs: { limit: 3 } }],
        },
      },
    ],
  }) as unknown as VenueEvent;

describe("EventFeatured", () => {
  it("does not resolve listing blocks inside the linked excerpt", async () => {
    const errors: string[] = [];

    const stream = await renderToReadableStream(
      <NextIntlClientProvider locale="en" messages={{}}>
        <EventFeatured event={eventWithListingInBody()} site={site} />
      </NextIntlClientProvider>,
      {
        onError: (error) => {
          errors.push(String(error));
        },
      },
    );
    await stream.allReady;
    const html = await new Response(stream).text();

    expect(html).toContain("A Featured Gig");
    expect(errors).toEqual([]);
  });
});
