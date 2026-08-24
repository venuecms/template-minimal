/**
 * Where a listing page's heading and body sit relative to its records' error
 * boundary — the one thing every one of these views had to get right, and the
 * one thing a plain SSR render cannot see.
 *
 * `ErrorBoundary` is a client component, and React hands a suspended boundary's
 * error to the client rather than running its fallback while streaming. So a
 * body nested *inside* the boundary still appears in the server output, and an
 * assertion on that output passes whether the body is inside or outside it —
 * which is exactly how the first spelling of these tests passed against the bug
 * they were written to catch.
 *
 * Here the boundary is replaced by one that always draws its fallback, which is
 * what "the records failed" looks like. Whatever still renders is what genuinely
 * sits outside it, and a body that moves back under the boundary fails these.
 */
import type { SearchParams } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { EventsListSection } from "@/components/EventsPage";
import { ProfilesListSection } from "@/components/ProfilesPage";
import { ProductsListSection } from "@/components/ShopPage";

vi.mock("next/server", () => ({ connection: async () => {} }));

vi.mock("@/components/utils/ErrorBoundary", () => ({
  ErrorBoundary: ({ fallback }: { fallback: ReactNode }) => fallback,
}));

// Nothing should reach the network: every records component this file renders
// sits under the stubbed boundary and is replaced by its fallback.
const fetchSpy = vi
  .spyOn(globalThis, "fetch")
  .mockImplementation(async () => new Response("{}"));

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

const sections: Array<
  [string, (props: { children: ReactNode }) => ReactNode, string]
> = [
  [
    "events",
    ({ children }) => (
      <EventsListSection locale="en" title="What's On">
        {children}
      </EventsListSection>
    ),
    "What&#x27;s On",
  ],
  [
    "profiles",
    ({ children }) => (
      <ProfilesListSection title="Artists" basePath="/p/roster" currentPage={0}>
        {children}
      </ProfilesListSection>
    ),
    "Artists",
  ],
];

describe("a listing whose records failed", () => {
  it.each(sections)(
    "keeps the %s heading and body",
    async (_name, Section, heading) => {
      const html = await render(<Section>{<p>Season notes</p>}</Section>);

      expect(html).toContain(heading);
      expect(html).toContain("Season notes");
    },
  );

  /**
   * Products are absent from the cases above because that layout wraps no body
   * at all now: a PRODUCTLIST page's records come from a listing block in its
   * own content, which sits outside anything `ProductsListSection` bounds. All
   * that is left to pin for the shop is its failure message, below.
   */
  it("draws each listing's own failure message in place of its records", async () => {
    const searchParams: SearchParams = {};

    expect(
      await render(
        <ProfilesListSection
          title="Artists"
          basePath="/p/roster"
          currentPage={0}
          searchParams={searchParams}
        />,
      ),
    ).toContain("Unable to load artists");

    expect(
      await render(<EventsListSection locale="en" title="What's On" />),
    ).toContain("Unable to load events");

    expect(
      await render(<ProductsListSection currentPage={0} basePath="/shop" />),
    ).toContain("Unable to load products");
  });

  it("asks the network for nothing once the records are out of the way", () => {
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
