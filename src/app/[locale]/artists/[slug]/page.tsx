import { Profile } from "@/components";
import { getProfile } from "@venuecms/sdk";
import { notFound } from "next/navigation";

const ArtistPage = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) => {
  const { slug } = await params;
  const { data: profile } = await getProfile({ slug });

  if (!profile) {
    notFound();
  }

  return <Profile profile={profile} />;
};

export default ArtistPage;
