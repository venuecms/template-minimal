import type { Profile } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProfileCompact } from "./index";

/**
 * The recursion guard, pinned where it actually lives.
 *
 * A profile bio is what a profile listing renders, so this component must be
 * given a map with no listing entries — otherwise a bio containing a
 * `profileListing` block re-enters the listing, fetching and recursing without
 * bound. That guard is now one identifier at one call site, and switching it to
 * `contentComponents` to match the sibling components would type-check.
 */
const profileWithBio = (): Profile =>
  ({
    id: "profile-id",
    slug: "an-artist",
    image: null,
    localizedContent: [
      {
        siteId: "site-id",
        locale: "en",
        title: "An Artist",
        contentJSON: {
          type: "doc",
          content: [{ type: "profileListing", attrs: { limit: 3 } }],
        },
      },
    ],
  }) as unknown as Profile;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProfileCompact", () => {
  it("does not resolve listing blocks inside a bio", async () => {
    // The SDK warns and drops a node type it has no handler for, so this warning
    // is the observable proof that no profileListing handler was in scope.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const stream = await renderToReadableStream(
      <NextIntlClientProvider locale="en" messages={{}}>
        <ProfileCompact profile={profileWithBio()} />
      </NextIntlClientProvider>,
    );
    await stream.allReady;
    const html = await new Response(stream).text();

    expect(html).toContain("An Artist");
    expect(warn).toHaveBeenCalledWith(
      "missing type",
      expect.objectContaining({ type: "profileListing" }),
    );
  });
});
