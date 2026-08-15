import { Page } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { type SearchParams, getLocalizedContent } from "@venuecms/sdk-next";
import { getPage, getPages } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { PageWithParent } from "@/lib/utils/tree";

import { PageListing } from "@/components/PageListing";
import { setupSSR } from "@/components/utils";
import { resolvePageListingLayout } from "@/components/utils/pageLayout";

export const generateMetadata = getGenerateMetadata(getPage);

const PagePage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string } & Params>;
  // Read here and handed down because only a route segment can: a listing block
  // sits too deep inside the content to ask for the URL it is being paged by.
  searchParams: Promise<SearchParams>;
}) => {
  const { slug, locale } = await params;
  await setupSSR({ params });

  // Awaited out here, alongside `params`, rather than at the two call sites
  // below: the catch turns anything thrown into a 404, and a dynamic-rendering
  // bailout thrown by reading the URL has to reach the framework, not become a
  // not-found page.
  const resolvedSearchParams = await searchParams;

  try {
    const { data: page } = await getPage({ slug });

    if (!page) {
      notFound();
    }

    // A page typed as one of the site's listings renders that listing instead
    // of its own content, so the index looks the same wherever an author puts
    // it. Decided before the page tree is read at all: a listing draws from its
    // own endpoint, and the tree is something only the page layout needs.
    const listingLayout = resolvePageListingLayout(page.type);

    if (listingLayout) {
      const { content } = getLocalizedContent(page.localizedContent, locale);

      return (
        <PageListing
          layout={listingLayout}
          locale={locale}
          title={content.title ?? undefined}
          basePath={`/p/${slug}`}
          searchParams={resolvedSearchParams}
        />
      );
    }

    // The page layout draws the subpage tree, so it does need the page list.
    const { data: pages } = await getPages();

    if (!pages) {
      notFound();
    }

    return (
      <Page
        page={page}
        pages={pages.records as Array<PageWithParent>}
        searchParams={resolvedSearchParams}
      />
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default PagePage;
