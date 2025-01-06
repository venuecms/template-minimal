import { Site, getProfileEvents } from "@venuecms/sdk";

import { EventsList, ListEvent } from "@/components/EventList";

export const ProfileEventList = async ({
  slug,
  site,
}: {
  slug: string;
  site: Site;
}) => {
  const { data: events } = await getProfileEvents({ slug });
  return events ? (
    <div className="flex flex-col gap-6">
      <h2 className="text-primary text-sm py-0 m-0">Events</h2>
      <EventsList>
        {events.records.map((event) => (
          <ListEvent key={event.id} event={event} site={site} />
        ))}
      </EventsList>
    </div>
  ) : null;
};
