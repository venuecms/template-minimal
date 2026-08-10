import type { Profile } from "@venuecms/sdk-next";
import { NextIntlClientProvider } from "next-intl";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProfileCompact } from "./index";

/**
 * The recursion guard, pinned where it actually lives.
 *
 * A profile bio is what a profile listing renders, so this component must be
 * given a map with no listing entries — otherwise a bio containing a
 * `profileListing` block re-enters the listing, fetching and recursing without
 * bound. That guard is one identifier at one call site, and switching it to
 * `contentComponents` to match the sibling components would type-check.
 *
 * What makes the mutation observable is that resolving a listing is a *request*:
 * the SDK's handler calls `connection()` before it fetches, and outside a Next
 * request scope that throws. So a bio that renders without a single error is a
 * bio in which no listing handler was ever entered. With the listing map in
 * scope this render reports "`connection` was called outside a request scope"
 * and the assertion below fails.
 *
 * This test used to watch for the SDK's `console.warn("missing type", node)`
 * instead. That warning still exists in 1.13, but it is now suppressed for the
 * five listing node types specifically — precisely the nodes this test cares
 * about — so there is no warning left to assert on here.
 *
 * The honest limitation: this is a negative assertion, so it also passes if the
 * render happens not to throw for some unrelated reason. If the SDK stops
 * calling `connection()` inside the listing handler, or starts catching it,
 * this stops pinning anything and needs rewriting against whatever observable
 * replaces it.
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

describe("ProfileCompact", () => {
  it("does not resolve listing blocks inside a bio", async () => {
    const errors: string[] = [];

    const stream = await renderToReadableStream(
      <NextIntlClientProvider locale="en" messages={{}}>
        <ProfileCompact profile={profileWithBio()} />
      </NextIntlClientProvider>,
      {
        onError: (error) => {
          errors.push(String(error));
        },
      },
    );
    await stream.allReady;
    const html = await new Response(stream).text();

    expect(html).toContain("An Artist");
    expect(errors).toEqual([]);
  });
});
