import { setConfig } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfilesListContent } from "./ProfilesListContent";
import { ProfilesListSection } from "./ProfilesListSection";

vi.mock("next/server", () => ({ connection: async () => {} }));

// ColumnLeft is emitted first, so a body moved into it still reads as "before
// the profiles" unless the assertion names the column that should hold it.
const columnRight = (html: string) => html.split('class="col-span-2')[1] ?? "";

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
    // The roster's boundary is expected to catch a failed read; without this
    // the recoverable error still reaches the console and reads as a test error.
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

const aProfile = (title: string) => ({
  siteId: "site-id",
  slug: title.toLowerCase().replace(/\s+/g, "-"),
  localizedContent: [{ siteId: "site-id", locale: "en", title }],
});

let profileRecords: Array<Record<string, unknown>> = [];
let profilesReadFails = false;

beforeEach(() => {
  setConfig({ siteKey: "test-site" });
  profileRecords = [];
  profilesReadFails = false;

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    if (url.includes("/profiles")) {
      return profilesReadFails
        ? new Response("upstream is down", { status: 500 })
        : new Response(
            JSON.stringify({
              records: profileRecords,
              count: profileRecords.length,
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
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

describe("the profiles listing", () => {
  it("draws the profiles the endpoint returned", async () => {
    profileRecords = [aProfile("An Artist")];

    const html = await render(<ProfilesListSection title="Artists" />);

    expect(html).toContain("An Artist");
    expect(html).toContain("/artists/an-artist");
  });

  it("heads itself with the listing page's own title", async () => {
    expect(await render(<ProfilesListSection title="Roster" />)).toContain(
      "Roster",
    );
  });

  // Unlike events and shop, this template has no /profiles route and so no page
  // record to fall back to, which is why the heading is only ever the page's.
  // A locale saved without a title yields "", not undefined, so the fallback
  // has to read emptiness rather than absence or the heading column draws blank.
  it.each([
    ["no title", undefined],
    ["an empty title", ""],
    ["a whitespace-only title", "   "],
  ])("falls back to a heading of its own given %s", async (_label, title) => {
    const html = await render(<ProfilesListSection title={title} />);

    expect(html).toContain("artists");
    expect(requestedUrls().some((url) => url.includes("/pages"))).toBe(false);
  });

  it("says so when there are no profiles", async () => {
    expect(await render(<ProfilesListSection title="Artists" />)).toContain(
      "No artists found",
    );
  });

  // An outage rendered as an empty roster is a cached 200 claiming the site has
  // no artists, which is why the read has to fail loudly rather than fall
  // through to the empty state. Asserted on the throw rather than on rendered
  // markup: the boundary that catches it is a client component, and React hands
  // a suspended boundary's error to the client rather than running it in SSR.
  it("fails loudly rather than reporting an outage as an empty roster", async () => {
    profilesReadFails = true;

    await expect(ProfilesListContent()).rejects.toThrow(
      "The profiles endpoint could not be read.",
    );
  });

  // A profile card needs no site, so asking for one would only add a request
  // that a failed read could then 404 the whole page on.
  it("reads no site", async () => {
    await render(<ProfilesListSection title="Artists" />);

    expect(requestedUrls().every((url) => url.includes("/profiles"))).toBe(
      true,
    );
  });

  // A `profileListing` block sends no ordering unless its author picks one.
  // Sending one here would order the same roster differently on the two
  // surfaces the shared `ProfilesList` exists to keep identical.
  it("orders the roster the way a content block does", async () => {
    await render(<ProfilesListSection title="Artists" />);

    const query = new URL(requestedUrls()[0]).searchParams;

    expect(query.get("dir")).toBeNull();
    expect(query.get("orderBy")).toBeNull();
  });

  it("renders a body it was handed above the profiles", async () => {
    profileRecords = [aProfile("An Artist")];

    const column = columnRight(
      await render(
        <ProfilesListSection title="Artists">
          <p>Roster notes</p>
        </ProfilesListSection>,
      ),
    );

    expect(column.indexOf("Roster notes")).toBeGreaterThan(-1);
    expect(column.indexOf("Roster notes")).toBeLessThan(
      column.indexOf("An Artist"),
    );
  });

  // The heading and the body cost no request of their own, so they sit outside
  // the boundaries: a roster failure has no business taking an author's prose
  // or the page's title down with it.
  it("keeps the title and the body when the roster fails", async () => {
    profilesReadFails = true;

    const html = await render(
      <ProfilesListSection title="Artists">
        <p>Roster notes</p>
      </ProfilesListSection>,
    );

    expect(html).toContain("Artists");
    expect(html).toContain("Roster notes");
    // And does not pass the failure off as a roster that is merely empty.
    expect(html).not.toContain("No artists found");
  });
});
