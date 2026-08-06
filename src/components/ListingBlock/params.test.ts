import { describe, expect, it } from "vitest";

import {
  LISTING_BLOCK_NODE_TYPES,
  buildEventListingQuery,
  buildNewsListingQuery,
  buildPageListingQuery,
  buildProductListingQuery,
  buildProfileListingQuery,
  parseEventListingAttributes,
  parseNewsListingAttributes,
  parsePageListingAttributes,
  parseProductListingAttributes,
  parseProfileListingAttributes,
} from "./params";

const NOW = 1_700_000_000_000;

describe("LISTING_BLOCK_NODE_TYPES", () => {
  it("names every listing node the platform's TipTap blocks emit", () => {
    expect(LISTING_BLOCK_NODE_TYPES).toEqual([
      "eventListing",
      "newsListing",
      "pageListing",
      "productListing",
      "profileListing",
    ]);
  });
});

describe("parseEventListingAttributes", () => {
  it("reads the camelCase attrs a contentJSON node carries", () => {
    expect(
      parseEventListingAttributes({
        listingType: "past",
        limit: 4,
        page: 2,
        orderBy: "startDate",
        dir: "desc",
        featured: true,
        rootOnly: true,
        tags: ["jazz", "live"],
        query: "trio",
        lt: 123,
        gt: 456,
        legacyId: "abc",
      }),
    ).toEqual({
      listingType: "past",
      limit: 4,
      page: 2,
      orderBy: "startDate",
      dir: "desc",
      featured: true,
      rootOnly: true,
      tags: ["jazz", "live"],
      query: "trio",
      lt: 123,
      gt: 456,
      legacyId: "abc",
    });
  });

  it("reads the data-* attrs the markdown fallback carries", () => {
    expect(
      parseEventListingAttributes({
        "data-listing-type": "past",
        "data-limit": "4",
        "data-page": "2",
        "data-order-by": "createdAt",
        "data-dir": "desc",
        "data-featured": "true",
        "data-root-only": "true",
        "data-tags": "jazz,live",
        "data-query": "trio",
        "data-lt": "123",
        "data-gt": "456",
        "data-legacy-id": "abc",
      }),
    ).toEqual({
      listingType: "past",
      limit: 4,
      page: 2,
      orderBy: "createdAt",
      dir: "desc",
      featured: true,
      rootOnly: true,
      tags: ["jazz", "live"],
      query: "trio",
      lt: 123,
      gt: 456,
      legacyId: "abc",
    });
  });

  it("falls back to the block defaults for an attribute-less node", () => {
    expect(parseEventListingAttributes({})).toEqual({
      listingType: "upcoming",
      limit: null,
      page: null,
      orderBy: null,
      dir: null,
      featured: false,
      rootOnly: false,
      tags: [],
      query: null,
      lt: null,
      gt: null,
      legacyId: null,
    });
  });

  it("rejects values outside the block's contract", () => {
    const attrs = parseEventListingAttributes({
      listingType: "sideways",
      limit: 0,
      page: -1,
      orderBy: "title",
      dir: "sideways",
      lt: 0,
      gt: -5,
      query: "",
    });

    // limit=0 is falsy server-side and would return every record, so the
    // block treats it as unset rather than passing it through.
    expect(attrs).toMatchObject({
      listingType: "upcoming",
      limit: null,
      page: null,
      orderBy: null,
      dir: null,
      lt: null,
      gt: null,
      query: null,
    });
  });

  it("ignores a stray dir attribute the browser puts on the div", () => {
    // A `dir="ltr"` on the element is a DOM concern, not the block's sort
    // direction, but it shares the attribute name.
    expect(parseEventListingAttributes({ dir: "ltr" }).dir).toBeNull();
  });
});

