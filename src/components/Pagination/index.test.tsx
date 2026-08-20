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

import en from "@/lib/i18n/dictionaries/en.json";
import sv from "@/lib/i18n/dictionaries/sv.json";

import { Pagination, PaginationLinks } from "./index";

// The real dictionaries, not a fixture: the strings under test are the ones
// shipped, so a key added to the component but not to `en.json` has to fail
// here rather than silently announce its own key path to a screen reader.
const render = async (node: ReactNode, locale: "en" | "sv" = "en") => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "sv" ? sv : en}
    >
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

  it("names the arrows, which carry no text of their own", async () => {
    const html = await render(
      <PaginationLinks prevHref="/archive?page=1" nextHref="/archive?page=3" />,
    );

    expect(html).toContain(`aria-label="${en.pagination.previous_page}"`);
    expect(html).toContain(`aria-label="${en.pagination.next_page}"`);
  });

  it("announces the arrows in the reader's language", async () => {
    // The strings used to be English literals in the component, so a Swedish
    // site announced "Next page" to a Swedish screen reader.
    const html = await render(
      <PaginationLinks prevHref="/archive?page=1" nextHref="/archive?page=3" />,
      "sv",
    );

    expect(html).toContain(`aria-label="${sv.pagination.previous_page}"`);
    expect(html).toContain(`aria-label="${sv.pagination.next_page}"`);
    expect(html).not.toContain(en.pagination.next_page);
  });

  it("names the landmark in the reader's language", async () => {
    const html = await render(
      <PaginationLinks prevHref={null} nextHref="/archive?page=1" />,
      "sv",
    );

    expect(html).toContain(`aria-label="${sv.pagination.label}"`);
  });

  it("takes a caller's name for the landmark over the default", async () => {
    const html = await render(
      <PaginationLinks
        prevHref={null}
        nextHref="/archive?page=1"
        label="Events pagination evt_1k3f9q"
      />,
    );

    expect(html).toContain('aria-label="Events pagination evt_1k3f9q"');
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
