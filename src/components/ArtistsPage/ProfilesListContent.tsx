import { getLocalizedContent } from "@venuecms/sdk-next";
import { getPage, getProfiles, getSite } from "@venuecms/sdk-next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { PaginationLinks } from "@/components/Pagination";
import { ProfileCompact } from "@/components/ProfileCompact";
import {
  ColumnLeft,
  ColumnRight,
  TwoColumnLayout,
  TwoSubColumnLayout,
} from "@/components/layout";

const ITEMS_PER_PAGE = 24;

export async function ProfilesListContent({
  locale,
  currentPage,
}: {
  locale: string;
  currentPage: number;
}) {
  await connection();

  const [{ data: profiles }, { data: page }, { data: site }, t] =
    await Promise.all([
      getProfiles({ page: currentPage, limit: ITEMS_PER_PAGE }),
      getPage({ slug: "artists" }),
      getSite(),
      getTranslations("profiles"),
    ]);

  if (!site) {
    notFound();
  }

  const pageTitle = page
    ? getLocalizedContent(page.localizedContent, locale).content.title
    : t("profiles");

  const records = profiles?.records ?? [];

  // Deliberately not a total-pages count with a fallback: the endpoint only
  // sometimes returns `count`, and inventing one strands the reader on a run of
  // empty pages. Without a count, a full page is the only evidence there may be
  // another — the same rule the SDK's own listing pager uses.
  const hasNext = profiles?.count
    ? (currentPage + 1) * ITEMS_PER_PAGE < profiles.count
    : records.length === ITEMS_PER_PAGE;

  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p className="pb-8 text-primary">{pageTitle}</p>
      </ColumnLeft>
      <ColumnRight>
        {records.length ? (
          <TwoSubColumnLayout>
            {records.map((profile) => (
              <ProfileCompact key={profile.slug} profile={profile} />
            ))}
          </TwoSubColumnLayout>
        ) : (
          t("no_profiles_found")
        )}
        <PaginationLinks
          prevHref={
            currentPage <= 0 ? null : `/artists?page=${currentPage - 1}`
          }
          nextHref={hasNext ? `/artists?page=${currentPage + 1}` : null}
        />
      </ColumnRight>
    </TwoColumnLayout>
  );
}
