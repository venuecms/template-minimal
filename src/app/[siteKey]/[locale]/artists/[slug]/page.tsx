import { Profile } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getProfile, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

export const generateMetadata = getGenerateMetadata(getProfile);

const ArtistPage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug, siteKey } = await params;
  setConfig({ siteKey });

  const { data: profile } = await getProfile({ slug });

  if (!profile) {
    notFound();
  }

  return <Profile profile={profile} />;
};

export default ArtistPage;
