import { Event } from "@/components";
import { getGenerateMetadata } from "@/lib";
import { Params } from "@/types";
import { getEvent, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

export const generateMetadata = getGenerateMetadata(getEvent);

const EventsPage = async ({
  params,
}: {
  params: Promise<{ slug: string } & Params>;
}) => {
  const { slug, siteKey } = await params;
  setConfig({ siteKey });

  const { data: event } = await getEvent({ slug });

  if (!event) {
    notFound();
  }

  return <Event event={event} />;
};

export default EventsPage;
