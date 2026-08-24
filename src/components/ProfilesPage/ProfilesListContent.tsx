import { MAX_PAGE, type SearchParams, getProfiles } from "@venuecms/sdk-next";
import { connection } from "next/server";

import { PaginationLinks } from "@/components/Pagination";
import { ProfilesList } from "@/components/ProfileList";
import { buildPageHref } from "@/components/utils/searchParams";

/** The page size /archive and /shop use, this template's other paged indexes. */
export const PROFILES_PER_PAGE = 50;

/**
 * The records half of the profile listing, and its pager. The frame, the
 * heading and the page's own body live in `ProfilesListSection`, above the
 * Suspense boundary, so none of them wait on this fetch or vanish with it.
 */
export async function ProfilesListContent({
  currentPage,
  basePath,
  searchParams = {},
}: {
  currentPage: number;
  /** Path the pager builds hrefs against; only the route knows it. */
  basePath: string;
  searchParams?: SearchParams;
}) {
  await connection();

  // No `dir`/`orderBy`: a `profileListing` block sends neither unless its author
  // picks one, so leaving them off is what makes this page and that block order
  // the same roster the same way.
  const { data: profiles } = await getProfiles({
    page: currentPage,
    limit: PROFILES_PER_PAGE,
  });

  // The SDK reports a failed read as absent data rather than throwing, which
  // would otherwise render an outage as an empty roster — a cached 200 saying
  // the site has no artists. Throwing hands it to the error boundary instead.
  if (!profiles) {
    throw new Error("The profiles endpoint could not be read.");
  }

  const { records, count } = profiles;

  // `count` is optional on the profiles response, so the roster's end is found
  // two ways. Given a count, the records already behind the reader plus the
  // ones on this page settle it exactly. Without one, a page that came back
  // full is the only evidence another may follow — the rule the SDK pages a
  // `profileListing` block by, which is what keeps the two surfaces agreeing
  // about where the roster ends.
  //
  // The countless case does mean a roster whose length is an exact multiple of
  // the page size offers one link to an empty page. That page keeps its pager
  // rather than stranding whoever followed it.
  const hasNextPage =
    typeof count === "number"
      ? (currentPage + 1) * PROFILES_PER_PAGE < count
      : records.length === PROFILES_PER_PAGE;

  const prevHref =
    currentPage > 0
      ? buildPageHref(basePath, searchParams, currentPage - 1)
      : null;

  // Clamped at the deepest offset the endpoint will scan, so a pager cannot
  // walk a reader past the page the SDK would refuse anyway.
  const nextHref =
    hasNextPage && currentPage < MAX_PAGE
      ? buildPageHref(basePath, searchParams, currentPage + 1)
      : null;

  // No site read, and so no `notFound` on a failed one: a profile card draws
  // from the profile alone, and asking would only add a request that could
  // take the page down with it.
  return (
    <>
      {records.length ? (
        <ProfilesList profiles={records} />
      ) : (
        "No artists found"
      )}
      {prevHref || nextHref ? (
        <PaginationLinks
          prevHref={prevHref}
          nextHref={nextHref}
          // A PROFILELIST page can carry several pagers — every listing block
          // in its body brings one — so this landmark needs a name of its own.
          label="Artists pagination"
        />
      ) : null}
    </>
  );
}
