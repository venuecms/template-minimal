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

let profileRecords: Array<Record<string, unknown>> = [];

beforeEach(() => {
  setConfig({ siteKey: "test-site" });
  profileRecords = [];

  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    const body = url.includes("/profiles")
      ? { records: profileRecords, count: profileRecords.length }
      : { id: "site-id", timeZone: "Europe/Berlin", settings: {} };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const aProfile = (title: string) => ({
  siteId: "site-id",
  slug: title.toLowerCase().replace(/\s+/g, "-"),
  localizedContent: [{ siteId: "site-id", locale: "en", title }],
});

describe("the profiles listing", () => {
  it("draws the profiles the endpoint returned", async () => {
    profileRecords = [aProfile("An Artist")];

    const html = await render(<ProfilesListContent title="Artists" />);

    expect(html).toContain("An Artist");
    expect(html).toContain("/artists/an-artist");
  });

  it("heads itself with the listing page's own title", async () => {
    expect(await render(<ProfilesListContent title="Roster" />)).toContain(
      "Roster",
    );
  });

  // Unlike events and shop, this template has no /profiles route and so no page
  // record to fall back to, which is why the heading is only ever the page's.
  it("falls back to a heading of its own without one", async () => {
    const html = await render(<ProfilesListContent />);

    expect(html).toContain("artists");
    expect(requestedUrls().some((url) => url.includes("/pages"))).toBe(false);
  });

  it("says so when there are no profiles", async () => {
    expect(await render(<ProfilesListContent title="Artists" />)).toContain(
      "No artists found",
    );
  });

  // A profile card needs no site, so asking for one would only add a request
  // that a failed read could then 404 the whole page on.
  it("reads no site", async () => {
    await render(<ProfilesListContent title="Artists" />);

    expect(requestedUrls().every((url) => url.includes("/profiles"))).toBe(true);
  });

  it("renders a body it was handed above the profiles", async () => {
    profileRecords = [aProfile("An Artist")];

    const column = columnRight(
      await render(
        <ProfilesListContent title="Artists">
          <p>Roster notes</p>
        </ProfilesListContent>,
      ),
    );

    expect(column.indexOf("Roster notes")).toBeGreaterThan(-1);
    expect(column.indexOf("Roster notes")).toBeLessThan(
      column.indexOf("An Artist"),
    );
  });
});

describe("the profiles listing section", () => {
  it("hands the body it was given to the content it wraps", async () => {
    const column = columnRight(
      await render(
        <ProfilesListSection title="Artists">
          <p>Roster notes</p>
        </ProfilesListSection>,
      ),
    );

    expect(column).toContain("Roster notes");
  });
});
