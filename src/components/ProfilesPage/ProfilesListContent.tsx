import { getProfiles } from "@venuecms/sdk-next";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { ProfilesList } from "@/components/ProfileList";
import { ColumnLeft, ColumnRight, TwoColumnLayout } from "@/components/layout";

// One page of profiles, matching the roster template-liminal lists. The
// endpoint pages, but no route here does: profiles are a cast list, not a feed,
// and `count` is optional on that response, so a pager could not size itself.
const PROFILE_LIMIT = 99;

export async function ProfilesListContent({
  title,
  children,
}: {
  /**
   * Heading. Always the listing page's own: unlike events and shop, this
   * template has no /profiles route and so no page record to read one from.
   */
  title?: string;
  children?: ReactNode;
}) {
  await connection();

  const { data: profiles } = await getProfiles({
    limit: PROFILE_LIMIT,
    dir: "desc",
  });

  // No site read, and so no `notFound` on a failed one: a profile card draws
  // from the profile alone, and asking would only add a request that could
  // take the page down with it.
  return (
    <TwoColumnLayout>
      <ColumnLeft className="text-sm text-secondary">
        <p className="pb-8 text-primary">{title ?? "artists"}</p>
      </ColumnLeft>
      <ColumnRight>
        {children}
        {profiles?.records.length ? (
          <ProfilesList profiles={profiles.records} />
        ) : (
          "No artists found"
        )}
      </ColumnRight>
    </TwoColumnLayout>
  );
}
