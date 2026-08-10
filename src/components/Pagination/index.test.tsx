/**
 * The pager, pinned from both sides.
 *
 * `Pagination` counts pages against a base URL and is what `/archive` and
 * `/shop` use; `PaginationLinks` takes hrefs already built and is what a listing
 * block inside content uses, since a block does not know the URL it is being
 * paged by. They share the rendering, so these cover the seam between them: the
 * page arithmetic on one side, the disabled direction on the other.
 */
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Pagination, PaginationLinks } from "./index";

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

describe("PaginationLinks", () => {
  it("links both directions when both exist", async () => {
    const html = await render(
      <PaginationLinks prevHref="/archive?page=1" nextHref="/archive?page=3" />,
    );

    expect(html).toContain("/archive?page=1");
    expect(html).toContain("/archive?page=3");
  });

  it("renders a null direction as something unclickable", async () => {
    // A null href is how "there is no previous page" is spelled, so it must not
    // reach the DOM as a link to nowhere.
    const html = await render(
      <PaginationLinks prevHref={null} nextHref="/archive?page=1" />,
    );

    expect(html).toContain("pointer-events-none");
    expect(html).not.toContain('href="null"');
    expect(html).toContain("/archive?page=1");
  });
});

describe("Pagination", () => {
  it("counts the next page off the current one", async () => {
    const html = await render(
      <Pagination currentPage={1} totalPages={5} baseUrl="/archive" />,
    );

    expect(html).toContain("/archive?page=0");
    expect(html).toContain("/archive?page=2");
  });

  it("offers no previous page from the first", async () => {
    const html = await render(
      <Pagination currentPage={0} totalPages={5} baseUrl="/archive" />,
    );

    expect(html).not.toContain("page=-1");
    expect(html).toContain("/archive?page=1");
  });

  it("offers no next page from the last", async () => {
    const html = await render(
      <Pagination currentPage={5} totalPages={5} baseUrl="/archive" />,
    );

    expect(html).toContain("/archive?page=4");
    expect(html).not.toContain("page=6");
  });

  it("renders nothing when there are no pages to move between", async () => {
    await expect(
      render(<Pagination currentPage={0} totalPages={0} baseUrl="/archive" />),
    ).resolves.toBe("");
  });
});
