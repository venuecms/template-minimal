import { Profile } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { type SearchParams, getProfile } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(getProfile);

const ArtistPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string } & Params>;
  // Read here and handed down because only a route segment can: a listing block
  // sits too deep inside the content to ask for the URL it is being paged by.
  searchParams: Promise<SearchParams>;
}) => {
  const { slug } = await params;
  await setupSSR({ params });

  const { data: profile } = await getProfile({ slug });

  if (!profile) {
    notFound();
  }

  return <Profile profile={profile} searchParams={await searchParams} />;
};

export default ArtistPage;
