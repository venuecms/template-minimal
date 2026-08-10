import { Event } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { type SearchParams, getEvent, getSite } from "@venuecms/sdk-next";
import { notFound } from "next/navigation";

import { setupSSR } from "@/components/utils";

export const generateMetadata = getGenerateMetadata(getEvent);

const EventsPage = async ({
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

  const [{ data: event }, { data: site }] = await Promise.all([
    getEvent({ slug }),
    getSite(),
  ]);

  if (!event || !site) {
    notFound();
  }

  return <Event event={event} site={site} searchParams={await searchParams} />;
};

export default EventsPage;