describe("buildEventListingQuery", () => {
  it("asks for upcoming events by default", () => {
    expect(
      buildEventListingQuery(parseEventListingAttributes({}), NOW),
    ).toEqual({
      upcoming: true,
    });
  });

  it("windows a past listing to before now", () => {
    expect(
      buildEventListingQuery(
        parseEventListingAttributes({ listingType: "past" }),
        NOW,
      ),
    ).toEqual({ lt: NOW });
  });

  it("keeps an explicit lt over the computed one on a past listing", () => {
    expect(
      buildEventListingQuery(
        parseEventListingAttributes({ listingType: "past", lt: 999 }),
        NOW,
      ),
    ).toEqual({ lt: 999 });
  });

  it("applies no time window to an all listing", () => {
    expect(
      buildEventListingQuery(
        parseEventListingAttributes({ listingType: "all" }),
        NOW,
      ),
    ).toEqual({});
  });

  it("omits the flags an author left off", () => {
    const query = buildEventListingQuery(
      parseEventListingAttributes({ listingType: "all" }),
      NOW,
    );

    expect(query).not.toHaveProperty("featured");
    expect(query).not.toHaveProperty("rootOnly");
    expect(query).not.toHaveProperty("tags");
  });

  it("forwards every configured filter to the events endpoint", () => {
    expect(
      buildEventListingQuery(
        parseEventListingAttributes({
          listingType: "all",
          limit: 4,
          page: 2,
          orderBy: "startDate",
          dir: "desc",
          featured: true,
          rootOnly: true,
          tags: ["jazz"],
          query: "trio",
          gt: 456,
          legacyId: "abc",
        }),
        NOW,
      ),
    ).toEqual({
      limit: 4,
      page: 2,
      orderBy: "startDate",
      dir: "desc",
      featured: true,
      rootOnly: true,
      tags: ["jazz"],
      query: "trio",
      gt: 456,
      legacyId: "abc",
    });
  });
});

describe("news listing", () => {
  it("defaults to every article, unwindowed", () => {
    expect(parseNewsListingAttributes({}).listingType).toBe("all");
    expect(buildNewsListingQuery(parseNewsListingAttributes({}), NOW)).toEqual(
      {},
    );
  });

  it("windows a past listing to before now", () => {
    expect(
      buildNewsListingQuery(
        parseNewsListingAttributes({ "data-listing-type": "past" }),
        NOW,
      ),
    ).toEqual({ lt: NOW });
  });

  it("accepts the order-by columns the news endpoint sorts on", () => {
    expect(parseNewsListingAttributes({ orderBy: "date" }).orderBy).toBe(
      "date",
    );
    expect(parseNewsListingAttributes({ orderBy: "startDate" }).orderBy).toBe(
      null,
    );
  });
});

describe("product listing", () => {
  it("forwards the configured filters", () => {
    expect(
      buildProductListingQuery(
        parseProductListingAttributes({
          "data-limit": "6",
          "data-order-by": "order",
          "data-dir": "asc",
          "data-tags": "vinyl,tape",
          "data-query": "lp",
        }),
      ),
    ).toEqual({
      limit: 6,
      orderBy: "order",
      dir: "asc",
      tags: ["vinyl", "tape"],
      query: "lp",
    });
  });

  it("rejects an order-by column the products endpoint does not sort on", () => {
    expect(
      parseProductListingAttributes({ orderBy: "startDate" }).orderBy,
    ).toBe(null);
  });
});

describe("profile listing", () => {
  it("reads the member filter off data-profile-type", () => {
    // `data-type` marks the node itself for TipTap's parser, so the profile
    // block serializes its own `type` param under a different name.
    expect(
      parseProfileListingAttributes({
        "data-type": "profile-listing",
        "data-profile-type": "member",
      }).type,
    ).toBe("member");
  });

  it("forwards the member filter to the profiles endpoint", () => {
    expect(
      buildProfileListingQuery(
        parseProfileListingAttributes({ type: "member", limit: 3 }),
      ),
    ).toEqual({ type: "member", limit: 3 });
  });

  it("rejects a profile type the endpoint does not accept", () => {
    expect(parseProfileListingAttributes({ type: "artist" }).type).toBeNull();
  });
});

describe("page listing", () => {
  it("forwards the configured filters", () => {
    expect(
      buildPageListingQuery(
        parsePageListingAttributes({
          orderBy: "updatedAt",
          dir: "desc",
          featured: true,
          tags: ["about"],
        }),
      ),
    ).toEqual({
      orderBy: "updatedAt",
      dir: "desc",
      featured: true,
      tags: ["about"],
    });
  });

  it("sends no limit or page — the pages read ignores both", () => {
    const query = buildPageListingQuery(
      parsePageListingAttributes({ limit: 5, page: 2 }),
    );

    expect(query).not.toHaveProperty("limit");
    expect(query).not.toHaveProperty("page");
  });
});
