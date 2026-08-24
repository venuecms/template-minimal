import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    // The list's boundary is expected to catch a failed read; without this the
    // recoverable error still reaches the console and reads as a test error.
    { onError: () => {} },
  );
  await stream.allReady;
  return new Response(stream).text();
};

const requestedUrls = () =>
  vi
    .mocked(globalThis.fetch)
    .mock.calls.map(([input]) =>
      input instanceof Request ? input.url : String(input),
    );

/** The title on the "events" page record, or null for a locale saved without one. */
let recordTitle: string | null = "Upcoming Events";
let siteReadFails = false;

beforeEach(() => {
  setConfig({ siteKey: "test-site" });
  recordTitle = "Upcoming Events";
  siteReadFails = false;

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    // Pages first: /pages/events would otherwise match the events branch.
    if (url.includes("/pages")) {
      return new Response(
        JSON.stringify({
          id: "page-id",
          slug: "events",
          localizedContent: [
            { siteId: "site-id", locale: "en", title: recordTitle },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (url.includes("/events")) {
      return new Response(JSON.stringify({ records: [], count: 0 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (siteReadFails) {
      return new Response("upstream is down", { status: 500 });
    }

    return new Response(
      JSON.stringify({
        id: "site-id",
        timeZone: "Europe/Berlin",
        settings: {},
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the events listing heading", () => {
  it("reads the /events page record when no title was handed to it", async () => {
    expect(await render(<EventsListSection locale="en" />)).toContain(
      "Upcoming Events",
    );
  });

  it("prefers the title it was given, and does not read the page record", async () => {
    const html = await render(
      <EventsListSection locale="en" title="What's On" />,
    );

    expect(html).toContain("What&#x27;s On");
    expect(html).not.toContain("Upcoming Events");
    expect(requestedUrls().some((url) => url.includes("/pages"))).toBe(false);
  });

  // A locale saved without a title yields "", not undefined. Reading absence
  // rather than emptiness would take "" for a title and draw a blank column —
  // and would skip the page read whose answer it then ignored.
  it.each([
    ["an empty title", ""],
    ["a whitespace-only title", "   "],
  ])("reads the page record given %s", async (_label, title) => {
    const html = await render(<EventsListSection locale="en" title={title} />);

    expect(html).toContain("Upcoming Events");
  });

  // And the record's own title can be blank the same way.
  it("falls back to a heading of its own when the record has none", async () => {
    recordTitle = "";

    expect(await render(<EventsListSection locale="en" />)).toContain(
      "upcoming events",
    );
  });
});

describe("the events listing body", () => {
  it("renders a body it was handed above the events", async () => {
    const column = columnRight(
      await render(
        <EventsListSection locale="en" title="What's On">
          <p>Season notes</p>
        </EventsListSection>,
      ),
    );

    expect(column.indexOf("Season notes")).toBeGreaterThan(-1);
    expect(column.indexOf("Season notes")).toBeLessThan(
      column.indexOf("No events found"),
    );
  });

  // The heading and the body cost no request of their own, so they sit outside
  // the boundaries: a failed list read has no business taking an author's prose
  // or the page's title down with it.
  //
  // Asserted on what survives rather than on the error copy: the boundary that
  // catches the bailout is a client component, and React hands a suspended
  // boundary's error to the client rather than running its fallback in SSR.
  it("keeps the title and the body when the list fails", async () => {
    siteReadFails = true;

    const html = await render(
      <EventsListSection locale="en" title="What's On">
        <p>Season notes</p>
      </EventsListSection>,
    );

    expect(html).toContain("What&#x27;s On");
    expect(html).toContain("Season notes");
    // And does not pass the failure off as a listing that is merely empty.
    expect(html).not.toContain("No events found");
  });
});
