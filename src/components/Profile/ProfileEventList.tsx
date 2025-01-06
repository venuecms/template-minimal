import { Site, getProfileEvents } from "@venuecms/sdk";

import { EventsList, ListEvent } from "@/components/EventList";

export const ProfileEventList = async ({
  header,
  slug,
  site,
  filter,
}: {
  header: string;
  slug: string;
  site: Site;
  filter?: { upcoming?: boolean; lt?: number };
}) => {
  const { data: events } = await getProfileEvents({ slug, ...filter });

  return events?.records.length ? (
    <div className="flex flex-col gap-6">
      <h2 className="text-primary text-sm py-0 m-0">{header}</h2>
      <EventsList>
        {events.records.map((event) => (
          <ListEvent key={event.id} event={event} site={site} />
        ))}
      </EventsList>
    </div>
  ) : null;
};

export const ProfileEventListSkeleton = ({
  numElements = 2,
}: {
  numElements?: number;
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-4 bg-primary opacity-[3%] w-1/4" />
      <EventsList>
        {Array.from({ length: numElements }).map((_, index) => (
          <div key={index} className="h-16 bg-primary opacity-[3%] w-[90%]" />
        ))}
      </EventsList>
    </div>
  );
};
