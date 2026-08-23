import type { ListingRecords } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProfileListingBlock } from "@/components/ListingBlock/blocks";

import { ProfilesList } from "./index";

const render = async (node: ReactNode) => {
  const stream = await renderToReadableStream(
    <NextIntlClientProvider locale="en" messages={{}}>
      {node}
    </NextIntlClientProvider>,
  );
  await stream.allReady;
  return new Response(stream).text();
};

const profiles = (...titles: string[]): ListingRecords["profileListing"] =>
  titles.map((title, index) => ({
    siteId: "site-id",
    slug: `profile-${index}`,
    localizedContent: [{ siteId: "site-id", locale: "en", title }],
  }));

describe("ProfilesList", () => {
  it("draws a card per profile", async () => {
    const html = await render(
      <ProfilesList profiles={profiles("An artist", "Another artist")} />,
    );

    expect(html).toContain("An artist");
    expect(html).toContain("Another artist");
    expect(html).toContain("/artists/profile-0");
  });

  it("renders nothing but the grid for no profiles", async () => {
    expect(await render(<ProfilesList profiles={[]} />)).not.toContain("<a");
  });

  // Asserted against the shared list rather than its class names: the point of
  // extracting it is that the profile listing page and the content block cannot
  // drift, and comparing markup is what catches one of them growing a wrapper.
  it("is what the profile listing block draws", async () => {
    const records = profiles("An artist", "Another artist");

    expect(
      await render(
        <ProfileListingBlock records={records} site={null} pagination={null} />,
      ),
    ).toBe(await render(<ProfilesList profiles={records} className="py-4" />));
  });
});
