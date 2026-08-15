/**
 * The heading, which is the one thing this listing reads that its caller can
 * now know better than it does.
 *
 * `/events` has no title of its own and looks the /events page record up for
 * one. A page typed as the event listing already holds the title an author
 * wrote, and a heading that ignored it would leave that page announcing itself
 * as whatever the /events record says — a wrong heading, not a missing one, so
 * nothing about it looks broken.
 *
 * `connection()` is stubbed for the same reason as in the shop's test: the
 * component calls it to opt out of the prerender and it throws outside a Next
 * request scope.
 */
import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EventsListContent } from "./EventsListContent";

vi.mock("next/server", () => ({ connection: async () => {} }));

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

beforeEach(() => {
  setConfig({ siteKey: "test-site" });

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    let body: unknown = {
      id: "site-id",
      timeZone: "Europe/Berlin",
      settings: {},
    };

    // Pages first: the page record for this listing lives at /pages/events,
    // which the events branch would otherwise swallow.
    if (url.includes("/pages")) {
      body = {
        id: "page-id",
        slug: "events",
        localizedContent: [
          { siteId: "site-id", locale: "en", title: "Upcoming Events" },
        ],
      };
    } else if (url.includes("/events")) {
      body = { records: [], count: 0 };
    }

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the events listing heading", () => {
  it("reads the /events page record when no title was handed to it", async () => {
    const html = await render(<EventsListContent locale="en" />);

    expect(html).toContain("Upcoming Events");
  });

  it("prefers the title it was given, and does not read the page record", async () => {
    const html = await render(
      <EventsListContent locale="en" title="What's On" />,
    );

    expect(html).toContain("What&#x27;s On");
    expect(html).not.toContain("Upcoming Events");

    const requested = vi
      .mocked(globalThis.fetch)
      .mock.calls.map(([input]) =>
        input instanceof Request ? input.url : String(input),
      );

    expect(requested.some((url) => url.includes("/pages"))).toBe(false);
  });
});
