import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import PagePage from "./page";

vi.mock("@/lib", () => ({ getGenerateMetadata: () => () => ({}) }));
vi.mock("@/components/utils", () => ({ setupSSR: async () => {} }));
vi.mock("@/components", () => ({
  Page: () => <div data-testid="page-layout" />,
}));
vi.mock("@/components/PageListing", () => ({
  PageListing: (props: Record<string, unknown>) => (
    <div
      data-testid="page-listing"
      data-layout={typeof props.layout === "string" ? props.layout : undefined}
      data-title={typeof props.title === "string" ? props.title : undefined}
      data-base-path={
        typeof props.basePath === "string" ? props.basePath : undefined
      }
    />
  ),
}));

const { reads } = vi.hoisted(() => ({
  reads: { pageType: "CONTENT", pagesReadFails: false },
}));

vi.mock("@venuecms/sdk-next", () => ({
  getPage: async () => ({
    data: { id: "p1", type: reads.pageType, localizedContent: [] },
  }),
  getPages: async () => ({
    data: reads.pagesReadFails ? null : { records: [] },
  }),
  getLocalizedContent: () => ({ content: { title: "What's On" } }),
}));

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(node);
  await stream.allReady;
  return new Response(stream).text();
};

const renderRoute = async (type: string, pagesReadFails = false) => {
  reads.pageType = type;
  reads.pagesReadFails = pagesReadFails;

  return render(
    await PagePage({
      params: Promise.resolve({
        siteKey: "a-site",
        locale: "en",
        slug: "whats-on",
      }),
      searchParams: Promise.resolve({ page: "2" }),
    }),
  );
};

describe("the page route", () => {
  it("renders an ordinary page with the page layout", async () => {
    expect(await renderRoute("CONTENT")).toContain('data-testid="page-layout"');
  });

  it("renders a listing page with its listing, paged against its own path", async () => {
    const html = await renderRoute("EVENTLIST");

    expect(html).not.toContain('data-testid="page-layout"');
    expect(html).toContain('data-layout="events"');
    expect(html).toContain('data-title="What&#x27;s On"');
    expect(html).toContain('data-base-path="/p/whats-on"');
  });

  it("still renders a listing when the page tree cannot be read", async () => {
    expect(await renderRoute("PRODUCTLIST", true)).toContain(
      'data-testid="page-listing"',
    );
  });

  it("keeps a page typed as a listing this template has no index for", async () => {
    expect(await renderRoute("PROFILELIST")).toContain(
      'data-testid="page-layout"',
    );
  });
});
