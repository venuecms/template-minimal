import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getPage } from "@venuecms/sdk-next";

import { ProfilesListSection } from "@/components/ArtistsPage";
import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(() =>
  getPage({ slug: "artists" }),
);

const ArtistsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  // Read here and handed down because only a route segment can: the listing
  // sits below a Suspense boundary and cannot ask for the URL it is paged by.
  searchParams: Promise<{ page: string }>;
}) => {
  const { locale } = await params;
  await setupSSR({ params });

  const currentPage = parseInt((await searchParams)?.page as string, 10) || 0;

  return (
    <ProfilesListSection
      locale={locale}
      currentPage={currentPage}
      slug="artists"
      baseUrl="/artists"
    />
  );
};

export default ArtistsPage;
