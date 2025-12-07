import { Profile } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { cachedGetProfile } from "@/lib/utils";
import { notFound } from "next/navigation";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(cachedGetProfile);

const ArtistPage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug } = await params;
  await setupSSR({ params });

  const { data: profile } = await cachedGetProfile({ slug });

  if (!profile) {
    notFound();
  }

  return <Profile profile={profile} />;
};

export default ArtistPage;
