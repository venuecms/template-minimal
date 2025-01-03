import { Event } from "@/components";
import { Params } from "@/types";
import { getEvent, setConfig } from "@venuecms/sdk";
import { notFound } from "next/navigation";

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
