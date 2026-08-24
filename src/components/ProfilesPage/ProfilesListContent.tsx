import { getProfiles } from "@venuecms/sdk-next";
import { connection } from "next/server";

import { ProfilesList } from "@/components/ProfileList";

// One page of profiles, matching the roster template-liminal lists and the cap
// /events already puts on its own index. Records past it are not reachable from
// this page; giving it a pager is a follow-up, not a silent detail.
const PROFILE_LIMIT = 99;

/**
 * The records half of the profile listing. Draws only the grid: its frame, its
 * heading and the page's own body live in `ProfilesListSection`, above the
 * Suspense boundary, so none of them wait on this fetch or vanish with it.
 */
export async function ProfilesListContent() {
  await connection();

  // No `dir`/`orderBy`: a `profileListing` block sends neither unless its author
  // picks one, so leaving them off is what makes this page and that block order
  // the same roster the same way.
  const { data: profiles } = await getProfiles({ limit: PROFILE_LIMIT });

  // The SDK reports a failed read as absent data rather than throwing, which
  // would otherwise render an outage as an empty roster — a cached 200 saying
  // the site has no artists. Throwing hands it to the error boundary instead.
  if (!profiles) {
    throw new Error("The profiles endpoint could not be read.");
  }

  // No site read, and so no `notFound` on a failed one: a profile card draws
  // from the profile alone, and asking would only add a request that could
  // take the page down with it.
  return profiles.records.length ? (
    <ProfilesList profiles={profiles.records} />
  ) : (
    "No artists found"
  );
}
