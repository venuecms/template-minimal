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

    // Pages first: /pages/events would otherwise match the events branch.
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

  it("renders a body it was handed above the events", async () => {
    const html = await render(
      <EventsListContent locale="en" title="What's On">
        <p>Season notes</p>
      </EventsListContent>,
    );

    expect(html.indexOf("Season notes")).toBeGreaterThan(-1);
    expect(html.indexOf("Season notes")).toBeLessThan(
      html.indexOf("No events found"),
    );
  });
});
