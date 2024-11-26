import { Event } from "@/components";
import { getEvent } from "@venuecms/sdk";
import { notFound } from "next/navigation";

const EventsPage = async ({
  params: { slug },
}: {
  params: { slug: string; locale: string };
}) => {
  const { data: event } = await getEvent({ slug });
  if (!event) {
    notFound();
  }

  return <Event event={event} />;
};

export default EventsPage;
