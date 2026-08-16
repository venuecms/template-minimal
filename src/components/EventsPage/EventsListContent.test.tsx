import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EventsListContent } from "./EventsListContent";
import { EventsListSection } from "./EventsListSection";

vi.mock("next/server", () => ({ connection: async () => {} }));

// ColumnLeft is emitted first, so a body moved into it still reads as "before
// the events" unless the assertion names the column that should hold it.
const columnRight = (html: string) => html.split('class="col-span-2')[1] ?? "";

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
    const column = columnRight(
      await render(
        <EventsListContent locale="en" title="What's On">
          <p>Season notes</p>
        </EventsListContent>,
      ),
    );

    expect(column.indexOf("Season notes")).toBeGreaterThan(-1);
    expect(column.indexOf("Season notes")).toBeLessThan(
      column.indexOf("No events found"),
    );
  });
});

describe("the events listing section", () => {
  it("hands the body it was given to the content it wraps", async () => {
    const column = columnRight(
      await render(
        <EventsListSection locale="en" title="What's On">
          <p>Season notes</p>
        </EventsListSection>,
      ),
    );

    expect(column).toContain("Season notes");
  });
});
